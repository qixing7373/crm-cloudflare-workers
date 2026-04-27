import { describe, it, expect } from 'bun:test'
import { registerUser, loginUser } from '../service/auth.svc'
import { createTestDB, wrapAsD1, TEST_SECRET } from './helpers/d1'
import { generateInviteCode } from '../utility/inviteCode'
import { drizzle } from 'drizzle-orm/d1'
import { ErrorCode } from '@/codes'

describe('authService', () => {
  it('registerUser: 成功流程', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (42, 'admin_inviter', 'hashed123', 'superadmin', 'active', 1)`)
    
    const _code = await generateInviteCode(42, TEST_SECRET)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await registerUser({
      username: 'new_user',
      password: 'StrongPassword123!',
      invite_code: _code,
    }, _db, TEST_SECRET)

    expect(_result.id).toBeGreaterThan(0)
    expect(_result.username).toBe('new_user')

    // 验证落库
    const _user = _sqlite.prepare('SELECT * FROM user WHERE username = ?').get('new_user') as any
    expect(_user.created_by).toBe(42)

    // 验证审计
    const _log = _sqlite.prepare('SELECT * FROM user_log WHERE action = ?').get('login') as any
    expect(_log.user_id).toBe(_user.id)
  })

  it('registerUser: 密码太弱', async () => {
    const _db = drizzle(wrapAsD1(createTestDB()))
    try {
      await registerUser({ username: 'u', password: '123', invite_code: '123456' }, _db, TEST_SECRET)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.WEAK_PASSWORD)
    }
  })

  it('registerUser: 用户名已存在', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (username, password, role) VALUES ('exist_user', 'hash', 'staff')`)
    const _db = drizzle(wrapAsD1(_sqlite))
    
    try {
      await registerUser({ username: 'exist_user', password: 'StrongPassword123!', invite_code: '123456' }, _db, TEST_SECRET)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.USERNAME_EXISTS)
    }
  })

  it('loginUser: 成功流程', async () => {
    const _sqlite = createTestDB()
    const { hash } = await import('bcryptjs')
    const _hashed = await hash('Password123!', 10)
    _sqlite.run(`INSERT INTO user (id, username, password, role, status) VALUES (99, 'loginner', '${_hashed}', 'staff', 'active')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await loginUser({ username: 'loginner', password: 'Password123!' }, _db, TEST_SECRET, '1.2.3.4')
    expect(_result.token).toBeTruthy()
    expect(_result.user.username).toBe('loginner')

    const _log = _sqlite.prepare('SELECT * FROM user_log WHERE action = ?').get('login') as any
    expect(_log.user_id).toBe(99)
    expect(JSON.parse(_log.details).ip).toBe('1.2.3.4')
  })

  it('loginUser: 账号被禁用', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (username, password, status) VALUES ('disabled_user', 'hash', 'disabled')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await loginUser({ username: 'disabled_user', password: '123' }, _db, TEST_SECRET, '1.2.3.4')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.ACCOUNT_DISABLED)
    }
  })

  it('registerUser: 脏输入防御 (超长密码与 SQL 注入攻击字符串)', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (42, 'admin_inviter', 'hashed123', 'superadmin', 'active', 1)`)
    
    const _code = await generateInviteCode(42, TEST_SECRET)
    const _db = drizzle(wrapAsD1(_sqlite))

    // 1. SQL 注入字符串作为用户名。在 ORM 保护下会被当做原文字符串落库，然后报错格式不符（如果在路由层被 Zod 拦截，这里服务层即使不拦截也能成功入库，不会把库删了）
    const _evil_username = "'; DROP TABLE user; --"
    
    // 2. 超长密码：测试 bcryptjs 是否会崩溃或正确截断/处理（由于符合密码策略可以放行）
    const _ultra_long_pwd = 'A1a' + '0'.repeat(1000)

    const _result = await registerUser({
      username: _evil_username,
      password: _ultra_long_pwd,
      invite_code: _code,
    }, _db, TEST_SECRET)

    expect(_result.username).toBe(_evil_username)
    
    // 确认落库的其实就是特殊字符原文而不是执行了注入
    const _user = _sqlite.prepare('SELECT * FROM user WHERE username = ?').get(_evil_username) as any
    expect(_user).toBeTruthy()
    
    // 确认超级长密码也能被成功 login（不被各种字符串限制崩溃）
    const _login = await loginUser({ username: _evil_username, password: _ultra_long_pwd }, _db, TEST_SECRET, '0.0.0.0')
    expect(_login.token).toBeTruthy()
  })
})
