/**
 * @file   rateLimit.mid.ts — 基础接口限流
 * @desc   使用 Workers isolate 内存做轻量滑动窗口限流，适合拦截单客户端突发请求。
 *         多 isolate 场景仍建议叠加 Cloudflare WAF/Rate Limiting 规则。
 */
import type { Context, Next } from 'hono'
import { ErrorCode } from '@/codes'
import { fail } from '@/hono/response'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function toPositiveNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function clientKey(c: Context) {
  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'anonymous'
  return `${ip}:${c.req.method}:${new URL(c.req.url).pathname.split('/').slice(0, 3).join('/')}`
}

function prune(now: number) {
  if (buckets.size < 1000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export async function rateLimit(c: Context, next: Next) {
  const limit = Number((c.env as any).RATE_LIMIT_PER_MINUTE || 0)
  if (!Number.isFinite(limit) || limit <= 0) {
    await next()
    return
  }

  const windowSeconds = toPositiveNumber((c.env as any).RATE_LIMIT_WINDOW_SECONDS, 60)
  const now = Date.now()
  const key = clientKey(c)
  const current = buckets.get(key)

  prune(now)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    await next()
    return
  }

  if (current.count >= limit) {
    c.header('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)))
    return fail(c, ErrorCode.RATE_LIMITED)
  }

  current.count += 1
  await next()
}
