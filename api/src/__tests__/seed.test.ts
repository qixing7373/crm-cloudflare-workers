/**
 * @file   seed.test.ts — 种子账号校验
 * @desc   防止 seed.sql 默认 admin 密码说明和 bcrypt 哈希再次漂移
 */
import { describe, expect, it } from 'bun:test'
import { checkPassword } from '@/service/auth.svc'

describe('seed.sql', () => {
  it('默认 admin 哈希匹配 Admin@123!', async () => {
    const sql = await Bun.file('src/seed.sql').text()
    const matched = sql.match(/'admin', '([^']+)'/)
    expect(matched?.[1]).toBeDefined()
    expect(await checkPassword('Admin@123!', matched![1])).toBe(true)
  })
})
