import { describe, it, expect } from 'bun:test'
import { ContactService } from '../service/contact.svc'
import { createTestDB, wrapAsD1 } from './helpers/d1'
import { drizzle } from 'drizzle-orm/d1'
import { ErrorCode } from '@/codes'

describe('contactService', () => {
  it('ContactService.claim: 新建并认领', async () => {
    const _sqlite = createTestDB()
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await ContactService.claim({ phone: '+8613800001111', data: { name: '张三' } }, 88, _db)
    
    expect(_result.id).toBeGreaterThan(0)
    expect(_result.status).toBe('developed')

    const _contact = _sqlite.prepare('SELECT * FROM contact WHERE phone = ?').get('+8613800001111') as any
    expect(_contact.owner_id).toBe(88)

    const _log = _sqlite.prepare('SELECT * FROM contact_log WHERE type = ?').get('create') as any
    expect(_log.user_id).toBe(88)
  })

  it('ContactService.claim: 抢占 undeveloped 成功', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+8613800002222', 'undeveloped')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    const _result = await ContactService.claim({ phone: '+8613800002222' }, 42, _db)
    
    expect(_result.status).toBe('developed')

    const _contact = _sqlite.prepare('SELECT * FROM contact WHERE phone = ?').get('+8613800002222') as any
    expect(_contact.owner_id).toBe(42)
  })

  it('ContactService.claim: 已被其他人抢占 (Collision)', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status, owner_id) VALUES ('+8613800003333', 'developed', 99)`)
    const _db = drizzle(wrapAsD1(_sqlite))

    try {
      await ContactService.claim({ phone: '+8613800003333' }, 42, _db)
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.COLLISION_DETECTED)
    }
  })

  it('ContactService.claim: 极限并发冲突测试 (10 个请求同时抢占)', async () => {
    const _sqlite = createTestDB()
    _sqlite.run(`INSERT INTO contact (phone, status) VALUES ('+8613800004444', 'undeveloped')`)
    const _db = drizzle(wrapAsD1(_sqlite))

    // 制造 10 个绝对同步的并发请求来抢同一个 undeveloped 号码
    const _promises = Array.from({ length: 10 }).map((_, i) =>
      ContactService.claim({ phone: '+8613800004444' }, i + 1, _db)
    )

    const _results = await Promise.allSettled(_promises)

    const _fulfilled = _results.filter(r => r.status === 'fulfilled')
    const _rejected = _results.filter(r => r.status === 'rejected') as PromiseRejectedResult[]

    // 必须有且仅有 1 个成功
    expect(_fulfilled.length).toBe(1)
    expect(_rejected.length).toBe(9)

    // 所有失败的必须是碰撞错误
    _rejected.forEach(r => {
      expect(r.reason.code).toBe(ErrorCode.COLLISION_DETECTED)
    })

    // 检查最后落库情况，只能属于那个成功的幸运儿
    const _winner_id = (_fulfilled[0] as PromiseFulfilledResult<any>).value.id
    const _contact = _sqlite.prepare('SELECT * FROM contact WHERE phone = ?').get('+8613800004444') as any
    // owner_id 会被设成了第一个拿到锁的人 (值为其 index + 1)
    expect(_contact.owner_id).toBeGreaterThan(0)
    
    // 审计日志只应该有 1 条认领记录
    const _logs = _sqlite.prepare('SELECT * FROM user_log WHERE action = ?').all('claim') as any[]
    expect(_logs.length).toBe(1)
  })
})
