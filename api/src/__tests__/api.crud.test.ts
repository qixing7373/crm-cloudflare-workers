/**
 * @file   api.crud.test.ts — CRUD 路由集成测试
 * @desc   覆盖 group / field / stat / log / export 路由的全部端点
 */
import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import { auth } from '../middleware/auth.mid'
import { makeToken } from '../service/auth.svc'
import groupRouter from '../controller/group.ctr'
import fieldRouter from '../controller/field.ctr'
import statRouter from '../controller/stat.ctr'
import logRouter from '../controller/log.ctr'
import exportRouter from '../controller/export.ctr'
import { dbHook, paginateHook } from '../middleware/hook.mid'
import { createTestDB, wrapAsD1, TEST_SECRET as SECRET } from './helpers/d1'
import { AppError } from '../hono/AppError'
import { fail } from '../hono/response'
import { ErrorCode } from '@/codes'

function createApp(db: D1Database, ...routers: [string, any][]) {
  const _app = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string }; Variables: { user: any } }>()
  _app.use('*', async (c, next) => { (c.env as any) = { DB: db, JWT_SECRET: SECRET }; await next() })
  _app.use('*', dbHook, paginateHook)
  _app.use('/api/*', auth)
  for (const [path, router] of routers) _app.route(path, router)
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

// ═══════════════════════════════════════════
// ═══ GROUP 路由 ═══
// ═══════════════════════════════════════════

describe('GROUP CRUD', () => {
  it('GET /api/group → 分组列表含 member_count', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '销售一组')`)
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u1', 'x', 'staff', 'active', 1)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/group', groupRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/group', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data[0].name).toBe('销售一组')
    expect(_json.data[0].member_count).toBe(1)
  })

  it('POST /api/group → 创建分组', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db, ['/api/group', groupRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/group', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ name: '新组' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.name).toBe('新组')
  })

  it('POST /api/group → 重名 → code -403', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (name) VALUES ('已有组')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/group', groupRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/group', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ name: '已有组' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-403)
  })

  it('PUT /api/group/:id → 编辑名称', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '旧名')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/group', groupRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/group/1', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ name: '新名' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.name).toBe('新名')
  })

  it('DELETE /api/group/:id → 有成员时拒绝', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '组')`)
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u1', 'x', 'staff', 'active', 1)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/group', groupRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/group/1', { method: 'DELETE', headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })

  it('DELETE /api/group/:id → 无成员时成功', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '空组')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/group', groupRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/group/1', { method: 'DELETE', headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
  })
})

// ═══════════════════════════════════════════
// ═══ FIELD 路由 ═══
// ═══════════════════════════════════════════

describe('FIELD CRUD', () => {
  it('GET /api/field → 字段列表（全角色）', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (key, label) VALUES ('company', '公司')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/field', fieldRouter])
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/field', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.length).toBe(1)
    expect(_json.data[0].key).toBe('company')
  })

  it('POST /api/field → 新增字段', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db, ['/api/field', fieldRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/field', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ key: 'city', label: '城市' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.key).toBe('city')
  })

  it('POST /api/field → key 重复 → code < 0', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (key, label) VALUES ('city', '城市')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/field', fieldRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/field', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ key: 'city', label: '城市2' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })

  it('PUT /api/field/:id → 编辑编辑', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (id, key, label) VALUES (1, 'oldKey', '老字段')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/field', fieldRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/field/1', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ label: '新字段名称' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.id).toBe(1)
    const _dbField = _sqlite.prepare('SELECT label FROM contact_field WHERE id = 1').get() as any
    expect(_dbField.label).toBe('新字段名称')
  })

  it('PUT /api/field/:id → 非法参数报错', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db, ['/api/field', fieldRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/field/1', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ type: 'invalid_type' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })

  it('PUT /api/field/sort → 批量排序', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (id, key, label) VALUES (1, 'a', 'A')`)
    _sqlite.run(`INSERT INTO contact_field (id, key, label) VALUES (2, 'b', 'B')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/field', fieldRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/field/sort', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ ids: [2, 1] }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    const _f1 = _sqlite.prepare('SELECT sort FROM contact_field WHERE id = 1').get() as any
    const _f2 = _sqlite.prepare('SELECT sort FROM contact_field WHERE id = 2').get() as any
    expect(_f2.sort).toBe(0)
    expect(_f1.sort).toBe(1)
  })

  it('PUT /api/field/sort → 错误参数', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db, ['/api/field', fieldRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/field/sort', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ ids: 'invalid' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })

  it('DELETE /api/field/:id → 禁用字段', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (id, key, label) VALUES (1, 'city', '城市')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/field', fieldRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/field/1', { method: 'DELETE', headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    const _field = _sqlite.prepare('SELECT enabled FROM contact_field WHERE id = 1').get() as any
    expect(_field.enabled).toBe(0)
  })
})

// ═══════════════════════════════════════════
// ═══ STAT 路由 ═══
// ═══════════════════════════════════════════

describe('STAT 路由', () => {
  it('GET /api/stat/me → 个人统计', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+86138', 'developed', 42)`)
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+86139', 'developed', 42)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/stat', statRouter])
    const _h = await authHeader({ id: 42, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/stat/me', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.claimed_count).toBe(2)
    expect(_json.data.user_id).toBe(42)
  })

  it('GET /api/stat/group → 分组统计', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+86138', 'developed', 1)`)
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+86139', 'developed', 2)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/stat', statRouter])
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/stat/group', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.length).toBe(2)
  })

  it('GET /api/stat/overview → 全局概览', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+86138', 'developed')`)
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+86139', 'undeveloped')`)
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+86140', 'undeveloped')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/stat', statRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/stat/overview', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.total).toBe(3)
    expect(_json.data.developed).toBe(1)
    expect(_json.data.undeveloped).toBe(2)
    expect(_json.data.develop_rate).toBe('33.3%')
  })

  it('staff 不能看 overview → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db, ['/api/stat', statRouter])
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/stat/overview', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })
})

// ═══════════════════════════════════════════
// ═══ LOG 路由 ═══
// ═══════════════════════════════════════════

describe('LOG 路由', () => {
  it('GET /api/log/contact/:id → 变更时间轴', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_log (contact_id, user_id, import_id, type) VALUES (1, 1, 1, 'create')`)
    _sqlite.run(`INSERT INTO contact_log (contact_id, user_id, import_id, type) VALUES (1, 2, 2, 'update')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/log', logRouter])
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/log/contact/1', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.length).toBe(2)
  })

  it('GET /api/log → 全局审计分页', async () => {
    const _sqlite = createTestDB()
    for (let i = 0; i < 25; i++) {
      _sqlite.run(`INSERT INTO user_log (user_id, action, details) VALUES (1, 'login', '{}')`)
    }
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/log', logRouter])
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/log?page=1&size=10', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.list.length).toBe(10)
    expect(_json.data.total_count).toBe(25)
    expect(_json.data.page_index).toBe(1)
  })

  it('GET /api/log?action=login → action 筛选', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_log (user_id, action) VALUES (1, 'login')`)
    _sqlite.run(`INSERT INTO user_log (user_id, action) VALUES (1, 'search')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/log', logRouter])
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/log?action=login', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.total_count).toBe(1)
  })
})

// ═══════════════════════════════════════════
// ═══ EXPORT 路由 ═══
// ═══════════════════════════════════════════

describe('EXPORT 路由', () => {
  it('GET /api/export/contacts → CSV 导出', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status, data) VALUES ('+86138', 'developed', '{}')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db, ['/api/export', exportRouter])
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/export/contacts', { headers: _h })
    expect(_res.headers.get('Content-Type')).toContain('text/csv')
    expect(_res.headers.get('Content-Disposition')).toContain('contacts_')
    const _body = await _res.text()
    expect(_body).toContain('id,phone,status')
    expect(_body).toContain('+86138')
  })

  it('非超管导出 → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db, ['/api/export', exportRouter])
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/export/contacts', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })
})
