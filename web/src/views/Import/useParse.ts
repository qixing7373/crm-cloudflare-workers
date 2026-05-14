import ExcelJS from 'exceljs'
import type { ContactField } from '@/api/field'

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/
const STATUS_KEYS = ['状态', '开发状态', '数据状态', 'status', 'develop_status']
const STATUS_DEVELOPED_VALUES = new Set(['已开发', 'developed', '开发', 'done', '1', 'yes', 'y'])

export function cleanPhone(rawPhone: string, p = rawPhone.replace(/[^\d+]/g, '')) {
  const normalized = p.startsWith('+') ? p : `+${p}`
  return PHONE_REGEX.test(normalized) ? normalized : null
}

function parseCsvLine(line: string) {
  return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((s) =>
    s
      .replace(/(^"|"$)/g, '')
      .replace(/""/g, '"')
      .trim()
  )
}

async function parseCsv(file: File) {
  const lines = (await file.text()).split(/\r?\n/).filter((x) => x.trim())
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0])
  return lines
    .slice(1)
    .map((line) =>
      Object.fromEntries(parseCsvLine(line).map((value, index) => [headers[index], value || '']))
    )
}

async function parseXlsx(file: File) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await file.arrayBuffer())
  const sh = wb.worksheets[0]
  if (!sh || sh.rowCount < 2) return []

  const headers: string[] = []
  sh.getRow(1).eachCell((c, i) => {
    headers[i - 1] = String(c.value || '').trim()
  })

  return Array.from({ length: sh.rowCount - 1 }, (_, i) => sh.getRow(i + 2))
    .map((row) =>
      Object.fromEntries(
        headers.map((key, index) => [key, String(row.getCell(index + 1)?.value || '').trim()])
      )
    )
    .filter((row) => Object.values(row).some(Boolean))
}

export async function parseFile(file: File) {
  if (file.name.toLowerCase().endsWith('csv')) return parseCsv(file)
  if (file.name.match(/\.xlsx?$/)) return parseXlsx(file)
  throw new Error('UNSUPPORTED_FORMAT')
}

export function matchFields(headers: string[], fields: ContactField[]) {
  const fieldMap: any = {}
  const phoneKeys = ['手机', '手机号', 'phone', 'mobile', '电话']
  const unmappedHeaders: string[] = []

  const phoneIndex = headers.findIndex((h) => phoneKeys.includes(h.trim().toLowerCase()))
  const statusIndex = headers.findIndex((h) => STATUS_KEYS.includes(h.trim().toLowerCase()))

  headers.forEach((h, i) => {
    if (!h) return
    if (i === statusIndex) return
    const match = fields.find((x) =>
      [x.label, x.label_en?.toLowerCase(), x.key].includes(h.trim().toLowerCase())
    )
    if (match) {
      fieldMap[i] = match.key
      return
    }
    unmappedHeaders.push(h)
    fieldMap[i] = h
  })

  return { fieldMap, phoneIndex, statusIndex, unmappedHeaders }
}

function normalizeStatus(raw: unknown): 'undeveloped' | 'developed' {
  const value = String(raw || '')
    .trim()
    .toLowerCase()
  return STATUS_DEVELOPED_VALUES.has(value) ? 'developed' : 'undeveloped'
}

export function cleanRows(
  rows: any[],
  fieldMap: any,
  phoneIndex: number,
  unmappedHeaders: string[] = []
) {
  const seenMap = new Map()
  rows.forEach((r) => {
    const vals = Object.values(r)
    const phone = cleanPhone(String(vals[phoneIndex] || ''))
    if (!phone) return

    seenMap.set(phone, {
      phone,
      status: normalizeStatus((r as any).__import_status),
      data: Object.entries(fieldMap).reduce((acc: any, [col, key]: any) => {
        if (!unmappedHeaders.includes(key) && vals[col]) acc[key] = vals[col]
        return acc
      }, {})
    })
  })
  return [...seenMap.values()]
}

export async function parseAndClean(file: File, fieldConfigs: ContactField[]) {
  const rows = await parseFile(file)
  if (!rows.length) throw new Error('EMPTY_FILE')

  const { fieldMap, phoneIndex, statusIndex, unmappedHeaders } = matchFields(
    Object.keys(rows[0]),
    fieldConfigs
  )
  if (phoneIndex < 0) throw new Error('NO_PHONE_COLUMN')

  const rowsWithStatus = rows.map((row) => {
    const vals = Object.values(row)
    return {
      ...row,
      __import_status: statusIndex >= 0 ? vals[statusIndex] : ''
    }
  })
  const cleanList = cleanRows(rowsWithStatus, fieldMap, phoneIndex, unmappedHeaders)
  if (!cleanList.length) throw new Error('NO_VALID_ROWS')

  return {
    clean_list: cleanList,
    file_name: file.name,
    total_raw: rows.length,
    headers: fieldConfigs
      .filter((x) => Object.values(fieldMap).includes(x.key))
      .map((x) => ({ key: x.key, label: x.label }))
  }
}
