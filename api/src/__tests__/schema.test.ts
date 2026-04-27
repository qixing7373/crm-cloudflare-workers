import { describe, it, expect } from 'bun:test'
import * as schema from '../schema'

describe('schema 表结构验证', () => {
  it('共 6 张表全部导出', () => {
    const _tables = [
      schema.contactField, schema.userGroup,
      schema.user, schema.contact,
      schema.contactLog, schema.importLog, schema.userLog,
    ]
    expect(_tables).toHaveLength(7)
    _tables.forEach(_t => expect(_t).toBeDefined())
  })
})
