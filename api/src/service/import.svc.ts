import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { ContactDao, ContactLogDao } from '@/dao/contact.dao'
import { ImportDao } from '@/dao/import_log.dao'
import { FieldDao } from '@/dao/contact_field.dao'
import { cleanPhone } from '@/utility/cleanPhone'
import { diffRecord } from '@/utility/diffRecord'
import { BATCH_SIZE, INSERT_BATCH_SIZE } from '@/consts'

// ── 类型定义 ──

export interface ImportRow {
  phone: string
  data: Record<string, unknown>
  status?: 'undeveloped' | 'developed'
}

export interface ImportReport {
  added_list: ImportRow[]
  updated_list: UpdatedImportRow[]
  skipped_list: SkippedImportRow[]
  frozen_list: FrozenImportRow[]
  total: number
  token: string
}

export interface SyncRowResult {
  phone: string
  type: 'added' | 'updated' | 'skipped' | 'frozen'
  changes?: ImportChanges
  reason?: string
}

type ImportChanges = Record<string, { old: unknown; new: unknown }>
type UpdatedImportRow = ImportRow & { contact_id: number; changes: ImportChanges }
type SkippedImportRow = ImportRow & { contact_id: number }
type FrozenImportRow = ImportRow & { contact_id: number; reason: string }

interface ImportClassification {
  added_list: ImportRow[]
  updated_list: UpdatedImportRow[]
  skipped_list: SkippedImportRow[]
  frozen_list: FrozenImportRow[]
  results: SyncRowResult[]
}

export interface FieldConfig {
  key: string
  label: string
  label_en: string | null
  editable: boolean
}

export function matchFields(headers: string[], fields: FieldConfig[]) {
  const phoneKeys = new Set(['手机', '手机号', 'phone', 'mobile', '电话'])
  const field_map: Record<number, string> = {}
  const unmapped_headers: string[] = []

  const phone_index = headers.findIndex((header) => phoneKeys.has(header.trim().toLowerCase()))
  headers.forEach((header, index) => {
    const key = header.trim()
    if (!key) return
    const normalized = key.toLowerCase()
    const matched = fields.find((field) =>
      [field.key, field.label.toLowerCase(), field.label_en?.toLowerCase()].includes(normalized)
    )
    field_map[index] = matched?.key || key
    if (!matched) unmapped_headers.push(key)
  })

  return { field_map, phone_index, unmapped_headers }
}

export function cleanRows(rows: any[], fieldMap: Record<number, string>, phoneIndex: number) {
  const seen = new Map<string, ImportRow>()
  rows.forEach((row) => {
    const values = Object.values(row)
    const phone = cleanPhone(String(values[phoneIndex] || ''))
    if (!phone) return

    seen.set(phone, {
      phone,
      data: Object.fromEntries(
        Object.entries(fieldMap)
          .map(([index, key]) => [key, values[Number(index)]])
          .filter(([, value]) => value !== '' && value !== null && value !== undefined)
      ),
    })
  })
  return [...seen.values()]
}

function parseContactData(data: unknown): Record<string, unknown> {
  if (!data) return {}
  return typeof data === 'string' ? JSON.parse(data) : data as Record<string, unknown>
}

function getFrozenReason(ownerId: number | null) {
  return `资源已被用户 ${ownerId} 开发，触发防写保护`
}

function getImportChanges(old: { status: string; data: unknown }, row: ImportRow): ImportChanges {
  const changes: ImportChanges = diffRecord(parseContactData(old.data), row.data)
  if (row.status === 'developed') changes.status = { old: old.status, new: 'developed' }
  return changes
}

async function classifyImportRows(
  db: DrizzleD1Database<any>,
  cleanList: ImportRow[]
): Promise<ImportClassification> {
  const added_list: ImportRow[] = []
  const updated_list: UpdatedImportRow[] = []
  const skipped_list: SkippedImportRow[] = []
  const frozen_list: FrozenImportRow[] = []
  const results: SyncRowResult[] = []

  for (let i = 0; i < cleanList.length; i += BATCH_SIZE) {
    const batch = cleanList.slice(i, i + BATCH_SIZE)
    const existing = await ContactDao.findImportTargetsByPhones(db, batch.map((row) => row.phone))
    const exists = new Map(existing.map((row) => [row.phone, row]))

    for (const row of batch) {
      const old = exists.get(row.phone)

      if (!old) {
        added_list.push(row)
        results.push({ phone: row.phone, type: 'added' })
        continue
      }

      if (old.status === 'developed') {
        const reason = getFrozenReason(old.owner_id)
        frozen_list.push({ ...row, contact_id: old.id, reason })
        results.push({ phone: row.phone, type: 'frozen', reason })
        continue
      }

      const changes = getImportChanges(old, row)
      if (Object.keys(changes).length) {
        updated_list.push({ ...row, contact_id: old.id, changes })
        results.push({ phone: row.phone, type: 'updated', changes })
      } else {
        skipped_list.push({ ...row, contact_id: old.id })
        results.push({ phone: row.phone, type: 'skipped' })
      }
    }
  }

  return { added_list, updated_list, skipped_list, frozen_list, results }
}

export async function previewImport(
  clean_list: ImportRow[],
  user_id: number,
  db: DrizzleD1Database<any>
): Promise<ImportReport> {
  const { added_list, updated_list, skipped_list, frozen_list } = await classifyImportRows(db, clean_list)

  return {
    added_list,
    updated_list,
    skipped_list,
    frozen_list,
    total: clean_list.length,
    token: btoa(JSON.stringify({
      user_id,
      added: added_list.length,
      updated: updated_list.length,
      skipped: skipped_list.length,
      frozen: frozen_list.length,
      created_at: Date.now(),
    })),
  }
}

export async function confirmImport(
  added_list: ImportRow[],
  updated_list: ImportReport['updated_list'],
  _frozen: number,
  _skipped: number,
  user_id: number,
  db: DrizzleD1Database<any>,
  file_name: string,
  file_hash = ''
) {
  const cleanList = [
    ...added_list,
    ...updated_list.map(({ phone, data, status }) => ({ phone, data, status })),
  ]
  return syncImport(cleanList, user_id, db, file_name, file_hash)
}



// ── Service 查询方法（供 controller 调用）──

export async function listEnabledFields(db: DrizzleD1Database<any>) {
  const _fields = await FieldDao.listEnabled(db)
  return _fields.map((_f) => ({
    key: _f.key,
    label: _f.label,
    label_en: _f.label_en,
    editable: _f.editable ?? true,
  }))
}

export async function getHistory(db: DrizzleD1Database<any>, opts: { offset: number; size: number; q?: string }) {
  return ImportDao.listHistory(db, opts)
}

export async function getDetail(db: DrizzleD1Database<any>, id: number) {
  const _log = await ImportDao.findLogById(db, id)
  if (!_log) return null
  const _details = await ImportDao.listDetailsByImportId(db, id)
  return { log: _log, details: _details }
}

// ── 一体化同步入库（新架构：分类 + 直接入库 + 逐行结果）──

async function insertContactLogsBatched(db: DrizzleD1Database<any>, rows: any[]) {
  if (!rows.length) return
  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    await ContactLogDao.insertBatch(db, rows.slice(i, i + INSERT_BATCH_SIZE))
  }
}

/**
 * 接收前端分片数据，对每条记录执行：分类判断 → 直接入库 → 返回逐行结果
 * 合并了原来的 previewImport + confirmImport 两步操作
 */
export async function syncImport(
  clean_list: ImportRow[],
  user_id: number,
  db: DrizzleD1Database<any>,
  file_name: string,
  file_hash: string,
  import_id?: number
): Promise<{ import_id: number; results: SyncRowResult[]; chunk_size: number }> {
  const _now = new Date()
  const {
    added_list: _added,
    updated_list: _updated,
    skipped_list: _skipped,
    frozen_list: _frozen,
    results: _results,
  } = await classifyImportRows(db, clean_list)

  // 2. 创建或更新导入日志
  let _import_id = import_id
  if (!_import_id) {
    const _import_result = await ImportDao.insertLog(db, {
      user_id,
      file: file_name,
      file_hash,
      total: clean_list.length,
      added: _added.length,
      updated: _updated.length,
      skipped: _skipped.length,
      frozen: _frozen.length,
    })
    _import_id = _import_result[0].id
  } else {
    await ImportDao.incrementLogCounters(db, _import_id, {
      total: clean_list.length,
      added: _added.length,
      updated: _updated.length,
      skipped: _skipped.length,
      frozen: _frozen.length,
    })
  }

  // 3. 直接入库（与原 confirmImport 相同逻辑）

  for (let i = 0; i < _added.length; i += INSERT_BATCH_SIZE) {
    const batch = _added.slice(i, i + INSERT_BATCH_SIZE)
    const contactValues = batch.map(row => ({
      phone: row.phone,
      data: JSON.stringify(row.data),
      status: row.status === 'developed' ? 'developed' as const : 'undeveloped' as const,
      owner_id: row.status === 'developed' ? user_id : null,
      claimed_at: row.status === 'developed' ? _now : null,
      import_count: 1,
      first_imported_at: _now,
      latest_imported_at: _now,
      created_by: user_id,
    }))

    const _contact_results = await ContactDao.insertBatch(db, contactValues)

    const logValues = _contact_results.map(c => ({
      contact_id: c.id,
      user_id,
      import_id: _import_id,
      type: 'create' as const,
    }))
    await insertContactLogsBatched(db, logValues)
  }

  for (let i = 0; i < _updated.length; i += INSERT_BATCH_SIZE) {
    const batch = _updated.slice(i, i + INSERT_BATCH_SIZE)
    const updateQueries = batch.map(row =>
      ContactDao.updateImportData(
        db,
        row.contact_id,
        JSON.stringify(row.data),
        _now,
        row.status === 'developed' ? user_id : undefined
      )
    )
    await db.batch(updateQueries as any)

    const logValues = batch.map(row => ({
      contact_id: row.contact_id,
      user_id,
      import_id: _import_id,
      type: 'update' as const,
      changes: JSON.stringify(row.changes),
    }))
    await insertContactLogsBatched(db, logValues)
  }

  await insertContactLogsBatched(db, [
    ..._skipped.map(row => ({
      contact_id: row.contact_id,
      user_id,
      import_id: _import_id,
      type: 'reimport' as const,
    })),
    ..._frozen.map(row => ({
      contact_id: row.contact_id,
      user_id,
      import_id: _import_id,
      type: 'frozen_import' as const,
      changes: JSON.stringify({ reason: row.reason }),
    })),
  ])

  await ImportDao.insertUserLog(db, {
    user_id,
    action: 'import',
    details: JSON.stringify({
      import_id: _import_id,
      added: _added.length,
      updated: _updated.length,
      skipped: _skipped.length,
      frozen: _frozen.length,
    }),
  })

  return {
    import_id: _import_id,
    results: _results,
    chunk_size: BATCH_SIZE
  }
}
