import { describe, it, expect } from 'bun:test'
import { cleanPhone } from '../utility/cleanPhone'

describe('cleanPhone', () => {
  it('正常国际号码原样返回', () => {
    expect(cleanPhone('+8613812345678')).toBe('+8613812345678')
  })

  it('自动补 + 号', () => {
    expect(cleanPhone('8613812345678')).toBe('+8613812345678')
  })

  it('去除空格', () => {
    expect(cleanPhone(' +86 138 1234 5678 ')).toBe('+8613812345678')
  })

  it('去除短横线', () => {
    expect(cleanPhone('+66-81-234-5678')).toBe('+66812345678')
  })

  it('位数不足返回 null', () => {
    expect(cleanPhone('+123')).toBeNull()
  })

  it('超长号码返回 null', () => {
    expect(cleanPhone('+12345678901234567890')).toBeNull()
  })

  it('纯字母返回 null', () => {
    expect(cleanPhone('abcdefg')).toBeNull()
  })

  it('空串返回 null', () => {
    expect(cleanPhone('')).toBeNull()
  })
})
