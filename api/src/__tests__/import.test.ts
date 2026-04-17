/**
 * @file   import.test.ts — 批量导入核心逻辑测试
 * @desc   覆盖 matchFields / cleanRows / previewImport 的全部分支
 * @ref    docs/dev/04-测试方案.md B 部分
 */
import { describe, it, expect } from 'bun:test'
import { matchFields, cleanRows, previewImport } from '../service/import.svc'
import type { FieldConfig } from '../service/import.svc'
import { createTestDB, wrapAsD1 } from './helpers/d1'
import { drizzle } from 'drizzle-orm/d1'

// ── 测试用字段配置 ──

const FIELD_LIST: FieldConfig[] = [
  { key: 'name', label: '姓名', label_en: 'Name', editable: true },
  { key: 'age', label: '年龄', label_en: 'Age', editable: true },
  { key: 'city', label: '城市', label_en: 'City', editable: true },
  { key: 'source', label: '来源', label_en: 'Source', editable: false },
  { key: 'email', label: '邮箱', label_en: 'Email', editable: true },
]

// ═══ matchFields 测试 ═══

describe('matchFields 列头匹配', () => {
  it('中文 label 匹配', () => {
    const _result = matchFields(['手机', '姓名', '年龄'], FIELD_LIST)
    expect(_result.phone_index).toBe(0)
    expect(_result.field_map[1]).toBe('name')
    expect(_result.field_map[2]).toBe('age')
  })

  it('英文 label_en 匹配', () => {
    const _result = matchFields(['Phone', 'Name', 'City'], FIELD_LIST)
    expect(_result.phone_index).toBe(0)
    expect(_result.field_map[1]).toBe('name')
    expect(_result.field_map[2]).toBe('city')
  })

  it('key 匹配', () => {
    const _result = matchFields(['mobile', 'email', 'source'], FIELD_LIST)
    expect(_result.phone_index).toBe(0)
    expect(_result.field_map[1]).toBe('email')
    expect(_result.field_map[2]).toBe('source')
  })

  it('未知列头自动脱离系统拦截并暴露警告', () => {
    const _result = matchFields(['手机', '未知列', '姓名'], FIELD_LIST)
    expect(_result.phone_index).toBe(0)
    expect(_result.field_map[1]).toBe('未知列')
    expect(_result.field_map[2]).toBe('name')
    expect(_result.unmapped_headers).toContain('未知列')
  })

  it('无手机列 → phone_index = -1', () => {
    const _result = matchFields(['姓名', '年龄'], FIELD_LIST)
    expect(_result.phone_index).toBe(-1)
  })

  it('列头有空格能正常匹配', () => {
    const _result = matchFields([' 手机 ', ' 姓名 '], FIELD_LIST)
    expect(_result.phone_index).toBe(0)
    expect(_result.field_map[1]).toBe('name')
  })

  it('大小写不敏感匹配英文', () => {
    const _result = matchFields(['PHONE', 'NAME'], FIELD_LIST)
    expect(_result.phone_index).toBe(0)
    expect(_result.field_map[1]).toBe('name')
  })
})

// ═══ cleanRows 测试 ═══

describe('cleanRows 行数据清洗', () => {
  const _field_map = { 1: 'name', 2: 'age' }
  const _phone_index = 0

  it('正常清洗', () => {
    const _rows = [
      { '手机': '+8613800001111', '姓名': '张三', '年龄': 25 },
      { '手机': '+8613800002222', '姓名': '李四', '年龄': 30 },
    ]
    const _result = cleanRows(_rows, _field_map, _phone_index)
    expect(_result.length).toBe(2)
    expect(_result[0].phone).toBe('+8613800001111')
    expect(_result[0].data.name).toBe('张三')
  })

  it('空手机号过滤', () => {
    const _rows = [
      { '手机': '', '姓名': '张三', '年龄': 25 },
      { '手机': '+8613800001111', '姓名': '李四', '年龄': 30 },
    ]
    const _result = cleanRows(_rows, _field_map, _phone_index)
    expect(_result.length).toBe(1)
  })

  it('非法手机号过滤', () => {
    const _rows = [
      { '手机': 'abc', '姓名': '张三', '年龄': 25 },
      { '手机': '123', '姓名': '李四', '年龄': 30 },
    ]
    const _result = cleanRows(_rows, _field_map, _phone_index)
    expect(_result.length).toBe(0)
  })

  it('文件内去重（保留最后一条）', () => {
    const _rows = [
      { '手机': '+8613800001111', '姓名': '张三_旧', '年龄': 25 },
      { '手机': '+8613800001111', '姓名': '张三_新', '年龄': 26 },
    ]
    const _result = cleanRows(_rows, _field_map, _phone_index)
    expect(_result.length).toBe(1)
    expect(_result[0].data.name).toBe('张三_新')
    expect(_result[0].data.age).toBe(26)
  })

  it('去空格和短横线', () => {
    const _rows = [{ '手机': '86 138-0000-1111', '姓名': '张三', '年龄': 25 }]
    const _result = cleanRows(_rows, _field_map, _phone_index)
    expect(_result.length).toBe(1)
    expect(_result[0].phone).toBe('+8613800001111')
  })

  it('空值字段不写入 data', () => {
    const _rows = [{ '手机': '+8613800001111', '姓名': '', '年龄': null }]
    const _result = cleanRows(_rows, _field_map, _phone_index)
    expect(_result.length).toBe(1)
    expect(_result[0].data).toEqual({})
  })

  it('空行列表返回空', () => {
    expect(cleanRows([], { 0: 'name' }, 1).length).toBe(0)
  })
})

// ═══ previewImport 测试（需要内存 D1）═══

describe('previewImport 四路分类', () => {
  it('全新号码 → added_list', async () => {
    const _db = wrapAsD1(createTestDB())
    const _clean = [
      { phone: '+8613800001111', data: { name: '张三' } },
      { phone: '+8613800002222', data: { name: '李四' } },
    ]
    const _report = await previewImport(_clean, 1, drizzle(_db))
    expect(_report.added_list.length).toBe(2)
    expect(_report.updated_list.length).toBe(0)
    expect(_report.frozen_list.length).toBe(0)
    expect(_report.token).toBeDefined()
  })

  it('完全重复 → skipped_list', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, data, status) VALUES ('+8613800001111', '{"name":"张三"}', 'undeveloped')`)
    const _db = wrapAsD1(_sqlite)
    const _report = await previewImport([{ phone: '+8613800001111', data: { name: '张三' } }], 1, drizzle(_db))
    expect(_report.skipped_list.length).toBe(1)
    expect(_report.added_list.length).toBe(0)
  })

  it('数据变化 → updated_list', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, data, status) VALUES ('+8613800001111', '{"name":"旧名"}', 'undeveloped')`)
    const _db = wrapAsD1(_sqlite)
    const _report = await previewImport([{ phone: '+8613800001111', data: { name: '新名' } }], 1, drizzle(_db))
    expect(_report.updated_list.length).toBe(1)
    expect(_report.updated_list[0].changes.name.old).toBe('旧名')
    expect(_report.updated_list[0].changes.name.new).toBe('新名')
  })

  it('已开发 → frozen_list（防写保护）', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, data, status, owner_id) VALUES ('+8613800001111', '{"name":"张三"}', 'developed', 42)`)
    const _db = wrapAsD1(_sqlite)
    const _report = await previewImport([{ phone: '+8613800001111', data: { name: '新数据' } }], 1, drizzle(_db))
    expect(_report.frozen_list.length).toBe(1)
    expect(_report.frozen_list[0].reason).toContain('防写保护')
  })

  it('混合场景', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, data, status) VALUES ('+8613800001111', '{"name":"不变"}', 'undeveloped')`)
    _sqlite.run(`INSERT INTO contact (phone, data, status) VALUES ('+8613800002222', '{"name":"旧"}', 'undeveloped')`)
    _sqlite.run(`INSERT INTO contact (phone, data, status, owner_id) VALUES ('+8613800003333', '{"name":"开发中"}', 'developed', 5)`)
    const _db = wrapAsD1(_sqlite)

    const _clean = [
      { phone: '+8613800001111', data: { name: '不变' } },     // reimport
      { phone: '+8613800002222', data: { name: '新' } },       // update
      { phone: '+8613800003333', data: { name: '覆盖' } },     // frozen
      { phone: '+8613800004444', data: { name: '全新' } },     // new
    ]
    const _report = await previewImport(_clean, 1, drizzle(_db))
    expect(_report.skipped_list.length).toBe(1)
    expect(_report.updated_list.length).toBe(1)
    expect(_report.frozen_list.length).toBe(1)
    expect(_report.added_list.length).toBe(1)
    expect(_report.total).toBe(4)
  })

  it('空列表 → 全部为空', async () => {
    const _db = wrapAsD1(createTestDB())
    const _report = await previewImport([], 1, drizzle(_db))
    expect(_report.added_list.length).toBe(0)
    expect(_report.total).toBe(0)
  })

  it('token 包含正确的统计信息', async () => {
    const _db = wrapAsD1(createTestDB())
    const _report = await previewImport([{ phone: '+8613800001111', data: {} }], 1, drizzle(_db))
    const _decoded = JSON.parse(atob(_report.token))
    expect(_decoded.user_id).toBe(1)
    expect(_decoded.added).toBe(1)
    expect(_decoded.created_at).toBeGreaterThan(0)
  })
})

describe('Service查询方法', () => {
  it('listEnabledFields', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_field (key, label) VALUES ('test_key', '测试标签')`)
    const _db = wrapAsD1(_sqlite)
    // Need to dynamically import to test listEnabledFields since it's not exported at top of this file
    const { listEnabledFields } = await import('../service/import.svc')
    const _fields = await listEnabledFields(drizzle(_db))
    expect(_fields.length).toBeGreaterThan(0)
    const testField = _fields.find((f: any) => f.key === 'test_key')!
    expect(testField).toBeDefined()
    expect(testField.label).toBe('测试标签')
  })
})
