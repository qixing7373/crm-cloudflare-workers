/**
 * @file   confirmImport.test.ts — 确认入库逻辑测试
 * @desc   覆盖 confirmImport 的 token 验证、写入、审计全链路
 */
import { describe, it, expect } from 'bun:test'
import { previewImport, confirmImport } from '../service/import.svc'
import { createTestDB, wrapAsD1 } from './helpers/d1'
import { drizzle } from 'drizzle-orm/d1'

describe('confirmImport 确认入库', () => {
  it('新记录成功写入 contact + contact_log + import_log', async () => {
    const _sqlite = createTestDB()
    const _db = wrapAsD1(_sqlite)

    const _added_list = [
      { phone: '+8613800001111', data: { name: '张三' } },
      { phone: '+8613800002222', data: { name: '李四' } },
    ]

    const _result = await confirmImport(_added_list, [], 0, 0, 1, drizzle(_db), 'test.csv')
    expect(_result.import_id).toBeGreaterThan(0)

    // 验证 contact 表
    const _contacts = _sqlite.prepare('SELECT * FROM contact').all() as any[]
    expect(_contacts.length).toBe(2)
    expect(_contacts[0].phone).toBe('+8613800001111')
    expect(_contacts[0].status).toBe('undeveloped')
    expect(_contacts[0].import_count).toBe(1)

    // 验证 contact_log
    const _logs = _sqlite.prepare('SELECT * FROM contact_log').all() as any[]
    expect(_logs.length).toBe(2)
    expect(_logs[0].type).toBe('create')

    // 验证 import_log
    const _import_log = _sqlite.prepare('SELECT * FROM import_log').all() as any[]
    expect(_import_log.length).toBe(1)
    expect(_import_log[0].added).toBe(2)

    // 验证 user_log（审计）
    const _user_logs = _sqlite.prepare('SELECT * FROM user_log').all() as any[]
    expect(_user_logs.length).toBe(1)
    expect(_user_logs[0].action).toBe('import')
  })

  it('更新记录写入 changes diff', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, data, status) VALUES ('+8613800001111', '{"name":"旧名"}', 'undeveloped')`)
    const _db = wrapAsD1(_sqlite)

    // 先预览获取 updated_list
    const _report = await previewImport([{ phone: '+8613800001111', data: { name: '新名' } }], 1, drizzle(_db))
    expect(_report.updated_list.length).toBe(1)

    await confirmImport([], _report.updated_list, 0, 0, 1, drizzle(_db), 'test.csv')

    const _contact = _sqlite.prepare('SELECT * FROM contact WHERE phone = ?').get('+8613800001111') as any
    expect(JSON.parse(_contact.data).name).toBe('新名')
    expect(_contact.import_count).toBe(1)  // 原来 0 + 1

    const _log = _sqlite.prepare('SELECT * FROM contact_log WHERE type = ?').get('update') as any
    expect(_log).toBeTruthy()
    expect(JSON.parse(_log.changes)).toHaveProperty('name')
  })
})
