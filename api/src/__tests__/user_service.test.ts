/**
 * @file   user_service.test.ts — UserService 单元测试
 * @desc   覆盖用户管理业务逻辑：创建/禁用联动/角色/分组
 */
import { describe, it, expect } from 'bun:test'
import { UserService } from '../service/user.svc'
import { createTestDB, wrapAsD1 } from './helpers/d1'
import { drizzle } from 'drizzle-orm/d1'
import { ErrorCode } from '@/codes'

describe('UserService', () => {
  it('create: 成功创建用户（密码被哈希）', async () => {
    const _sqlite = createTestDB()
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await UserService.create(_db, {
      username: 'newuser',
      password: 'Admin123',
      role: 'staff',
    }, { id: 1, group_id: 5 })

    expect(_result.id).toBeGreaterThan(0)

    const _user = _sqlite.prepare('SELECT * FROM user WHERE username = ?').get('newuser') as any
    expect(_user.password).not.toBe('Admin123') // 已被哈希
    expect(_user.group_id).toBe(5) // 继承创建者分组
    expect(_user.created_by).toBe(1)
  })

  it('create: 重复用户名 → USERNAME_EXISTS', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (username, password, role, status) VALUES ('dupe', 'x', 'staff', 'active')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await UserService.create(_db, { username: 'dupe', password: 'Admin123', role: 'staff' }, { id: 1, group_id: 1 })
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.USERNAME_EXISTS)
    }
  })

  it('setStatus: 禁用用户 → 释放私海资源', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (10, 'staff1', 'x', 'staff', 'active', 1)`)
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+8613800001111', 'developed', 10)`)
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+8613800002222', 'developed', 10)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await UserService.setStatus(_db, 10, 'disabled', { id: 1, role: 'superadmin', group_id: null })
    expect(_result.status).toBe('disabled')

    // 验证资源已释放
    const _contacts = _sqlite.prepare('SELECT * FROM contact WHERE owner_id = 10').all()
    expect(_contacts.length).toBe(0) // owner_id 被清空

    // 验证审计日志
    const _log = _sqlite.prepare('SELECT * FROM user_log WHERE action = ?').get('disable_user') as any
    expect(_log.user_id).toBe(1)
  })

  it('setStatus: 不能封禁自己的账号 → FORBIDDEN', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (1, 'me', 'x', 'superadmin', 'active', null)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await UserService.setStatus(_db, 1, 'disabled', { id: 1, role: 'superadmin', group_id: null })
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.FORBIDDEN)
      expect(e.message).toBe('不能封禁自己的账号')
    }
  })

  it('setStatus: manager 操作不同组用户 → FORBIDDEN', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (10, 'other', 'x', 'staff', 'active', 2)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await UserService.setStatus(_db, 10, 'disabled', { id: 1, role: 'manager', group_id: 1 })
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.FORBIDDEN)
    }
  })

  it('setStatus: 不存在的用户 → NOT_FOUND', async () => {
    const _sqlite = createTestDB()
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await UserService.setStatus(_db, 999, 'disabled', { id: 1, role: 'superadmin', group_id: null })
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.NOT_FOUND)
    }
  })

  it('list: superadmin 看全部，manager 看同组', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (1, 'a', 'x', 'staff', 'active', 1)`)
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (2, 'b', 'x', 'staff', 'active', 2)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _all = await UserService.list(_db, { role: 'superadmin', group_id: null })
    expect(_all.length).toBe(2)

    const _group1 = await UserService.list(_db, { role: 'manager', group_id: 1 })
    expect(_group1.length).toBe(1)
    expect((_group1[0] as any).username).toBe('a')
  })

  it('setRole: 修改角色', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status) VALUES (1, 'x', 'x', 'staff', 'active')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await UserService.setRole(_db, 1, 'manager')
    expect(_result.role).toBe('manager')

    const _user = _sqlite.prepare('SELECT role FROM user WHERE id = 1').get() as any
    expect(_user.role).toBe('manager')
  })

  it('setGroup: 修改分组', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user (id, username, password, role, status, group_id) VALUES (1, 'x', 'x', 'staff', 'active', 1)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await UserService.setGroup(_db, 1, 5)
    expect(_result.group_id).toBe(5)

    const _user = _sqlite.prepare('SELECT group_id FROM user WHERE id = 1').get() as any
    expect(_user.group_id).toBe(5)
  })
})
