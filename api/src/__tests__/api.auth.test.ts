import { describe, it, expect, beforeAll } from 'bun:test'
import { Hono } from 'hono'
import { hashPassword, makeToken } from '../service/auth.svc'
import authRouter from '../controller/auth.ctr'
import { auth } from '../middleware/auth.mid'
import { dbHook, paginateHook } from '../middleware/hook.mid'
import { AppError } from '../hono/AppError'
import { fail } from '../hono/response'
import { ErrorCode } from '@/codes'
import { createTestDB, wrapAsD1, TEST_SECRET as JWT_SECRET } from './helpers/d1'
import { generateInviteCode } from '../utility/inviteCode'

function createApp(db: D1Database) {
  const _app = new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string } }>()

  // 绑定环境
  _app.use('*', async (c, next) => {
    (c.env as any) = { DB: db, JWT_SECRET }
    await next()
  })

  _app.use('*', dbHook, paginateHook)
  
  _app.onError((_error, c) => {
    if (_error instanceof AppError) {
      return fail(c, _error.code, _error.message)
    }
    return fail(c, ErrorCode.INTERNAL_ERROR)
  })

  _app.route('/auth', authRouter)
  _app.get('/api/protected', auth, (c) => c.json({ code: 1, msg: 'ok', data: null }))

  return _app
}

// ═══ API 集成测试 ═══

describe('POST /auth/register', () => {
  it('#1 有效邀请码注册 → 直接 active', async () => {
    const _sqlite = createTestDB()
    // seed: 创建一个 manager 作为邀请人
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (1, 'mgr', 'x', 'manager', 'active', 5)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)

    // 计算该 manager 今日邀请码
    const _code = await generateInviteCode(1, JWT_SECRET)

    const _res = await _app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'Admin123', invite_code: _code }),
    })
    expect(_res.status).toBe(200)
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.status).toBe('active')
    expect(_json.data.group_id).toBe(5)
  })

  it('#2 无效邀请码 → 拒绝', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (1, 'mgr', 'x', 'manager', 'active', 5)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)

    const _res = await _app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'Admin123', invite_code: 'BADCOD' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })

  it('#3 密码不符合复杂度 → 400', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _res = await _app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: '123', invite_code: 'ABCDEF' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBeLessThan(0)
  })

  it('#4 重复用户名 → code -100', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (1, 'mgr', 'x', 'manager', 'active', 5)`)
    const _db = wrapAsD1(_sqlite)
    const _app = createApp(_db)
    const _code = await generateInviteCode(1, JWT_SECRET)

    // 注册第一次
    await _app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'dupe', password: 'Admin123', invite_code: _code }),
    })
    // 注册第二次
    const _res = await _app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'dupe', password: 'Admin123', invite_code: _code }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-100)
  })
})

describe('POST /auth/login', () => {
  let _db: D1Database
  let _app: ReturnType<typeof createApp>

  beforeAll(async () => {
    const _sqlite = createTestDB()
    _db = wrapAsD1(_sqlite)
    _app = createApp(_db)

    const _hashed = await hashPassword('Admin123')
    _sqlite.run(
      `INSERT INTO user (username, password, role, status) VALUES (?, ?, ?, ?)`,
      ['active_user', _hashed, 'staff', 'active'],
    )
    _sqlite.run(
      `INSERT INTO user (username, password, role, status) VALUES (?, ?, ?, ?)`,
      ['disabled_user', _hashed, 'staff', 'disabled'],
    )
  })

  it('#5 正确凭证登录 → 返回 JWT', async () => {
    const _res = await _app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'active_user', password: 'Admin123' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.token).toBeDefined()
    expect(_json.data.user.username).toBe('active_user')
  })

  it('错误密码 → code -101', async () => {
    const _res = await _app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'active_user', password: 'WrongPass1' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-101)
  })

  it('禁用账号 → code -103', async () => {
    const _res = await _app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'disabled_user', password: 'Admin123' }),
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-103)
  })
})

describe('权限测试', () => {
  it('#7 未登录访问受保护 API → code -401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _res = await _app.request('/api/protected')
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })

  it('#8 过期 JWT → code -104', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '')
    const _payload = btoa(JSON.stringify({ id: 1, role: 'staff', exp: 1000000 })).replace(/=+$/, '')
    const _key = await crypto.subtle.importKey('raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const _sig = await crypto.subtle.sign('HMAC', _key, new TextEncoder().encode(`${_header}.${_payload}`))
    const _sig_b64 = btoa(String.fromCharCode(...new Uint8Array(_sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const _expired_token = `${_header}.${_payload}.${_sig_b64}`

    const _res = await _app.request('/api/protected', {
      headers: { Authorization: `Bearer ${_expired_token}` },
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-104)
  })

  it('JWT 篡改签名 → 401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _token = await makeToken({ id: 1, role: 'superadmin', status: 'active' }, 'wrong-secret')
    const _res = await _app.request('/api/protected', {
      headers: { Authorization: `Bearer ${_token}` },
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })

  it('JWT Payload 平移伪造 (尝试提升为超管) → 401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _token = await makeToken({ id: 1, role: 'staff', status: 'active' }, JWT_SECRET)
    
    // 篡改 Payload 中的 role 为 superadmin
    const _parts = _token.split('.')
    const _fake_payload = btoa(JSON.stringify({ id: 1, role: 'superadmin', status: 'active', exp: Math.floor(Date.now() / 1000) + 86400 })).replace(/=+$/, '')
    
    // 保留了原来的签名（由原来 payload 生成），但是套用新的伪造 payload
    const _fake_token = `${_parts[0]}.${_fake_payload}.${_parts[2]}`

    const _res = await _app.request('/api/protected', {
      headers: { Authorization: `Bearer ${_fake_token}` },
    })
    const _json = await _res.json() as any
    expect(_json.code).toBe(-401)
  })

  it('JWT 畸形前缀或残缺 → 401', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _token = await makeToken({ id: 1, role: 'staff', status: 'active' }, JWT_SECRET)

    // 测试没有 Bearer
    const _res1 = await _app.request('/api/protected', { headers: { Authorization: _token } })
    expect(await _res1.json() as any).toHaveProperty('code', -401)

    // 测试少段落截断
    const _res2 = await _app.request('/api/protected', { headers: { Authorization: `Bearer ${_token.split('.').slice(0, 2).join('.')}` } })
    expect(await _res2.json() as any).toHaveProperty('code', -401)
  })

  it('有效 JWT → 通过', async () => {
    const _db = wrapAsD1(createTestDB())
    const _app = createApp(_db)
    const _token = await makeToken({ id: 1, role: 'staff', status: 'active' }, JWT_SECRET)
    const _res = await _app.request('/api/protected', {
      headers: { Authorization: `Bearer ${_token}` },
    })
    expect(_res.status).toBe(200)
  })
})
