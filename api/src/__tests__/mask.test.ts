import { describe, it, expect } from 'bun:test'
import { maskPhone, maskEmail } from '../utility/mask'

describe('maskPhone', () => {
  it('标准国际号码', () => { expect(maskPhone('+8613812345678')).toBe('+861****5678') })
  it('短号码显示 ***', () => { expect(maskPhone('+123')).toBe('***') })
  it('空串返回 ***', () => { expect(maskPhone('')).toBe('***') })
  it('泰国号码', () => { expect(maskPhone('+66812345678')).toBe('+668****5678') })
})

describe('maskEmail', () => {
  it('标准邮箱', () => { expect(maskEmail('wang@gmail.com')).toBe('w***@gmail.com') })
  it('空串返回 ***', () => { expect(maskEmail('')).toBe('***') })
  it('无 @ 返回 ***', () => { expect(maskEmail('invalid')).toBe('***') })
  it('长用户名只保留首字母', () => { expect(maskEmail('longuser@example.com')).toBe('l***@example.com') })
})
