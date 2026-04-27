/**
 * @file   field_service.test.ts — FieldService 单元测试
 * @desc   覆盖字段 CRUD 业务逻辑：唯一性校验、排序、禁用
 */
import { describe, it, expect } from 'bun:test'
import { FieldService } from '../service/field.svc'
import { createTestDB, wrapAsD1 } from './helpers/d1'
import { drizzle } from 'drizzle-orm/d1'
import { ErrorCode } from '@/codes'

describe('FieldService', () => {
  it('create: 成功创建字段', async () => {
    const _sqlite = createTestDB()
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await FieldService.create(_db, {
      key: 'company',
      label: '公司',
      label_en: 'Company',
      type: 'text',
      required: false,
      editable: true,
    }, 1)

    expect(_result.id).toBeGreaterThan(0)

    const _field = _sqlite.prepare('SELECT * FROM contact_field WHERE key = ?').get('company') as any
    expect(_field).toBeTruthy()
    expect(_field.label).toBe('公司')
  })

  it('create: 重复 key → 抛出 BAD_REQUEST', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (key, label, type) VALUES ('name', '姓名', 'text')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await FieldService.create(_db, { key: 'name', label: '名字', type: 'text', required: false, editable: true }, 1)
      expect(true).toBe(false) // 不应到达这里
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.BAD_REQUEST)
    }
  })

  it('update: 修改字段标签', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (id, key, label, type) VALUES (1, 'name', '姓名', 'text')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await FieldService.update(_db, 1, { label: '名字' }, 1)
    expect(_result.id).toBe(1)

    const _field = _sqlite.prepare('SELECT * FROM contact_field WHERE id = 1').get() as any
    expect(_field.label).toBe('名字')
  })

  it('sort: 批量重排字段顺序', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (id, key, label, type, sort) VALUES (1, 'a', 'A', 'text', 0)`)
    _sqlite.run(`INSERT INTO contact_field (id, key, label, type, sort) VALUES (2, 'b', 'B', 'text', 1)`)
    _sqlite.run(`INSERT INTO contact_field (id, key, label, type, sort) VALUES (3, 'c', 'C', 'text', 2)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    // 反转顺序：3, 1, 2
    await FieldService.sort(_db, [3, 1, 2], 1)

    const _fields = _sqlite.prepare('SELECT id, sort FROM contact_field ORDER BY sort ASC').all() as any[]
    expect(_fields[0].id).toBe(3)
    expect(_fields[1].id).toBe(1)
    expect(_fields[2].id).toBe(2)
  })

  it('disable: 禁用字段 + 审计日志', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (id, key, label, type, enabled) VALUES (1, 'x', 'X', 'text', 1)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    await FieldService.disable(_db, 1, 99)

    const _field = _sqlite.prepare('SELECT * FROM contact_field WHERE id = 1').get() as any
    expect(_field.enabled).toBe(0)

    const _log = _sqlite.prepare('SELECT * FROM user_log WHERE action = ?').get('update_field') as any
    expect(_log.user_id).toBe(99)
  })
})
