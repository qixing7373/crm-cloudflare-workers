import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import { auth } from '../middleware/auth.mid'
import { requireRole } from '../middleware/role.mid'
import { makeToken } from '../service/auth.svc'
import { createTestDB, wrapAsD1, TEST_SECRET as SECRET } from './helpers/d1'

function createSecurityApp(db: D1Database) {
  const _app = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string }; Variables: { user: any } }>()
  _app.use('*', async (c, next) => { (c.env as any) = { DB: db, JWT_SECRET: SECRET }; await next() })

  // 公开路由
  _app.get('/public', (c) => c.json({ code: 1, msg: 'ok', data: 'public' }))

  // 需要认证
  _app.use('/api/*', auth)

  // 需要 manager
  _app.get('/api/users', requireRole('manager'), (c) => c.json({ code: 1, msg: 'ok', data: 'user_list' }))
  _app.get('/api/contacts', requireRole('manager'), (c) => c.json({ code: 1, msg: 'ok', data: 'contacts' }))
  _app.post('/api/import', requireRole('manager'), (c) => c.json({ code: 1, msg: 'ok', data: 'imported' }))

  // 需要 superadmin
  _app.put('/api/config', requireRole('superadmin'), (c) => c.json({ code: 1, msg: 'ok', data: 'config_updated' }))
  _app.delete('/api/contact/1', requireRole('superadmin'), (c) => c.json({ code: 1, msg: 'ok', data: 'deleted' }))
  _app.get('/api/export', requireRole('superadmin'), (c) => c.json({ code: 1, msg: 'ok', data: 'csv_data' }))

  // staff 可访问
  _app.get('/api/me', (c) => {
    const _u = c.get('user') as any
    return c.json({ code: 1, msg: 'ok', data: { id: _u.id, role: _u.role } })
  })

  return _app
}

// ═══ D1. JWT 攻击 ═══
// 注意：所有响应 HTTP 状态码一律 200，业务状态通过 code 字段区分

describe('D1. JWT 攻击', () => {
  it('#1 JWT 篡改 role → 签名验证失败 code -401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 1, role: 'superadmin', status: 'active' }, 'wrong-secret')
    const _res = await _app.request('/api/config', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${_token}` },
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })

  it('#2 JWT alg=none → code -401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _h = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=+$/, '')
    const _p = btoa(JSON.stringify({ id: 1, role: 'superadmin', status: 'active', exp: Math.floor(Date.now() / 1000) + 9999 })).replace(/=+$/, '')
    const _none_token = `${_h}.${_p}.`
    const _res = await _app.request('/api/config', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${_none_token}` },
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })

  it('#3 JWT 过期重放 → code -104', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _h = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '')
    const _p = btoa(JSON.stringify({ id: 1, role: 'staff', status: 'active', exp: 1 })).replace(/=+$/, '')
    const _key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const _sig = await crypto.subtle.sign('HMAC', _key, new TextEncoder().encode(`${_h}.${_p}`))
    const _sig_b64 = btoa(String.fromCharCode(...new Uint8Array(_sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const _res = await _app.request('/api/me', { headers: { Authorization: `Bearer ${_h}.${_p}.${_sig_b64}` } })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-104)
  })

  it('#4 JWT 空签名 → code -401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _h = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '')
    const _p = btoa(JSON.stringify({ id: 1, role: 'superadmin' })).replace(/=+$/, '')
    const _res = await _app.request('/api/me', { headers: { Authorization: `Bearer ${_h}.${_p}.` } })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })

  it('#5 无 Authorization header → code -401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _res = await _app.request('/api/me')
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })

  it('#6 Bearer 前缀缺失 → code -401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 1, role: 'staff', status: 'active' }, SECRET)
    const _res = await _app.request('/api/me', { headers: { Authorization: _token } })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })

  it('#7 垃圾 token → code -401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _res = await _app.request('/api/me', { headers: { Authorization: 'Bearer garbage.trash.junk' } })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })
})

// ═══ D2. 越权攻击 ═══

describe('D2. 越权攻击', () => {
  it('#1 staff → 管理员 API (users) → code -400 FORBIDDEN', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 1, role: 'staff', status: 'active' }, SECRET)
    const _res = await _app.request('/api/users', { headers: { Authorization: `Bearer ${_token}` } })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-400)
  })

  it('#2 staff → 总库 contacts → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 1, role: 'staff', status: 'active' }, SECRET)
    const _res = await _app.request('/api/contacts', { headers: { Authorization: `Bearer ${_token}` } })
    expect((await _res.json() as any).code).toBe(-400)
  })

  it('#3 staff → import → code -400 (需 manager+)', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 1, role: 'staff', status: 'active' }, SECRET)
    const _res = await _app.request('/api/import', { method: 'POST', headers: { Authorization: `Bearer ${_token}` } })
    expect((await _res.json() as any).code).toBe(-400)
  })

  it('#4 manager → 超管 API (config) → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 2, role: 'manager', status: 'active' }, SECRET)
    const _res = await _app.request('/api/config', { method: 'PUT', headers: { Authorization: `Bearer ${_token}` } })
    expect((await _res.json() as any).code).toBe(-400)
  })

  it('#5 manager → 删除联系人 → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 2, role: 'manager', status: 'active' }, SECRET)
    const _res = await _app.request('/api/contact/1', { method: 'DELETE', headers: { Authorization: `Bearer ${_token}` } })
    expect((await _res.json() as any).code).toBe(-400)
  })

  it('#6 manager → 导出 → code -400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 2, role: 'manager', status: 'active' }, SECRET)
    const _res = await _app.request('/api/export', { headers: { Authorization: `Bearer ${_token}` } })
    expect((await _res.json() as any).code).toBe(-400)
  })

  it('#7 superadmin 正常访问全部 → code 1', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 3, role: 'superadmin', status: 'active' }, SECRET)

    const _r1 = await _app.request('/api/users', { headers: { Authorization: `Bearer ${_token}` } })
    expect((await _r1.json() as any).code).toBe(1)

    const _r2 = await _app.request('/api/config', { method: 'PUT', headers: { Authorization: `Bearer ${_token}` } })
    expect((await _r2.json() as any).code).toBe(1)

    const _r3 = await _app.request('/api/export', { headers: { Authorization: `Bearer ${_token}` } })
    expect((await _r3.json() as any).code).toBe(1)
  })

  it('#8 禁用账号的有效 JWT → code -103', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 1, role: 'manager', status: 'disabled' }, SECRET)
    const _res = await _app.request('/api/users', { headers: { Authorization: `Bearer ${_token}` } })
    expect((await _res.json() as any).code).toBe(-103)
  })

  it('#9 staff 能访问自己的 /api/me → code 1', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 42, role: 'staff', status: 'active' }, SECRET)
    const _res = await _app.request('/api/me', { headers: { Authorization: `Bearer ${_token}` } })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.id).toBe(42)
    expect(_json.data.role).toBe('staff')
  })

  it('#10 manager 有 import 权限放行 → code 1', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _token = await makeToken({ id: 2, role: 'manager', status: 'active' }, SECRET)
    const _res = await _app.request('/api/import', { method: 'POST', headers: { Authorization: `Bearer ${_token}` } })
    expect((await _res.json() as any).code).toBe(1)
  })
})

// ═══ 公开路由不需要认证 ═══

describe('公开路由隔离', () => {
  it('公开路由不受 auth 中间件影响', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createSecurityApp(_db)
    const _res = await _app.request('/public')
    expect((await _res.json() as any).data).toBe('public')
  })
})
