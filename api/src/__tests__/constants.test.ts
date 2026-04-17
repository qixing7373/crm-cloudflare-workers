import { describe, it, expect } from 'bun:test'
import { PROTECT_DAYS, BATCH_SIZE, TOKEN_LIFE, MAX_IMPORT, MAX_FILE_SIZE, PHONE_REGEX, ROLE_LEVEL } from '../consts'

describe('constants', () => {
  it('PROTECT_DAYS = 90', () => { expect(PROTECT_DAYS).toBe(90) })
  it('BATCH_SIZE = 90', () => { expect(BATCH_SIZE).toBe(90) })
  it('TOKEN_LIFE = 86400', () => { expect(TOKEN_LIFE).toBe(86400) })
  it('MAX_IMPORT = 50000', () => { expect(MAX_IMPORT).toBe(50000) })
  it('MAX_FILE_SIZE = 20MB', () => { expect(MAX_FILE_SIZE).toBe(20 * 1024 * 1024) })

  it('PHONE_REGEX 匹配合法号码', () => {
    expect(PHONE_REGEX.test('+8613812345678')).toBe(true)
    expect(PHONE_REGEX.test('+66812345678')).toBe(true)
  })

  it('PHONE_REGEX 拒绝非法号码', () => {
    expect(PHONE_REGEX.test('13812345678')).toBe(false)
    expect(PHONE_REGEX.test('+0123')).toBe(false)
    expect(PHONE_REGEX.test('abc')).toBe(false)
  })

  it('ROLE_LEVEL 层级正确', () => {
    expect(ROLE_LEVEL.staff).toBeLessThan(ROLE_LEVEL.manager)
    expect(ROLE_LEVEL.manager).toBeLessThan(ROLE_LEVEL.superadmin)
  })
})
