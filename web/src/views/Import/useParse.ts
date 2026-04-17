import ExcelJS from 'exceljs'
import type { ContactField } from '@/api/field'

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/

export function cleanPhone(rawPhone: string, p = rawPhone.replace(/[^\d+]/g, '')) {
  return PHONE_REGEX.test((p = p.startsWith('+') ? p : '+' + p)) ? p : null
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
    .map((x) => parseCsvLine(x).reduce((r, v, i) => ({ ...r, [headers[i]]: v || '' }), {}))
}

async function parseXlsx(file: File) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await file.arrayBuffer())
  const sh = wb.worksheets[0]
  if (!sh || sh.rowCount < 2) return []

  const headers: string[] = []
  sh.getRow(1).eachCell((c, i) => (headers[i] = String(c.value || '').trim()))

  return Array.from({ length: sh.rowCount - 1 })
    .map((_, i) => sh.getRow(i + 2))
    .reduce((res: any[], rowVals) => {
      const rowResult: any = {}
      return headers.some((k, j) => (rowResult[k] = String(rowVals.getCell(j)?.value || '').trim()))
        ? [...res, rowResult]
        : res
    }, [])
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

  headers.forEach((h, i) => {
    if (!h) return
    const match = fields.find((x) =>
      [x.label, x.label_en?.toLowerCase(), x.key].includes(h.trim().toLowerCase())
    )
    match ? (fieldMap[i] = match.key) : (unmappedHeaders.push(h), (fieldMap[i] = h))
  })

  return { fieldMap, phoneIndex, unmappedHeaders }
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
    if (!phone || seenMap.has(phone)) return

    seenMap.set(phone, {
      phone,
      data: Object.entries(fieldMap).reduce(
        (acc: any, [col, key]: any) =>
          !unmappedHeaders.includes(key) && vals[col] ? { ...acc, [key]: vals[col] } : acc,
        {}
      )
    })
  })
  return [...seenMap.values()]
}

export async function parseAndClean(file: File, fieldConfigs: ContactField[]) {
  const rows = await parseFile(file)
  if (!rows.length) throw new Error('EMPTY_FILE')

  const { fieldMap, phoneIndex, unmappedHeaders } = matchFields(Object.keys(rows[0]), fieldConfigs)
  if (phoneIndex < 0) throw new Error('NO_PHONE_COLUMN')

  const cleanList = cleanRows(rows, fieldMap, phoneIndex, unmappedHeaders)
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
