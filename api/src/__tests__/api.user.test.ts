/**
 * @file   api.user.test.ts — 用户管理路由集成测试
 * @desc   覆盖 user 路由全部端点：列表、创建、启用/禁用、角色、分组
 */
import { describe, it, expect, beforeAll } from 'bun:test'
import { Hono } from 'hono'
import { auth } from '../middleware/auth.mid'
import { makeToken, hashPassword } from '../service/auth.svc'
import userRouter from '../controller/user.ctr'
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
  _app.route('/api/user', userRouter)
  _app.onError((_error, c) => {
    if (_error instanceof AppError) return fail(c, _error.code, _error.message)
    return fail(c, ErrorCode.INTERNAL_ERROR)
  })
  return _app
}

async function authHeader(payload: Record<string, unknown>) {
  const _token = await makeToken({ status: 'active', ...payload }, SECRET)
  return { Authorization: `Bearer ${_token}`, 'Content-Type': 'application/json' }
}

// ═══ GET /api/user ═══

describe('GET /api/user', () => {
  it('superadmin → 返回全部用户', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u1', 'x', 'staff', 'active', 1)`)
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u2', 'x', 'staff', 'active', 2)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'superadmin', group_id: null })
    const _res = await _app.request('/api/user', { headers: _h })
    expect(_res.status).toBe(200)
    const _json = await _res.json() as any
    expect(_json.data.length).toBe(2)
    // 不应返回密码字段
    expect(_json.data[0].password).toBeUndefined()
  })

  it('manager → 只返回同组用户', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u1', 'x', 'staff', 'active', 1)`)
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u2', 'x', 'staff', 'active', 2)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/user', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.length).toBe(1)
    expect(_json.data[0].group_id).toBe(1)
  })
})

// ═══ POST /api/user — 创建 ═══

describe('POST /api/user', () => {
  it('manager 创建用户 → 201', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/user', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ username: 'newuser', password: 'Admin123', role: 'staff' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.id).toBeDefined()
  })

  it('重复用户名 → 409', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (username, password, role, status) VALUES ('existing', 'x', 'staff', 'active')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/user', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ username: 'existing', password: 'Admin123' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-100)
  })
})

// ═══ PUT /api/user/:id/status — 启用/禁用 ═══

describe('PUT /api/user/:id/status', () => {
  it('禁用联动 → 释放该用户的私海资源', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (10, 'u1', 'x', 'staff', 'active', 1)`)
    _sqlite.run(`INSERT INTO contact (id, phone, status, owner_id) VALUES (1, '+86138', 'developed', 10)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/user/10/status', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ status: 'disabled' }),
    })
    expect(_res.status).toBe(200)
    // 验证联系人被释放
    const _contact = _sqlite.prepare('SELECT status, owner_id FROM contact WHERE id = 1').get() as any
    expect(_contact.status).toBe('undeveloped')
    expect(_contact.owner_id).toBeNull()
  })

  it('manager 操作不同组用户 → 403', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (10, 'u1', 'x', 'staff', 'active', 2)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/user/10/status', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ status: 'disabled' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })
})

// ═══ PUT /api/user/:id/role ═══

describe('PUT /api/user/:id/role', () => {
  it('超管修改角色 → 200', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status) VALUES (10, 'u1', 'x', 'staff', 'active')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/user/10/role', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ role: 'manager' }),
    })
    expect(_res.status).toBe(200)
    expect((await _res.json() as any).data.role).toBe('manager')
  })

  it('非超管 → 403', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/user/10/role', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ role: 'superadmin' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })
})

// ═══ PUT /api/user/:id/group ═══

describe('PUT /api/user/:id/group', () => {
  it('超管调整分组 → 200', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status) VALUES (10, 'u1', 'x', 'staff', 'active')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/user/10/group', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ group_id: 5 }),
    })
    expect(_res.status).toBe(200)
    expect((await _res.json() as any).data.group_id).toBe(5)
  })
})
