/**
 * @file   group_service.test.ts — GroupService 单元测试
 * @desc   覆盖分组 CRUD 业务逻辑：重名检查、成员数保护、删除
 */
import { describe, it, expect } from 'bun:test'
import { GroupService } from '../service/group.svc'
import { createTestDB, wrapAsD1 } from './helpers/d1'
import { drizzle } from 'drizzle-orm/d1'
import { ErrorCode } from '@/codes'

describe('GroupService', () => {
  it('create: 成功创建分组', async () => {
    const _sqlite = createTestDB()
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await GroupService.create(_db, { name: '销售一组' })
    expect(_result.id).toBeGreaterThan(0)

    const _group = _sqlite.prepare('SELECT * FROM user_group WHERE name = ?').get('销售一组') as any
    expect(_group).toBeTruthy()
  })

  it('create: 重复名称 → 抛出 BAD_REQUEST', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (name) VALUES ('已存在')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await GroupService.create(_db, { name: '已存在' })
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.BAD_REQUEST)
    }
  })

  it('update: 修改分组名称', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '旧名')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await GroupService.update(_db, 1, { name: '新名' })
    expect(_result.name).toBe('新名')
  })

  it('delete: 空分组可删除 + 审计日志', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '空组')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    await GroupService.delete(_db, 1, 99)

    const _group = _sqlite.prepare('SELECT * FROM user_group WHERE id = 1').get()
    expect(_group).toBeFalsy()

    const _log = _sqlite.prepare('SELECT * FROM user_log WHERE action = ?').get('delete_group') as any
    expect(_log.user_id).toBe(99)
  })

  it('delete: 有成员的分组 → 禁止删除', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '有人组')`)
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u1', 'x', 'staff', 'active', 1)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await GroupService.delete(_db, 1, 99)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.FORBIDDEN)
    }
  })

  it('list: 返回分组列表含成员数', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '组A')`)
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u1', 'x', 'staff', 'active', 1)`)
    _sqlite.run(`INSERT INTO user (username, password, role, status, group_id) VALUES ('u2', 'x', 'staff', 'active', 1)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _list = await GroupService.list(_db)
    expect(_list.length).toBe(1)
    expect((_list[0] as any).member_count).toBe(2)
  })
})
