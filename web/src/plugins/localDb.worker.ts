import * as Comlink from 'comlink'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { runMigrations } from './localDb.migrations'

let db: Database | null = null
let storageMode = 'unknown'

function query<T>(sql: string, bind?: any[]): T[] {
  if (!db) throw new Error('DB not initialized')
  const results: T[] = []
  db.exec({
    sql,
    bind,
    rowMode: 'object',
    callback: (row: any) => {
      results.push(row as T)
    }
  })
  return results
}

// ── 暴露给主线程的 API ──
const dbApi = {
  async init() {
    if (db) return storageMode
    const sqlite3 = await sqlite3InitModule()
    console.log('[Worker] SQLite WASM:', sqlite3.version.libVersion)

    // 优先 SAH Pool → OpfsDb → 内存
    try {
      const pool = await sqlite3.installOpfsSAHPoolVfs({
        initialCapacity: 6,
        directory: '.crm-sqlite'
      })
      db = new pool.OpfsSAHPoolDb('/crm-import.db')
      storageMode = 'opfs-sahpool'
      console.log('[Worker] ✅ OPFS SAH Pool')
    } catch {
      try {
        db = new sqlite3.oo1.OpfsDb('/crm-import.db')
        storageMode = 'opfs'
        console.log('[Worker] ✅ OpfsDb')
      } catch {
        db = new sqlite3.oo1.DB({ filename: ':memory:' })
        storageMode = 'memory'
        console.warn('[Worker] ⚠ 内存模式')
      }
    }

    runMigrations(db)

    return storageMode
  },

  checkBatchByHash(hash: string) {
    const res = query<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM import_batch WHERE file_hash=?`,
      [hash]
    )
    return (res[0]?.cnt || 0) > 0
  },

  insertImportData(
    batchId: string,
    fileName: string,
    fileHash: string,
    total: number,
    rows: Array<{ phone: string; data: Record<string, any> }>,
    headers?: any[]
  ) {
    const now = Date.now()
    db!.exec('BEGIN TRANSACTION')
    try {
      db!.exec({
        sql: `INSERT INTO import_batch (batch_id, file_name, file_hash, total, headers, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        bind: [batchId, fileName, fileHash, total, headers ? JSON.stringify(headers) : null, now]
      })
      rows.forEach((row) =>
        db!.exec({
          sql: `INSERT INTO import_queue (batch_id, phone, data, file_name, created_at) VALUES (?, ?, ?, ?, ?)`,
          bind: [batchId, row.phone, JSON.stringify(row.data), fileName, now]
        })
      )
      db!.exec('COMMIT')
    } catch (e) {
      db!.exec('ROLLBACK')
      throw e
    }
  },

  updateBatchImportId(batchId: string, importId: number) {
    db!.exec({
      sql: `UPDATE import_batch SET import_id = ? WHERE batch_id = ?`,
      bind: [importId, batchId]
    })
  },

  updateBatchProgress(
    batchId: string,
    counts: { added: number; updated: number; skipped: number; frozen: number; synced: number }
  ) {
    db!.exec({
      sql: `UPDATE import_batch SET added=added+?, updated=updated+?, skipped=skipped+?, frozen=frozen+?, synced=synced+? WHERE batch_id=?`,
      bind: [counts.added, counts.updated, counts.skipped, counts.frozen, counts.synced, batchId]
    })
  },

  markBatchDone(batchId: string) {
    db!.exec({ sql: `UPDATE import_batch SET status='done' WHERE batch_id=?`, bind: [batchId] })
  },
  markBatchError(batchId: string) {
    db!.exec({ sql: `UPDATE import_batch SET status='error' WHERE batch_id=?`, bind: [batchId] })
  },

  listBatches() {
    return query(`SELECT * FROM import_batch ORDER BY created_at DESC`)
  },
  listSyncingBatches() {
    return query(`SELECT * FROM import_batch WHERE status='syncing' ORDER BY created_at ASC`)
  },

  getPendingRows(batchId: string, limit: number) {
    return query(`SELECT * FROM import_queue WHERE batch_id=? AND sync_status='pending' LIMIT ?`, [
      batchId,
      limit
    ])
  },

  markRowsSynced(results: Array<{ id: number; type: string; changes?: any; reason?: string }>) {
    db!.exec('BEGIN TRANSACTION')
    try {
      results.forEach((record) =>
        db!.exec({
          sql: `UPDATE import_queue SET sync_status='synced', sync_type=?, changes=?, reason=? WHERE id=?`,
          bind: [
            record.type,
            record.changes ? JSON.stringify(record.changes) : null,
            record.reason || null,
            record.id
          ]
        })
      )
      db!.exec('COMMIT')
    } catch (e) {
      db!.exec('ROLLBACK')
      throw e
    }
  },

  getRowsByBatchAndType(batchId: string, syncType: string, offset: number, limit: number) {
    return query(
      `SELECT * FROM import_queue WHERE batch_id=? AND sync_type=? ORDER BY id ASC LIMIT ? OFFSET ?`,
      [batchId, syncType, limit, offset]
    )
  },

  getRowsByBatchPending(batchId: string, offset: number, limit: number) {
    return query(
      `SELECT * FROM import_queue WHERE batch_id=? AND sync_status='pending' ORDER BY id ASC LIMIT ? OFFSET ?`,
      [batchId, limit, offset]
    )
  },

  countByBatchAndType(batchId: string) {
    const counts = { added: 0, updated: 0, skipped: 0, frozen: 0, pending: 0 }
    query<{ sync_type: string; cnt: number }>(
      `SELECT sync_type, COUNT(*) as cnt FROM import_queue WHERE batch_id=? AND sync_status='synced' GROUP BY sync_type`,
      [batchId]
    ).forEach((record) => {
      if (record.sync_type in counts) (counts as any)[record.sync_type] = record.cnt
    })
    const pendingRows = query<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM import_queue WHERE batch_id=? AND sync_status='pending'`,
      [batchId]
    )
    counts.pending = pendingRows[0]?.cnt || 0
    return counts
  },

  queryBatchRows(
    batchId: string,
    tab: string,
    keyword: string,
    isTail: boolean,
    limit: number,
    offset: number
  ) {
    let sql = ` FROM import_queue WHERE batch_id = ?`
    const params: any[] = [batchId]

    if (tab === 'pending') {
      sql += ` AND sync_status = 'pending'`
    } else {
      sql += ` AND sync_status = 'synced' AND sync_type = ?`
      params.push(tab)
    }

    if (keyword) {
      if (isTail) {
        sql += ` AND phone LIKE ?`
        params.push(`%${keyword}`)
      } else {
        sql += ` AND (phone LIKE ? OR data LIKE ?)`
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
    }

    const countRes = query<{ cnt: number }>(`SELECT COUNT(*) as cnt` + sql, params)
    const rows = query(`SELECT *` + sql + ` ORDER BY id ASC LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      offset
    ])

    return { total: countRes[0]?.cnt || 0, rows }
  },

  clearAllLocalData() {
    db!.exec('BEGIN TRANSACTION')
    try {
      db!.exec('DELETE FROM import_queue')
      db!.exec('DELETE FROM import_batch')
      db!.exec('COMMIT')
    } catch (e) {
      db!.exec('ROLLBACK')
      throw e
    }
  }
}

export type DbApi = typeof dbApi
Comlink.expose(dbApi)
