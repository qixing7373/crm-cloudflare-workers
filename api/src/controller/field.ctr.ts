/**
 * @file   routes/field.ts — 动态字段配置路由（超管）
 * @routes GET    /field       — 全角色可访问的字段列表
 *         POST   /field       — 新增字段
 *         PUT    /field/:id   — 编辑字段
 *         DELETE /field/:id   — 禁用字段（enabled=false）
 *         PUT    /field/sort  — 批量排序
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { createFieldSchema, updateFieldSchema, sortFieldSchema } from '@/model/field.dto'
import { FieldService } from '@/service/field.svc'
import { requireRole } from '@/middleware/role.mid'
import { success, fail } from '@/hono/response'
import { ErrorCode } from '@/codes'

const fieldRouter = new Hono<AppEnv>()

// ── GET /field ── 全角色可访问
fieldRouter.get('/', async (c) => {
  const _db = c.get('db')
  const _fields = await FieldService.list(_db)
  return success(c, _fields)
})

// ── POST /field ── 新增（超管）
fieldRouter.post('/', requireRole('superadmin'), async (c) => {
  const _parsed = createFieldSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _viewer = c.get('user')
  const _result = await FieldService.create(_db, _parsed.data, _viewer.id)
  return success(c, _result)
})

// ── PUT /field/sort ── 批量排序
fieldRouter.put('/sort', requireRole('superadmin'), async (c) => {
  const _parsed = sortFieldSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _viewer = c.get('user')
  await FieldService.sort(_db, _parsed.data.ids, _viewer.id)
  return success(c, null)
})

// ── PUT /field/:id ── 编辑（超管）
fieldRouter.put('/:id', requireRole('superadmin'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _parsed = updateFieldSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _viewer = c.get('user')
  const _result = await FieldService.update(_db, _id, _parsed.data, _viewer.id)
  return success(c, _result)
})

// ── DELETE /field/:id ── 禁用（超管）
fieldRouter.delete('/:id', requireRole('superadmin'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _db = c.get('db')
  const _viewer = c.get('user')
  await FieldService.disable(_db, _id, _viewer.id)
  return success(c, null)
})

export default fieldRouter
