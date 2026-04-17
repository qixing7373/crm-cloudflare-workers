/**
 * @file   api.invite.test.ts — 邀请码路由集成测试
 * @desc   覆盖 invite 路由权限和返回值
 */
import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import { auth } from '../middleware/auth.mid'
import { makeToken } from '../service/auth.svc'
import inviteRouter from '../controller/invite.ctr'
import { dbHook, paginateHook } from '../middleware/hook.mid'
import { createTestDB, wrapAsD1, TEST_SECRET as SECRET } from './helpers/d1'
import { AppError } from '../hono/AppError'
import { fail } from '../hono/response'
import { ErrorCode } from '@/codes'

function createApp(db: D1Database) {
  const _app = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string }; Variables: { user: any } }>()
  _app.use('*', async (c, next) => { (c.env as any) = { DB: db, JWT_SECRET: SECRET }; await next() })
  _app.use('*', dbHook, paginateHook)
  _app.use('/api/*', auth)
  _app.route('/api/invite', inviteRouter)
  _app.onError((_error, c) => {
    if (_error instanceof AppError) return fail(c, _error.code, _error.message)
    return fail(c, ErrorCode.INTERNAL_ERROR)
  })
  return _app
}

async function authHeader(payload: Record<string, unknown>) {
  const _token = await makeToken({ status: 'active', ...payload }, SECRET)
  return { Authorization: `Bearer ${_token}` }
}

describe('GET /api/invite/code', () => {
  it('manager 可获取邀请码', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/invite/code', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.code).toBeDefined()
    expect(_json.data.code.length).toBe(6)
    expect(_json.data.expires).toBeDefined()
    expect(_json.data.hint).toContain('零点')
  })

  it('superadmin 可获取邀请码', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/invite/code', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.code.length).toBe(6)
  })

  it('staff 无权限 → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/invite/code', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })

  it('不同用户生成不同邀请码', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h1 = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _h2 = await authHeader({ id: 2, role: 'manager', group_id: 1 })
    const _r1 = await _app.request('/api/invite/code', { headers: _h1 })
    const _r2 = await _app.request('/api/invite/code', { headers: _h2 })
    const _j1 = await _r1.json() as any
    const _j2 = await _r2.json() as any
    expect(_j1.data.code).not.toBe(_j2.data.code)
  })

  it('同一用户多次请求返回同一邀请码', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _r1 = await _app.request('/api/invite/code', { headers: _h })
    const _r2 = await _app.request('/api/invite/code', { headers: _h })
    const _j1 = await _r1.json() as any
    const _j2 = await _r2.json() as any
    expect(_j1.data.code).toBe(_j2.data.code)
  })
})
