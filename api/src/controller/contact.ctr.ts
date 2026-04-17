/**
 * @file   routes/contact.ts — 联系人（资源）路由
 * @routes GET    /contact          — 总库列表（manager+）
 *         GET    /contact/search   — 搜索（全角色，含脱敏+审计）
 *         GET    /contact/:id      — 详情
 *         POST   /contact/claim    — 认领（乐观锁抢占）
 *         PUT    /contact/:id/revoke   — 撤销认领（超管，需安全词）
 *         PUT    /contact/transfer     — 批量转移（manager+）
 *         DELETE /contact/:id          — 软删除（超管）
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { claimSchema, revokeSchema, transferSchema } from '@/model/contact.dto'
import { ContactService } from '@/service/contact.svc'
import { requireRole } from '@/middleware/role.mid'
import { success, fail, paginate } from '@/hono/response'
import { ErrorCode } from '@/codes'

const contactRouter = new Hono<AppEnv>()

// ── GET /contact ── 总库列表（全角色，staff按owner_id隔离）
contactRouter.get('/', async (c) => {
  const _db = c.get('db')
  const _viewer = c.get('user')
  const { page: _page, size: _size, offset: _offset } = c.get('page_info')
  const _status = c.req.query('status')
  const _q = c.req.query('q')?.trim()
  const _tailOnly = c.req.query('tail_only') === '1'

  const { list, total } = await ContactService.list(_db, _viewer, {
    offset: _offset, size: _size,
    status: _status, q: _q, tailOnly: _tailOnly,
  })

  return paginate(c, list, total, _page, _size)
})

// ── GET /contact/search ── 搜索（全角色，含脱敏+审计）
contactRouter.get('/search', async (c) => {
  const _q = c.req.query('q')?.trim()
  const _tailOnly = c.req.query('tail_only') === '1'
  if (!_q || _q.length < 2) return fail(c, ErrorCode.PHONE_NOT_FOUND)

  const _viewer = c.get('user')
  const _db = c.get('db')
  const _masked = await ContactService.search(_db, _q, _tailOnly, _viewer)
  return success(c, _masked)
})

// ── GET /contact/:id ── 详情
contactRouter.get('/:id', async (c) => {
  const _id = Number(c.req.param('id'))
  const _viewer = c.get('user')
  const _db = c.get('db')
  const _masked = await ContactService.detail(_db, _id, _viewer)
  return success(c, _masked)
})

// ── POST /contact/claim ── 认领
contactRouter.post('/claim', async (c) => {
  const _parsed = claimSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _viewer = c.get('user')
  const _db = c.get('db')
  const _result = await ContactService.claim(_parsed.data, _viewer.id, _db)
  return success(c, _result)
})

// ── PUT /contact/:id ── 编辑（基础信息与动态字段）
import { updateContactSchema } from '@/model/contact.dto'
contactRouter.put('/:id', async (c) => {
  const _id = Number(c.req.param('id'))
  const _parsed = updateContactSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _viewer = c.get('user')
  const _result = await ContactService.update(_db, _id, _parsed.data, _viewer.id)
  return success(c, _result)
})

// ── PUT /contact/:id/revoke ── 撤销（超管）
contactRouter.put('/:id/revoke', requireRole('superadmin'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _parsed = revokeSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.CONFIRM_MISMATCH)

  if (_parsed.data.confirm_word !== '确认撤销') {
    return fail(c, ErrorCode.CONFIRM_MISMATCH)
  }

  const _db = c.get('db')
  const _viewer = c.get('user')
  const _result = await ContactService.revoke(_db, _id, _viewer.id)
  return success(c, _result)
})

// ── PUT /contact/transfer ── 转移（manager+）
contactRouter.put('/transfer', requireRole('manager'), async (c) => {
  const _parsed = transferSchema.safeParse(await c.req.json())
  if (!_parsed.success) return fail(c, ErrorCode.BAD_REQUEST)

  const _db = c.get('db')
  const _viewer = c.get('user')
  await ContactService.transfer(_db, _parsed.data, _viewer.id)
  return success(c, null)
})

// ── DELETE /contact/:id ── 软删除（超管）
contactRouter.delete('/:id', requireRole('superadmin'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _db = c.get('db')
  const _viewer = c.get('user')
  await ContactService.delete(_db, _id, _viewer.id)
  return success(c, null)
})

export default contactRouter
