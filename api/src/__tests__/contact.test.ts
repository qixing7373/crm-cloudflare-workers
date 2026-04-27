/**
 * @file   contact.test.ts — 联系人脱敏逻辑 + 碰撞检测测试
 * @desc   覆盖 maskContact 的全部四种分支以及认领碰撞场景
 */
import { describe, it, expect } from 'bun:test'
import { maskContact } from '../utility/mask'
import type { ContactRow } from '../utility/mask'

describe('maskContact 脱敏逻辑', () => {
  const _developed_row: ContactRow = {
    phone: '+8613812345678',
    status: 'developed',
    owner_id: 42,
    data: JSON.stringify({ name: '张三', email: 'zhang@test.com', social: 'wechat123' }),
  }

  it('未开发资源不脱敏', () => {
    const _row = { ..._developed_row, status: 'undeveloped' }
    const _result = maskContact(_row, { id: 99, role: 'staff' })
    expect(_result._is_masked).toBe(false)
    expect(_result.phone).toBe('+8613812345678')
  })

  it('自己的资源不脱敏', () => {
    const _result = maskContact(_developed_row, { id: 42, role: 'staff' })
    expect(_result._is_masked).toBe(false)
  })

  it('超管查看不脱敏', () => {
    const _result = maskContact(_developed_row, { id: 99, role: 'superadmin' })
    expect(_result._is_masked).toBe(false)
  })

  it('其他人已开发资源被脱敏', () => {
    const _result = maskContact(_developed_row, { id: 99, role: 'staff' })
    expect(_result._is_masked).toBe(true)
    expect(_result.phone).toBe('+861****5678')  // maskPhone 结果
    expect(_result._private_owner).toBe(42)
  })

  it('脱敏后 email 被遮蔽', () => {
    const _result = maskContact(_developed_row, { id: 99, role: 'staff' })
    const _data = JSON.parse(_result.data)
    expect(_data.email).toBe('z***@test.com')
  })

  it('脱敏后 social 变为 ***', () => {
    const _result = maskContact(_developed_row, { id: 99, role: 'staff' })
    const _data = JSON.parse(_result.data)
    expect(_data.social).toBe('***')
  })

  it('脱敏后 name 保持明文（非敏感字段）', () => {
    const _result = maskContact(_developed_row, { id: 99, role: 'staff' })
    const _data = JSON.parse(_result.data)
    expect(_data.name).toBe('张三')
  })

  it('phone 为 null 时不报错', () => {
    const _row = { ..._developed_row, phone: null }
    const _result = maskContact(_row, { id: 99, role: 'staff' })
    expect(_result.phone).toBeNull()
    expect(_result._is_masked).toBe(true)
  })

  it('manager 也被脱敏（非超管非本人）', () => {
    const _result = maskContact(_developed_row, { id: 99, role: 'manager' })
    expect(_result._is_masked).toBe(true)
  })
})

import { ContactDao, ContactLogDao, ContactStatDao } from '../dao/contact.dao'
import { createTestDB, wrapAsD1 } from './helpers/d1'
import { drizzle } from 'drizzle-orm/d1'

import { contact } from '../schema'

describe('底层 DAO 分支补充', () => {
  it('ContactDao.listPaginated > tailOnly 分支', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone) VALUES ('+8613800001111')`)
    _sqlite.run(`INSERT INTO contact (phone) VALUES ('+8613900001111')`)
    const _db = drizzle(wrapAsD1(_sqlite))
    const _res = await ContactDao.listPaginated(_db, { offset: 0, size: 10, q: '1111', tailOnly: true })
    expect(_res.total).toBe(2)
  })

  it('ContactDao.update > 基础更新分支', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (id, phone, status) VALUES (1, '+861', 'undeveloped')`)
    const _db = drizzle(wrapAsD1(_sqlite))
    await ContactDao.update(_db, 1, { status: 'developed', owner_id: 2 } as any)
    const _row = _sqlite.prepare('SELECT owner_id FROM contact WHERE id = 1').get() as any
    expect(_row.owner_id).toBe(2)
  })

  it('ContactLogDao.listByContact > 获取日志全列表', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact_log (contact_id, user_id, type) VALUES (99, 1, 'create')`)
    const _db = drizzle(wrapAsD1(_sqlite))
    const _logs = await ContactLogDao.listByContact(_db, 99)
    expect(_logs.length).toBe(1)
  })

  it('ContactStatDao.countMyDeveloped > month 时间段过滤', async () => {
    const _sqlite = createTestDB()
    const _db = drizzle(wrapAsD1(_sqlite))

    const start = new Date('2023-05-02')
    await _db.insert(contact).values({
      phone: '1', owner_id: 1, status: 'developed', claimed_at: start
    } as any)
    
    const _count = await ContactStatDao.countMyDeveloped(_db, 1, '2023-05')
    expect(_count).toBe(1)
    
    const _count2 = await ContactStatDao.countMyDeveloped(_db, 1, '2023-06')
    expect(_count2).toBe(0)
  })
})
