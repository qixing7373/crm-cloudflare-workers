/**
 * @file   routes/auth.ts — 认证路由（公开，无需 JWT）
 * @routes POST /auth/register — 邀请码注册（直接激活）
 *         POST /auth/login    — 登录（返回 JWT）
 *         GET  /auth/check    — 令牌校验
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { ErrorCode } from '@/codes'
import { success, fail } from '@/hono/response'
import { registerSchema, loginSchema } from '@/model/auth.dto'
import { registerUser, loginUser } from '@/service/auth.svc'
import { auth } from '@/middleware/auth.mid'

const authRouter = new Hono<AppEnv>()

// ── POST /auth/register ──
authRouter.post('/register', async (c) => {
  const _parsed = registerSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.INVALID_USERNAME)

  const _db = c.get('db')
  const _result = await registerUser(_parsed.data, _db, c.env.JWT_SECRET)
  
  return success(c, _result)
})

// ── POST /auth/login ──
authRouter.post('/login', async (c) => {
  const _parsed = loginSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.INVALID_CREDENTIALS)

  const _db = c.get('db')
  const _ip = c.req.header('CF-Connecting-IP') || 'unknown'
  const _result = await loginUser(_parsed.data, _db, c.env.JWT_SECRET, _ip)

  return success(c, _result)
})

// ── GET /auth/check ── 需要 JWT，手动挂 auth（因为 /auth 是公开前缀）
authRouter.get('/check', auth, async (c) => {
  const _user = c.get('user')
  return success(c, { id: _user.id, username: _user.username, role: _user.role })
})

// ── PUT /auth/password ── 修改当前用户密码
import { changePasswordSchema } from '@/model/auth.dto'
import { changePassword } from '@/service/auth.svc'

authRouter.put('/password', auth, async (c) => {
  const _parsed = changePasswordSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _user = c.get('user')
  const _result = await changePassword(_db, _user.id, _parsed.data.old_password, _parsed.data.new_password)
  return success(c, _result)
})

export default authRouter
