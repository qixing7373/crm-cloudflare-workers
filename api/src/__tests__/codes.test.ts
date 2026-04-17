import { describe, it, expect } from 'bun:test'
import { ErrorCode, ErrorMsg } from '@/codes'

describe('ErrorCode', () => {
  it('所有错误码都是负数', () => {
    for (const _val of Object.values(ErrorCode)) {
      expect(_val).toBeLessThan(0)
    }
  })

  it('所有错误码都有对应消息', () => {
    for (const _val of Object.values(ErrorCode)) {
      expect(ErrorMsg[_val as number]).toBeDefined()
      expect((ErrorMsg[_val as number] as string).length).toBeGreaterThan(0)
    }
  })

  it('错误码不重复', () => {
    const _values = Object.values(ErrorCode)
    expect(new Set(_values).size).toBe(_values.length)
  })

  it('包含 22 个错误码', () => {
    expect(Object.keys(ErrorCode).length).toBe(22)
  })

  it('关键错误码存在', () => {
    expect(ErrorCode.USERNAME_EXISTS).toBe(-100)
    expect(ErrorCode.COLLISION_DETECTED).toBe(-201)
    expect(ErrorCode.FORBIDDEN).toBe(-400)
    expect(ErrorCode.UNAUTHORIZED).toBe(-401)
    expect(ErrorCode.INTERNAL_ERROR).toBe(-500)
  })
})
