/**
 * @file   api.contact.test.ts — 联系人路由集成测试
 * @desc   覆盖 contact 路由全部端点的请求/返回值
 */
import { describe, it, expect, beforeAll } from 'bun:test'
import { Hono } from 'hono'
import { auth } from '../middleware/auth.mid'
import { makeToken } from '../service/auth.svc'
import contactRouter from '../controller/contact.ctr'
import { dbHook, paginateHook } from '../middleware/hook.mid'
import { AppError } from '../hono/AppError'
import { fail } from '../hono/response'
import { ErrorCode } from '@/codes'
import { createTestDB, wrapAsD1, TEST_SECRET as SECRET } from './helpers/d1'

type App = ReturnType<typeof createApp>

function createApp(db: D1Database) {
  const _app = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string }; Variables: { user: any } }>()
  _app.use('*', async (c, next) => { (c.env as any) = { DB: db, JWT_SECRET: SECRET }; await next() })
  _app.use('*', dbHook, paginateHook)
  _app.onError((_error, c) => {
    if (_error instanceof AppError) {
      return fail(c, _error.code, _error.message)
    }
    return fail(c, ErrorCode.INTERNAL_ERROR)
  })
  _app.use('/api/*', auth)
  _app.route('/api/contact', contactRouter)
  return _app
}

async function authHeader(payload: Record<string, unknown>) {
  const _token = await makeToken({ status: 'active', ...payload }, SECRET)
  return { Authorization: `Bearer ${_token}`, 'Content-Type': 'application/json' }
}

// ═══ GET /api/contact — 总库列表 ═══

describe('GET /api/contact', () => {
  it('manager 可访问总库列表', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/contact', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.list).toBeDefined()
    expect(_json.data.total_count).toBeDefined()
    expect(_json.data.page_index).toBe(1)
  })

  it('staff 无权限 → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })

  it('支持 status 筛选和分页', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+8613800001111', 'undeveloped')`)
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+8613800002222', 'developed')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/contact?status=undeveloped&page=1&size=10', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.total_count).toBe(1)
    expect(_json.data.list[0].status).toBe('undeveloped')
  })
})

// ═══ GET /api/contact/search — 搜索 ═══

describe('GET /api/contact/search', () => {
  it('搜索到结果 → 返回脱敏数据', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id, data) VALUES ('+8613800001111', 'developed', 99, '{"name":"张三"}')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/search?q=138000', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.length).toBe(1)
    expect(_json.data[0]._is_masked).toBe(true)
  })

  it('搜索词过短 → code < 0', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/search?q=1', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })

  it('搜索无结果 → code < 0', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/search?q=notexist', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })
})

// ═══ GET /api/contact/:id — 详情 ═══

describe('GET /api/contact/:id', () => {
  it('联系人存在 → 返回详情', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (id, phone, status, owner_id, data) VALUES (1, '+8613800001111', 'developed', 1, '{}')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/1', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
  })

  it('不存在的联系人 → code < 0', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/999', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })
})

// ═══ POST /api/contact/claim — 认领 ═══

describe('POST /api/contact/claim', () => {
  it('新号码 → 创建并认领', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/claim', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ phone: '+8613800001111' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.status).toBe('developed')
    expect(_json.data.phone).toBe('+8613800001111')
  })

  it('未开发号码 → 抢占成功', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+8613800001111', 'undeveloped')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/claim', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ phone: '+8613800001111' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.status).toBe('developed')
  })

  it('超大与畸形的边界 Data Payload (数组和嵌套注入) → z.unknown() 抵御', async () => {
    const _sqlite = createTestDB()
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    
    // Zod record() 的规则：如果传了数组当 record，应该被 Zod 拦截，拦截了返回 BAD_REQUEST(-400)
    // 甚至连 Service 层都进不去
    const _res_array = await _app.request('/api/contact/claim', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ phone: '+8613800009999', data: ['array_instead_of_object'] }),
    })
    expect((await _res_array.json() as any).code).toBe(-403)

    // 巨大的嵌套对象，由于是 record(z.unknown())，可以放行并且利用 stringify 存入 SQLite JSON
    const _huge_data = { depth1: { depth2: { hacker_attack: "'; DROP TABLE contact; --" } } }
    const _res_nest = await _app.request('/api/contact/claim', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ phone: '+8613800009999', data: _huge_data }),
    })
    expect((await _res_nest.json() as any).code).toBe(1)
    
    const _contact = _sqlite.prepare('SELECT * FROM contact WHERE phone = ?').get('+8613800009999') as any
    expect(_contact.data).toContain('hacker_attack')
  })

  it('已开发号码 → 碰撞 code=-201', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+8613800001111', 'developed', 99)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/claim', {
      method: 'POST', headers: _h,
      body: JSON.stringify({ phone: '+8613800001111' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-201)
  })

  it('缺少 phone 字段 → code < 0', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'staff', group_id: 1 })
    const _res = await _app.request('/api/contact/claim', {
      method: 'POST', headers: _h,
      body: JSON.stringify({}),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })
})

// ═══ PUT /api/contact/:id/revoke — 撤销 ═══

describe('PUT /api/contact/:id/revoke', () => {
  it('超管 + 正确安全词 → 撤销成功', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (id, phone, status, owner_id) VALUES (1, '+8613800001111', 'developed', 42)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/contact/1/revoke', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ confirm_word: '确认撤销' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.status).toBe('undeveloped')
  })

  it('安全词不匹配 → code=-203', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (id, phone, status, owner_id) VALUES (1, '+8613800001111', 'developed', 42)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/contact/1/revoke', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ confirm_word: '错误' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-203)
  })

  it('非超管 → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/contact/1/revoke', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ confirm_word: '确认撤销' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })
})

// ═══ PUT /api/contact/transfer — 转移 ═══

describe('PUT /api/contact/transfer', () => {
  it('manager 批量转移 → code 1', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+8613800001111', 'developed', 10)`)
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+8613800002222', 'developed', 10)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/contact/transfer', {
      method: 'PUT', headers: _h,
      body: JSON.stringify({ from_user_id: 10, to_user_id: 20, scope: 'all' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
  })
})

// ═══ DELETE /api/contact/:id — 删除 ═══

describe('DELETE /api/contact/:id', () => {
  it('超管删除 → code 1', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (id, phone, status) VALUES (1, '+8613800001111', 'undeveloped')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'superadmin' })
    const _res = await _app.request('/api/contact/1', { method: 'DELETE', headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
  })

  it('非超管删除 → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager', group_id: 1 })
    const _res = await _app.request('/api/contact/1', { method: 'DELETE', headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })
})
