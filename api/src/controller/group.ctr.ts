/**
 * @file   routes/group.ts — 用户分组路由（超管）
 * @routes GET    /group       — 分组列表（含成员数子查询）
 *         POST   /group       — 创建分组
 *         PUT    /group/:id   — 编辑分组名
 *         DELETE /group/:id   — 删除分组（需无成员）
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { createGroupSchema } from '@/model/group.dto'
import { GroupService } from '@/service/group.svc'
import { requireRole } from '@/middleware/role.mid'
import { success, fail } from '@/hono/response'
import { ErrorCode } from '@/codes'

const groupRouter = new Hono<AppEnv>()

// ── GET /group ── 分组列表 + member_count
groupRouter.get('/', requireRole('superadmin'), async (c) => {
  const _db = c.get('db')
  const _groups = await GroupService.list(_db)
  return success(c, _groups)
})

// ── POST /group ── 创建
groupRouter.post('/', requireRole('superadmin'), async (c) => {
  const _parsed = createGroupSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _result = await GroupService.create(_db, _parsed.data)
  return success(c, _result)
})

// ── PUT /group/:id ── 编辑
groupRouter.put('/:id', requireRole('superadmin'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _parsed = createGroupSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _result = await GroupService.update(_db, _id, _parsed.data)
  return success(c, _result)
})

// ── DELETE /group/:id ── 删除
groupRouter.delete('/:id', requireRole('superadmin'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _viewer = c.get('user')
  const _db = c.get('db')
  await GroupService.delete(_db, _id, _viewer.id)
  return success(c, null)
})

export default groupRouter
