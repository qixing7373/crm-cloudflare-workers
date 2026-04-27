import { describe, it, expect } from 'bun:test'
import { matchFields } from '../service/import.svc'
import type { FieldConfig } from '../service/import.svc'

const FIELDS: FieldConfig[] = [
  { key: 'name', label: '姓名', label_en: 'Name', editable: true },
  { key: 'gender', label: '性别', label_en: 'Gender', editable: true },
  { key: 'age', label: '年龄', label_en: 'Age', editable: true },
  { key: 'country', label: '国家', label_en: 'Country', editable: true },
]

describe('matchFields 动态字段匹配', () => {
  it('#1 中文 label 匹配', () => {
    const _r = matchFields(['姓名', '年龄'], FIELDS)
    expect(_r.field_map[0]).toBe('name')
    expect(_r.field_map[1]).toBe('age')
  })
  it('#2 英文 label_en 匹配', () => {
    const _r = matchFields(['Name', 'Country'], FIELDS)
    expect(_r.field_map[0]).toBe('name')
    expect(_r.field_map[1]).toBe('country')
  })
  it('#3 key 匹配', () => {
    const _r = matchFields(['name', 'gender'], FIELDS)
    expect(_r.field_map[0]).toBe('name')
    expect(_r.field_map[1]).toBe('gender')
  })
  it('#4 手机号列识别', () => {
    const _r = matchFields(['手机', '姓名'], FIELDS)
    expect(_r.phone_index).toBe(0)
    expect(_r.field_map[1]).toBe('name')
  })
  it('#5 无匹配列分离警告', () => {
    const _r = matchFields(['备注', '什么鬼'], FIELDS)
    expect(Object.keys(_r.field_map)).toHaveLength(2)
    expect(_r.field_map[0]).toBe('备注')
    expect(_r.field_map[1]).toBe('什么鬼')
    expect(_r.unmapped_headers).toEqual(['备注', '什么鬼'])
    expect(_r.phone_index).toBe(-1)
  })
  it('phone/mobile/电话 都能识别', () => {
    expect(matchFields(['phone'], FIELDS).phone_index).toBe(0)
    expect(matchFields(['mobile'], FIELDS).phone_index).toBe(0)
    expect(matchFields(['电话'], FIELDS).phone_index).toBe(0)
  })
})
