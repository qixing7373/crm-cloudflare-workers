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

  it('POST /api/import/sync → 支持批量上传已开发状态并可查看云端明细', async () => {
    const _sqlite = createTestDB()
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 7, role: 'manager' })

    const _res = await _app.request('/api/import/sync', {
      method: 'POST',
      headers: { ..._h, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_hash: 'status-hash',
        file_name: 'status.csv',
        clean_list: [
          { phone: '+8613800138001', data: { name: '已开发客户' }, status: 'developed' },
          { phone: '+8613800138002', data: { name: '普通客户' } },
        ]
      }),
    })

    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    const _developed = _sqlite.prepare('SELECT status, owner_id FROM contact WHERE phone = ?').get('+8613800138001') as any
    const _normal = _sqlite.prepare('SELECT status, owner_id FROM contact WHERE phone = ?').get('+8613800138002') as any
    expect(_developed.status).toBe('developed')
    expect(_developed.owner_id).toBe(7)
    expect(_normal.status).toBe('undeveloped')
    expect(_normal.owner_id).toBeNull()

    const _detailRes = await _app.request(`/api/import/${_json.data.import_id}`, { headers: _h })
    const _detailJson = await _detailRes.json() as any
    expect(_detailJson.data.details.length).toBe(2)
    expect(_detailJson.data.details[0].phone).toBeTruthy()
  })

  it('POST /api/import/sync → 已有未开发数据可批量升级为已开发', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, data, status, import_count) VALUES ('+8613800138011', '{"name":"旧客户"}', 'undeveloped', 1)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 8, role: 'manager' })

    const _res = await _app.request('/api/import/sync', {
      method: 'POST',
      headers: { ..._h, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_hash: 'upgrade-status-hash',
        file_name: 'upgrade.csv',
        clean_list: [
          { phone: '+8613800138011', data: { name: '新客户' }, status: 'developed' },
        ]
      }),
    })

    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.results[0].type).toBe('updated')
    expect(_json.data.results[0].changes.status.new).toBe('developed')

    const _contact = _sqlite.prepare('SELECT status, owner_id, import_count, data FROM contact WHERE phone = ?').get('+8613800138011') as any
    expect(_contact.status).toBe('developed')
    expect(_contact.owner_id).toBe(8)
    expect(_contact.import_count).toBe(2)
    expect(JSON.parse(_contact.data).name).toBe('新客户')
  })

  it('POST /api/import/sync → 重复和冻结行写入云端明细日志', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (id, phone, data, status, owner_id) VALUES (201, '+8613800138021', '{"name":"重复"}', 'undeveloped', null)`)
    _sqlite.run(`INSERT INTO contact (id, phone, data, status, owner_id) VALUES (202, '+8613800138022', '{"name":"冻结"}', 'developed', 99)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 9, role: 'manager' })

    const _res = await _app.request('/api/import/sync', {
      method: 'POST',
      headers: { ..._h, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_hash: 'log-all-types-hash',
        file_name: 'logs.csv',
        clean_list: [
          { phone: '+8613800138021', data: { name: '重复' } },
          { phone: '+8613800138022', data: { name: '尝试覆盖' } },
        ]
      }),
    })

    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.results.map((r: any) => r.type)).toEqual(['skipped', 'frozen'])

    const _logs = _sqlite.prepare('SELECT type, changes FROM contact_log WHERE import_id = ? ORDER BY contact_id ASC').all(_json.data.import_id) as any[]
    expect(_logs.map((row) => row.type)).toEqual(['reimport', 'frozen_import'])
    expect(JSON.parse(_logs[1].changes).reason).toContain('防写保护')

    const _detailRes = await _app.request(`/api/import/${_json.data.import_id}`, { headers: _h })
    const _detailJson = await _detailRes.json() as any
    expect(_detailJson.data.details.map((row: any) => row.phone).sort()).toEqual([
      '+8613800138021',
      '+8613800138022',
    ])
  })

  it('POST /api/import/sync → 单次 200 条分片正常返回逐行结果', async () => {
    const _sqlite = createTestDB()
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _h = await authHeader({ id: 10, role: 'manager' })
    const cleanList = Array.from({ length: 200 }, (_, i) => ({
      phone: `+86139000${String(i).padStart(5, '0')}`,
      data: { name: `客户${i}` }
    }))

    const _res = await _app.request('/api/import/sync', {
      method: 'POST',
      headers: { ..._h, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_hash: 'chunk-200-hash',
        file_name: 'chunk.csv',
        clean_list: cleanList
      }),
    })
    const _json = await _res.json() as any

    expect(_json.code).toBe(1)
    expect(_json.data.chunk_size).toBe(200)
    expect(_json.data.results).toHaveLength(200)
    expect(_json.data.results.every((row: any) => row.type === 'added')).toBe(true)
    expect((_sqlite.prepare('SELECT COUNT(*) as cnt FROM contact').get() as any).cnt).toBe(200)
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
