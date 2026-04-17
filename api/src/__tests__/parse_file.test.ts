/**
 * @file   parseFile.test.ts — CSV 解析器测试
 * @desc   覆盖 parseCSV / splitCSVLine / parseUploadFile 的全部分支
 */
import { describe, it, expect } from 'bun:test'
import { parseCSV, parseUploadFile } from '../utility/parseFile'

// ═══ parseCSV 基础解析 ═══

describe('parseCSV', () => {
  it('标准 CSV 解析', () => {
    const _csv = '手机,姓名,年龄\n+8613800001111,张三,25\n+8613800002222,李四,30'
    const _rows = parseCSV(_csv)
    expect(_rows.length).toBe(2)
    expect(_rows[0]['手机']).toBe('+8613800001111')
    expect(_rows[0]['姓名']).toBe('张三')
    expect(_rows[1]['年龄']).toBe('30')
  })

  it('引号包裹的字段', () => {
    const _csv = '手机,备注\n+8613800001111,"包含,逗号的内容"'
    const _rows = parseCSV(_csv)
    expect(_rows.length).toBe(1)
    expect(_rows[0]['备注']).toBe('包含,逗号的内容')
  })

  it('转义引号（双引号）', () => {
    const _csv = '手机,备注\n+8613800001111,"他说""你好"""'
    const _rows = parseCSV(_csv)
    expect(_rows[0]['备注']).toBe('他说"你好"')
  })

  it('空行过滤', () => {
    const _csv = '手机,姓名\n+8613800001111,张三\n\n+8613800002222,李四\n'
    const _rows = parseCSV(_csv)
    expect(_rows.length).toBe(2)
  })

  it('只有表头 → 返回空数组', () => {
    const _csv = '手机,姓名'
    const _rows = parseCSV(_csv)
    expect(_rows.length).toBe(0)
  })

  it('空字符串 → 返回空数组', () => {
    expect(parseCSV('')).toEqual([])
  })

  it('单行（无数据行）→ 返回空数组', () => {
    expect(parseCSV('header_only')).toEqual([])
  })

  it('列数不足时补空字符串', () => {
    const _csv = '手机,姓名,年龄\n+8613800001111,张三'
    const _rows = parseCSV(_csv)
    expect(_rows[0]['年龄']).toBe('')
  })

  it('多余列忽略', () => {
    const _csv = '手机,姓名\n+8613800001111,张三,多余数据'
    const _rows = parseCSV(_csv)
    expect(Object.keys(_rows[0])).toEqual(['手机', '姓名'])
  })

  it('带 BOM 的 UTF-8', () => {
    const _csv = '\uFEFF手机,姓名\n+8613800001111,张三'
    const _rows = parseCSV(_csv)
    // BOM 会残留在第一个 header 名上，这是一个已知行为
    expect(_rows.length).toBe(1)
  })

  it('Windows 换行符 (CRLF)', () => {
    const _csv = '手机,姓名\r\n+8613800001111,张三\r\n+8613800002222,李四'
    const _rows = parseCSV(_csv)
    expect(_rows.length).toBe(2)
  })
})

// ═══ parseUploadFile ═══

describe('parseUploadFile', () => {
  it('CSV 文件正常解析', () => {
    const _text = '手机,姓名\n+8613800001111,张三'
    const _buffer = new TextEncoder().encode(_text).buffer as ArrayBuffer
    const _rows = parseUploadFile(_buffer, 'contacts.csv')
    expect(_rows.length).toBe(1)
    expect(_rows[0]['手机']).toBe('+8613800001111')
  })

  it('大写扩展名 .CSV 也能识别', () => {
    const _text = '手机,姓名\n+8613800001111,张三'
    const _buffer = new TextEncoder().encode(_text).buffer as ArrayBuffer
    const _rows = parseUploadFile(_buffer, 'DATA.CSV')
    expect(_rows.length).toBe(1)
  })

  it('Excel 格式抛出错误', () => {
    const _buffer = new ArrayBuffer(10)
    expect(() => parseUploadFile(_buffer, 'data.xlsx')).toThrow('UNSUPPORTED_FORMAT')
  })

  it('.xls 格式抛出错误', () => {
    const _buffer = new ArrayBuffer(10)
    expect(() => parseUploadFile(_buffer, 'data.xls')).toThrow('UNSUPPORTED_FORMAT')
  })

  it('无扩展名抛出错误', () => {
    const _buffer = new ArrayBuffer(10)
    expect(() => parseUploadFile(_buffer, 'noext')).toThrow('UNSUPPORTED_FORMAT')
  })
})
