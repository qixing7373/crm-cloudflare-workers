/**
 * @file   dropoff.test.ts — 90 天自动掉落 cron 测试
 * @desc   使用内存 D1 测试 runDropoff 的实际 DB 行为
 */
import { describe, it, expect } from 'bun:test'
import { runDropoff } from '../wrangler/dropoff'
import { createTestDB, wrapAsD1 } from './helpers/d1'
import { drizzle } from 'drizzle-orm/d1'
import { PROTECT_DAYS, SECONDS_PER_DAY } from '../consts'

describe('runDropoff cron', () => {
  it('超期 developed 资源被释放为 undeveloped', async () => {
    const _sqlite = createTestDB()
    const _expired_ts = Math.floor(Date.now() / 1000) - (PROTECT_DAYS + 1) * SECONDS_PER_DAY
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id, claimed_at) VALUES ('+8613800001111', 'developed', 42, ${_expired_ts})`)
    const _db = wrapAsD1(_sqlite)

    const _result = await runDropoff(drizzle(_db))
    expect(_result.released).toBe(1)

    const _contact = _sqlite.prepare('SELECT * FROM contact WHERE phone = ?').get('+8613800001111') as any
    expect(_contact.status).toBe('undeveloped')
    expect(_contact.owner_id).toBeNull()
    expect(_contact.claimed_at).toBeNull()
  })

  it('未超期资源不受影响', async () => {
    const _sqlite = createTestDB()
    const _recent_ts = Math.floor(Date.now() / 1000) - (PROTECT_DAYS - 1) * SECONDS_PER_DAY
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id, claimed_at) VALUES ('+8613800001111', 'developed', 42, ${_recent_ts})`)
    const _db = wrapAsD1(_sqlite)

    const _result = await runDropoff(drizzle(_db))
    expect(_result.released).toBe(0)

    const _contact = _sqlite.prepare('SELECT * FROM contact WHERE phone = ?').get('+8613800001111') as any
    expect(_contact.status).toBe('developed')
    expect(_contact.owner_id).toBe(42)
  })

  it('undeveloped 资源被忽略', async () => {
    const _sqlite = createTestDB()
    const _old_ts = Math.floor(Date.now() / 1000) - 365 * SECONDS_PER_DAY
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id, claimed_at) VALUES ('+8613800001111', 'undeveloped', null, ${_old_ts})`)
    const _db = wrapAsD1(_sqlite)

    const _result = await runDropoff(drizzle(_db))
    expect(_result.released).toBe(0)
  })

  it('空库 → released = 0', async () => {
    const _db = wrapAsD1(createTestDB())
    const _result = await runDropoff(drizzle(_db))
    expect(_result.released).toBe(0)
  })

  it('释放后写入 contact_log 审计记录', async () => {
    const _sqlite = createTestDB()
    const _expired_ts = Math.floor(Date.now() / 1000) - (PROTECT_DAYS + 1) * SECONDS_PER_DAY
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id, claimed_at) VALUES ('+8613800001111', 'developed', 5, ${_expired_ts})`)
    const _db = wrapAsD1(_sqlite)

    await runDropoff(drizzle(_db))

    const _logs = _sqlite.prepare('SELECT * FROM contact_log').all() as any[]
    expect(_logs.length).toBe(1)
    expect(JSON.parse(_logs[0].changes)).toHaveProperty('action', 'system_dropoff')
    expect(JSON.parse(_logs[0].changes)).toHaveProperty('prev_owner_id', 5)
  })

  it('混合场景：只释放超期的', async () => {
    const _sqlite = createTestDB()
    const _expired = Math.floor(Date.now() / 1000) - (PROTECT_DAYS + 5) * SECONDS_PER_DAY
    const _recent = Math.floor(Date.now() / 1000) - 10 * SECONDS_PER_DAY
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id, claimed_at) VALUES ('+86001', 'developed', 1, ${_expired})`)
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id, claimed_at) VALUES ('+86002', 'developed', 2, ${_recent})`)
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+86003', 'undeveloped')`)
    const _db = wrapAsD1(_sqlite)

    const _result = await runDropoff(drizzle(_db))
    expect(_result.released).toBe(1)

    const _all = _sqlite.prepare('SELECT phone, status FROM contact ORDER BY phone').all() as any[]
    expect(_all[0].status).toBe('undeveloped')  // +86001 释放了
    expect(_all[1].status).toBe('developed')    // +86002 保留
    expect(_all[2].status).toBe('undeveloped')  // +86003 原本就是
  })
})
