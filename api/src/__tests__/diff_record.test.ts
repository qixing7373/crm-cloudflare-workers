import { describe, it, expect } from 'bun:test'
import { diffRecord } from '../utility/diffRecord'

describe('diffRecord', () => {
  it('无变化返回空对象', () => {
    expect(diffRecord({ name: '张三', age: 30 }, { name: '张三', age: 30 })).toEqual({})
  })

  it('单字段变化', () => {
    expect(diffRecord({ job: '教师' }, { job: '司机' })).toEqual({ job: { old: '教师', new: '司机' } })
  })

  it('多字段变化', () => {
    const _r = diffRecord({ name: '张三', city: '北京' }, { name: '李四', city: '上海' })
    expect(_r.name).toEqual({ old: '张三', new: '李四' })
    expect(_r.city).toEqual({ old: '北京', new: '上海' })
  })

  it('新增字段', () => {
    expect(diffRecord({ name: '张三' }, { name: '张三', email: 'a@b.com' })).toEqual({ email: { old: null, new: 'a@b.com' } })
  })

  it('删除字段', () => {
    expect(diffRecord({ name: '张三', phone: '+86138' }, { name: '张三' })).toEqual({ phone: { old: '+86138', new: null } })
  })
})
