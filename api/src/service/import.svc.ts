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
}

export interface ImportReport {
  added_list: ImportRow[]
  updated_list: Array<ImportRow & { contact_id: number; changes: Record<string, { old: unknown; new: unknown }> }>
  skipped_list: Array<ImportRow & { contact_id: number }>
  frozen_list: Array<ImportRow & { contact_id: number; reason: string }>
  total: number
  token: string
}

export interface FieldConfig {
  key: string
  label: string
  label_en: string | null
  editable: boolean
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

export interface SyncRowResult {
  phone: string
  type: 'added' | 'updated' | 'skipped' | 'frozen'
  changes?: Record<string, { old: unknown; new: unknown }>
  reason?: string
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
  import_id?: number,
  queue?: Queue
): Promise<{ import_id: number; results: SyncRowResult[]; chunk_size: number }> {
  let _import_id = import_id

  if (!_import_id) {
    const _import_result = await ImportDao.insertLog(db, {
      user_id,
      file: file_name,
      file_hash,
      total: 0,
      added: 0,
      updated: 0,
      skipped: 0,
      frozen: 0,
    })

    _import_id = _import_result[0].id
  }

  if (!queue) {
    throw new Error('SYNC_QUEUE is not configured')
  }

  for (let i = 0; i < clean_list.length; i += 100) {
    const batch = clean_list.slice(i, i + 100)

    await queue.sendBatch(
      batch.map((row) => ({
        body: {
          row,
          user_id,
          import_id: _import_id,
        },
      }))
    )
  }

  return {
    import_id: _import_id,
    results: clean_list.map((row) => ({
      phone: row.phone,
      type: 'skipped',
      reason: 'queued',
    })) as SyncRowResult[],
    chunk_size: 1000,
  }
}
