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
  import_id?: number
): Promise<{ import_id: number; results: SyncRowResult[]; chunk_size: number }> {
  const _now = new Date()
  const _results: SyncRowResult[] = []

  let totalAdded = 0
  let totalUpdated = 0
  let totalSkipped = 0
  let totalFrozen = 0

  // 1. 先创建/复用导入日志
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

  // 2. 分批：查一批，处理一批，立即写一批
  for (let _i = 0; _i < clean_list.length; _i += BATCH_SIZE) {
    const _batch = clean_list.slice(_i, _i + BATCH_SIZE)
    const _phones = _batch.map((r) => r.phone)

    const _existing = await ContactDao.findByPhones(db, _phones)
    const _exist_map = new Map(_existing.map((e) => [e.phone, e]))

    const _to_add: ImportRow[] = []
    const _to_update: Array<
      ImportRow & {
        contact_id: number
        changes: Record<string, { old: unknown; new: unknown }>
      }
    > = []

    let batchSkipped = 0
    let batchFrozen = 0

    for (const _row of _batch) {
      const _old = _exist_map.get(_row.phone)

      if (!_old) {
        _to_add.push(_row)
        _results.push({
          phone: _row.phone,
          type: 'added',
        })
        continue
      }

      if (_old.status === 'developed') {
        batchFrozen++
        _results.push({
          phone: _row.phone,
          type: 'frozen',
          reason: `资源已被用户 ${_old.owner_id} 开发，触发防写保护`,
        })
        continue
      }

      const _old_data =
        typeof _old.data === 'string'
          ? JSON.parse(_old.data)
          : _old.data || {}

      const _changes = diffRecord(_old_data, _row.data)

      if (Object.keys(_changes).length > 0) {
        _to_update.push({
          ..._row,
          contact_id: _old.id,
          changes: _changes,
        })

        _results.push({
          phone: _row.phone,
          type: 'updated',
          changes: _changes,
        })
      } else {
        batchSkipped++
        _results.push({
          phone: _row.phone,
          type: 'skipped',
        })
      }
    }

    // 3. 新增数据：分批写入
    for (let j = 0; j < _to_add.length; j += INSERT_BATCH_SIZE) {
      const batch = _to_add.slice(j, j + INSERT_BATCH_SIZE)

      const contactValues = batch.map((row) => ({
        phone: row.phone,
        data: JSON.stringify(row.data),
        status: 'undeveloped' as const,
        import_count: 1,
        first_imported_at: _now,
        latest_imported_at: _now,
      }))

      const _contact_results = await ContactDao.insertBatch(db, contactValues)

      if (_contact_results.length > 0) {
        const logValues = _contact_results.map((c) => ({
          contact_id: c.id,
          user_id,
          import_id: _import_id!,
          type: 'create' as const,
        }))

        await ContactLogDao.insertBatch(db, logValues)
      }
    }

    // 4. 更新数据：db.batch 批量执行
    for (let j = 0; j < _to_update.length; j += INSERT_BATCH_SIZE) {
      const batch = _to_update.slice(j, j + INSERT_BATCH_SIZE)

      const updateQueries = batch.map((row) =>
        ContactDao.updateImportData(
          db,
          row.contact_id,
          JSON.stringify(row.data),
          _now
        )
      )

      await db.batch(updateQueries as any)

      const logValues = batch.map((row) => ({
        contact_id: row.contact_id,
        user_id,
        import_id: _import_id!,
        type: 'update' as const,
        changes: JSON.stringify(row.changes),
      }))

      await ContactLogDao.insertBatch(db, logValues)
    }

    const batchAdded = _to_add.length
    const batchUpdated = _to_update.length

    totalAdded += batchAdded
    totalUpdated += batchUpdated
    totalSkipped += batchSkipped
    totalFrozen += batchFrozen

    // 5. 每个大批次更新一次导入统计，避免最后一次性堆积
    await ImportDao.incrementLogCounters(db, _import_id, {
      total: _batch.length,
      added: batchAdded,
      updated: batchUpdated,
      skipped: batchSkipped,
      frozen: batchFrozen,
    })
  }

  // 6. 只写一次用户操作日志
  await ImportDao.insertUserLog(db, {
    user_id,
    action: 'import',
    details: JSON.stringify({
      import_id: _import_id,
      added: totalAdded,
      updated: totalUpdated,
      skipped: totalSkipped,
      frozen: totalFrozen,
    }),
  })

  return {
    import_id: _import_id,
    results: _results,
    chunk_size: 500,
  }
}
