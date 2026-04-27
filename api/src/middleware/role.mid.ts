/**
 * @file   role.ts — 角色鉴权中间件
 * @desc   requireRole(min) — 按 ROLE_LEVEL 层级校验最低角色要求
 */
import type { Context, Next } from 'hono'
import { ROLE_LEVEL } from '@/consts'
import { ErrorCode } from '@/codes'
import { fail } from '@/hono/response'

type RoleName = keyof typeof ROLE_LEVEL

export function requireRole(min_role: RoleName) {
  return async (c: Context, next: Next) => {
    const _user = c.get('user') as any
    if (!_user) return fail(c, ErrorCode.UNAUTHORIZED)
    if (_user.status !== 'active') return fail(c, ErrorCode.ACCOUNT_DISABLED)
    if ((ROLE_LEVEL[_user.role as RoleName] ?? 0) < ROLE_LEVEL[min_role]) {
      return fail(c, ErrorCode.FORBIDDEN)
    }
    await next()
  }
}
