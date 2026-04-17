import { describe, it, expect } from 'bun:test'
import { checkPasswordComplexity } from '../service/auth.svc'

describe('checkPasswordComplexity', () => {
  it('合规密码通过', () => { expect(checkPasswordComplexity('Admin123')).toBe(true) })
  it('含特殊字符通过', () => { expect(checkPasswordComplexity('Str0ng!Pass#2026')).toBe(true) })
  it('缺少大写字母', () => { expect(checkPasswordComplexity('admin123')).toBe(false) })
  it('缺少小写字母', () => { expect(checkPasswordComplexity('ADMIN123')).toBe(false) })
  it('缺少数字', () => { expect(checkPasswordComplexity('AdminPass')).toBe(false) })
  it('长度不足', () => { expect(checkPasswordComplexity('Ad1')).toBe(false) })
  it('纯数字', () => { expect(checkPasswordComplexity('12345678')).toBe(false) })
  it('空串', () => { expect(checkPasswordComplexity('')).toBe(false) })
})
