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
// export async function syncImport(
//   clean_list: ImportRow[],
//   user_id: number,
//   db: DrizzleD1Database<any>,
//   file_name: string,
//   file_hash: string,
//   import_id?: number
// ): Promise<{ import_id: number; results: SyncRowResult[]; chunk_size: number }> {
//   const _now = new Date()
//   const _results: SyncRowResult[] = []
//   const _added: ImportRow[] = []
//   const _updated: Array<ImportRow & { contact_id: number; changes: Record<string, { old: unknown; new: unknown }> }> = []
//   let _skipped = 0
//   let _frozen = 0

//   // 1. 分批查询 D1 进行四路分类
//   for (let _i = 0; _i < clean_list.length; _i += BATCH_SIZE) {
//     const _batch = clean_list.slice(_i, _i + BATCH_SIZE)
//     const _phones = _batch.map(r => r.phone)
//     const _existing = await ContactDao.findByPhones(db, _phones)
//     const _exist_map = new Map(_existing.map(e => [e.phone, e]))

//     for (const _row of _batch) {
//       const _old = _exist_map.get(_row.phone)

//       if (!_old) {
//         _added.push(_row)
//         _results.push({ phone: _row.phone, type: 'added' })
//         continue
//       }

//       if (_old.status === 'developed') {
//         _frozen++
//         _results.push({
//           phone: _row.phone,
//           type: 'frozen',
//           reason: `资源已被用户 ${_old.owner_id} 开发，触发防写保护`
//         })
//         continue
//       }

//       const _old_data = typeof _old.data === 'string' ? JSON.parse(_old.data) : (_old.data || {})
//       const _changes = diffRecord(_old_data, _row.data)

//       if (Object.keys(_changes).length > 0) {
//         _updated.push({ ..._row, contact_id: _old.id, changes: _changes })
//         _results.push({ phone: _row.phone, type: 'updated', changes: _changes })
//       } else {
//         _skipped++
//         _results.push({ phone: _row.phone, type: 'skipped' })
//       }
//     }
//   }

//   // 2. 创建或更新导入日志
//   let _import_id = import_id
//   if (!_import_id) {
//     const _import_result = await ImportDao.insertLog(db, {
//       user_id,
//       file: file_name,
//       file_hash,
//       total: clean_list.length,
//       added: _added.length,
//       updated: _updated.length,
//       skipped: _skipped,
//       frozen: _frozen,
//     })
//     _import_id = _import_result[0].id
//   } else {
//     await ImportDao.incrementLogCounters(db, _import_id, {
//       total: clean_list.length,
//       added: _added.length,
//       updated: _updated.length,
//       skipped: _skipped,
//       frozen: _frozen,
//     })
//   }

//   // 3. 直接入库（与原 confirmImport 相同逻辑）

//   for (let i = 0; i < _added.length; i += INSERT_BATCH_SIZE) {
//     const batch = _added.slice(i, i + INSERT_BATCH_SIZE)
//     const contactValues = batch.map(row => ({
//       phone: row.phone,
//       data: JSON.stringify(row.data),
//       status: 'undeveloped' as const,
//       import_count: 1,
//       first_imported_at: _now,
//       latest_imported_at: _now,
//     }))

//     const _contact_results = await ContactDao.insertBatch(db, contactValues)

//     const logValues = _contact_results.map(c => ({
//       contact_id: c.id,
//       user_id,
//       import_id: _import_id,
//       type: 'create' as const,
//     }))
//     await ContactLogDao.insertBatch(db, logValues)
//   }

//   for (let i = 0; i < _updated.length; i += INSERT_BATCH_SIZE) {
//     const batch = _updated.slice(i, i + INSERT_BATCH_SIZE)
//     const updateQueries = batch.map(row =>
//       ContactDao.updateImportData(db, row.contact_id, JSON.stringify(row.data), _now)
//     )
//     await db.batch(updateQueries as any)

//     const logValues = batch.map(row => ({
//       contact_id: row.contact_id,
//       user_id,
//       import_id: _import_id,
//       type: 'update' as const,
//       changes: JSON.stringify(row.changes),
//     }))
//     await ContactLogDao.insertBatch(db, logValues)
//   }

//   await ImportDao.insertUserLog(db, {
//     user_id,
//     action: 'import',
//     details: JSON.stringify({
//       import_id: _import_id,
//       added: _added.length,
//       updated: _updated.length,
//       skipped: _skipped,
//       frozen: _frozen,
//     }),
//   })

//   return {
//     import_id: _import_id,
//     results: _results,
//     chunk_size: 200
//   }
// }
