import { ImportApi, type ImportCleanRow } from '@/api/import'
import {
  type BatchRecord,
  getPendingRows,
  initLocalDb,
  listSyncingBatches,
  markBatchDone,
  markBatchError,
  markRowsSynced,
  updateBatchImportId,
  updateBatchProgress
} from '@/plugins/localDb'

let [_syncRunning, _dbInitialized] = [false, false]
const SYNC_CHUNK_SIZE = 200
const SYNC_RETRY_LIMIT = 2
const SYNC_RETRY_DELAY = 800

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const notifySyncUpdate = () => window.dispatchEvent(new CustomEvent('import-sync-update'))

export const initSyncEngine = async () => {
  if (_dbInitialized) return
  try {
    await initLocalDb()
    _dbInitialized = true
    if ((await listSyncingBatches()).length > 0) startSyncEngine()
  } catch {}
}

export const startSyncEngine = async () => {
  if (_syncRunning) return
  _syncRunning = true
  try {
    while (_syncRunning) {
      const batches = await listSyncingBatches()
      if (!batches.length) {
        _syncRunning = false
        return
      }
      for (const batch of batches) await syncBatch(batch)
    }
  } catch {
    _syncRunning = false
  }
}

const syncBatch = async (batch: BatchRecord) => {
  try {
    let retryCount = 0
    while (true) {
      const pendingRows = await getPendingRows(batch.batch_id, SYNC_CHUNK_SIZE)
      if (!pendingRows.length) {
        await markBatchDone(batch.batch_id)
        notifySyncUpdate()
        return
      }

      const payload: {
        clean_list: ImportCleanRow[]
        file_name: string
        file_hash: string
        import_id?: number
      } = {
        clean_list: pendingRows.map((row) => ({
          phone: row.phone,
          data: row.data ? JSON.parse(row.data) : {},
          status: row.import_status || 'undeveloped'
        })),
        file_name: batch.file_name,
        file_hash: batch.file_hash || ''
      }
      if (batch.import_id) payload.import_id = batch.import_id

      try {
        const res = await ImportApi.sync(payload)
        const { import_id, results } = res.data
        if (import_id && !batch.import_id) {
          batch.import_id = import_id
          await updateBatchImportId(batch.batch_id, import_id)
        }

        await markRowsSynced(
          pendingRows.map((row, index) => ({
            id: row.id,
            type: results[index]?.type || 'skipped',
            changes: results[index]?.changes,
            reason: results[index]?.reason
          }))
        )

        const counts = {
          added: 0,
          updated: 0,
          skipped: 0,
          frozen: 0,
          synced: pendingRows.length
        }
        results.forEach((record) => {
          if (record.type in counts) counts[record.type]++
        })

        await updateBatchProgress(batch.batch_id, counts)
        notifySyncUpdate()
        retryCount = 0
      } catch (error: any) {
        retryCount++
        if (retryCount <= SYNC_RETRY_LIMIT) {
          await wait(SYNC_RETRY_DELAY * retryCount)
          continue
        }
        await markBatchError(batch.batch_id, error?.message || 'sync failed')
        notifySyncUpdate()
        return
      }

      await wait(120)
    }
  } catch (error: any) {
    await markBatchError(batch.batch_id, error?.message || 'sync failed')
    notifySyncUpdate()
  }
}
