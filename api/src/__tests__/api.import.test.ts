/**
 * @file   api.import.test.ts — 导入路由集成测试
 * @desc   覆盖 import 路由权限及基本的路由端点测试
 */
import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import { auth } from '../middleware/auth.mid'
import { makeToken } from '../service/auth.svc'
import importRouter from '../controller/import.ctr'
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
  _app.route('/api/import', importRouter)
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

describe('IMPORT 路由集成测试', () => {
  it('GET /api/import/history → manager 放行', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO import_log (user_id, file, total, frozen, skipped) VALUES (1, 'test.csv', 10, 0, 0)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)

    const _h = await authHeader({ id: 1, role: 'manager' })
    const _res = await _app.request('/api/import/history', { headers: _h })
    expect(_res.status).toBe(200)
    const _json = await _res.json() as any
    expect(_json.data.list.length).toBe(1)
  })

  it('GET /api/import/history → staff 拒绝 (需 manager+)', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    
    const _h = await authHeader({ id: 2, role: 'staff' })
    const _res = await _app.request('/api/import/history', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })

  it('GET /api/import/:id → 明细', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (id, phone, status, import_count) VALUES (99, '+861', 'undeveloped', 1)`)
    _sqlite.run(`INSERT INTO import_log (id, user_id, total, frozen, skipped) VALUES (10, 1, 10, 0, 0)`)
    _sqlite.run(`INSERT INTO contact_log (import_id, contact_id, user_id, type, changes) VALUES (10, 99, 1, 'create', '{}')`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)

    const _h = await authHeader({ id: 1, role: 'manager' })
    const _res = await _app.request('/api/import/10', { headers: _h })
    const _json = await _res.json() as any
    expect(_json.data.details.length).toBe(1)
    expect(_json.data.log.id).toBe(10)
  })

  it('POST /api/import/sync → 缺少必填参数直接拒绝', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager' })
    
    // 不传 clean_list 和 file_name
    const _res = await _app.request('/api/import/sync', {
      method: 'POST',
      headers: { ..._h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_hash: 'abc' }),
    })
    
    const _json = await _res.json() as any
    // Unsupported format
    expect(_json.code).toBe(ErrorCode.UNSUPPORTED_FORMAT)
  })

  it('POST /api/import/sync → 正常导入入库', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager' })
    
    const _res = await _app.request('/api/import/sync', {
      method: 'POST',
      headers: { ..._h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        file_hash: 'testhash',
        file_name: 'test.csv',
        clean_list: [
          { phone: '+8613800138000', data: { name: 'Test' } }
        ]
      }),
    })
    
    expect(_res.status).toBe(200)
    const _json = await _res.json() as any
    expect(_json.code).toBeGreaterThanOrEqual(0)
  })

  it('GET /api/import/verify-hash → 测试重复哈希拦截', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO import_log (user_id, file, file_hash, total, frozen, skipped) VALUES (1, 'dup.csv', 'dummy_duplicate_hash', 10, 0, 0)`)
    
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 1, role: 'manager' })

    // 1. 已存在的哈希应当返回 exists: true
    let _res = await _app.request('/api/import/verify-hash?hash=dummy_duplicate_hash', { headers: _h })
    expect(_res.status).toBe(200)
    let _json = await _res.json() as any
    expect(_json.data.exists).toBe(true)

    // 2. 不存在的哈希应当返回 exists: false
    _res = await _app.request('/api/import/verify-hash?hash=never_seen_hash', { headers: _h })
    expect(_res.status).toBe(200)
    _json = await _res.json() as any
    expect(_json.data.exists).toBe(false)
    
    // 3. 缺少哈希参数应当返回 BAD_REQUEST
    _res = await _app.request('/api/import/verify-hash', { headers: _h })
    _json = await _res.json() as any
    expect(_json.code).toBe(ErrorCode.BAD_REQUEST)
  })
})
