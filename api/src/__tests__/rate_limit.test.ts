/**
 * @file   rate_limit.test.ts — 限流中间件测试
 */
import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'
import { rateLimit } from '@/middleware/rateLimit.mid'
import { success } from '@/hono/response'

describe('rateLimit', () => {
  it('超过窗口内上限后返回 RATE_LIMITED', async () => {
    const app = new Hono()
    app.use('*', rateLimit)
    app.get('/api/ping', (c) => success(c, { ok: true }))

    const env = { RATE_LIMIT_PER_MINUTE: '2', RATE_LIMIT_WINDOW_SECONDS: '60' }
    const headers = { 'cf-connecting-ip': '203.0.113.77' }

    const first = await app.fetch(new Request('http://test/api/ping', { headers }), env)
    const second = await app.fetch(new Request('http://test/api/ping', { headers }), env)
    const third = await app.fetch(new Request('http://test/api/ping', { headers }), env)

    expect((await first.json() as any).code).toBe(1)
    expect((await second.json() as any).code).toBe(1)
    expect((await third.json() as any).code).toBe(-402)
  })

  it('未配置 RATE_LIMIT_PER_MINUTE 时不启用限流', async () => {
    const app = new Hono()
    app.use('*', rateLimit)
    app.get('/api/ping-open', (c) => success(c, { ok: true }))

    const headers = { 'cf-connecting-ip': '203.0.113.88' }
    for (let i = 0; i < 5; i++) {
      const res = await app.fetch(new Request('http://test/api/ping-open', { headers }), {})
      expect((await res.json() as any).code).toBe(1)
    }
  })
})
