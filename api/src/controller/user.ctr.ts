/**
 * @file   routes/user.ts — 用户管理路由
 * @routes GET  /user              — 用户列表（超管全量，manager 同组）
 *         POST /user              — 创建账号（manager+）
 *         PUT  /user/:id/status   — 启用/禁用（禁用联动释放私海资源）
 *         PUT  /user/:id/role     — 修改角色（超管）
 *         PUT  /user/:id/group    — 调整分组（超管）
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { createUserSchema, statusSchema, roleSchema, groupAssignSchema } from '@/model/user.dto'
import { UserService } from '@/service/user.svc'
import { requireRole } from '@/middleware/role.mid'
import { success, fail } from '@/hono/response'
import { ErrorCode } from '@/codes'

const userRouter = new Hono<AppEnv>()

// ── GET /user ── 用户列表
userRouter.get('/', requireRole('manager'), async (c) => {
  const _viewer = c.get('user')
  const _db = c.get('db')
  const _list = await UserService.list(_db, _viewer)
  return success(c, _list)
})

// ── POST /user ── 创建账号
userRouter.post('/', requireRole('manager'), async (c) => {
  const _parsed = createUserSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _viewer = c.get('user')
  const _result = await UserService.create(_db, _parsed.data, _viewer)
  return success(c, _result)
})

// ── PUT /user/:id/status ── 审核/禁用
userRouter.put('/:id/status', requireRole('manager'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _parsed = statusSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _viewer = c.get('user')
  const _result = await UserService.setStatus(_db, _id, _parsed.data.status, _viewer)
  return success(c, _result)
})

// ── PUT /user/:id/role ── 修改角色（超管）
userRouter.put('/:id/role', requireRole('superadmin'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _parsed = roleSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _result = await UserService.setRole(_db, _id, _parsed.data.role)
  return success(c, _result)
})

// ── PUT /user/:id/group ── 调整分组（超管）
userRouter.put('/:id/group', requireRole('superadmin'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _parsed = groupAssignSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _result = await UserService.setGroup(_db, _id, _parsed.data.group_id)
  return success(c, _result)
})

// ── PUT /user/:id/password ── 重置密码（manager+）
import { passwordResetSchema } from '@/model/user.dto'

userRouter.put('/:id/password', requireRole('manager'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _parsed = passwordResetSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _viewer = c.get('user')
  const _result = await UserService.resetPassword(_db, _id, _parsed.data.password, _viewer)
  return success(c, _result)
})

export default userRouter
