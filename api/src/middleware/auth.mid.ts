/**
 * @file   auth.ts — JWT 认证中间件
 * @desc   从 Authorization: Bearer <token> 中提取并验证 JWT（HMAC-SHA256），
 *         验证通过后将 payload 注入 c.set('user', payload) 供后续路由使用
 * @security 使用 Web Crypto API 验签，兼容 Workers 环境
 */
import type { Context, Next } from 'hono'
import { ErrorCode } from '@/codes'
import { fail } from '@/hono/response'

export async function auth(c: Context, next: Next) {
  const _header = c.req.header('Authorization')
  if (!_header?.startsWith('Bearer ')) {
    return fail(c, ErrorCode.UNAUTHORIZED)
  }

  const _token = _header.slice(7)
  try {
    const _secret = (c.env as any).JWT_SECRET
    const _key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(_secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    const [_header_b64, _payload_b64, _sig_b64] = _token.split('.')
    const _sig = Uint8Array.from(atob(_sig_b64.replace(/-/g, '+').replace(/_/g, '/')), _ch => _ch.charCodeAt(0))
    const _data = new TextEncoder().encode(`${_header_b64}.${_payload_b64}`)
    const _valid = await crypto.subtle.verify('HMAC', _key, _sig, _data)
    if (!_valid) return fail(c, ErrorCode.UNAUTHORIZED)

    const _payload = JSON.parse(atob(_payload_b64.replace(/-/g, '+').replace(/_/g, '/')))
    if (_payload.exp && _payload.exp < Math.floor(Date.now() / 1000)) {
      return fail(c, ErrorCode.TOKEN_EXPIRED)
    }

    c.set('user', _payload)
    await next()
  } catch {
    return fail(c, ErrorCode.UNAUTHORIZED)
  }
}
