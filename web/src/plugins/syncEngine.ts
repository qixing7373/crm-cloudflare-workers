import { ImportApi } from '@/api/import'
import {
  initLocalDb,
  listSyncingBatches,
  getPendingRows,
  markBatchDone,
  updateBatchImportId,
  markRowsSynced,
  updateBatchProgress,
  markBatchError,
  type BatchRecord
} from '@/plugins/localDb'

let [_syncRunning, _dbInitialized] = [false, false]

export const initSyncEngine = async () => {
  if (_dbInitialized) return
  try {
    await initLocalDb(), (_dbInitialized = true)
    if ((await listSyncingBatches()).length > 0) startSyncEngine()
  } catch {}
}

export const startSyncEngine = async () => {
  if (_syncRunning) return
  _syncRunning = true
  try {
    while (_syncRunning) {
      const batches = await listSyncingBatches()
      if (!batches.length) return (_syncRunning = false)
      for (const batch of batches) await syncBatch(batch)
    }
  } catch {
    _syncRunning = false
  }
}

const syncBatch = async (batch: BatchRecord) => {
  try {
    while (true) {
      const pendingRows = await getPendingRows(batch.batch_id, 100)
      if (!pendingRows.length)
        return (
          await markBatchDone(batch.batch_id),
          window.dispatchEvent(new CustomEvent('import-sync-update'))
        )

      const payload: any = {
        clean_list: pendingRows.map((row) => ({
          phone: row.phone,
          data: row.data ? JSON.parse(row.data) : {}
        })),
        file_name: batch.file_name,
        file_hash: batch.file_hash || ''
      }
      if (batch.import_id) payload.import_id = batch.import_id

      try {
        const res = await ImportApi.sync(payload)
        const { import_id, results } = res.data
        if (import_id && !batch.import_id)
          await updateBatchImportId(batch.batch_id, (batch.import_id = import_id))

        await markRowsSynced(
          pendingRows.map((row, index) => ({
            id: row.id,
            type: results[index]?.type || 'skipped',
            changes: results[index]?.changes,
            reason: results[index]?.reason
          }))
        )

        const counts: Record<string, number> = {
          added: 0,
          updated: 0,
          skipped: 0,
          frozen: 0,
          synced: pendingRows.length
        }
        results.forEach((record: any) => {
          if (record.type in counts) counts[record.type]++
        })

        await updateBatchProgress(batch.batch_id, counts as any)
        window.dispatchEvent(new CustomEvent('import-sync-update'))
      } catch {
        return (
          await markBatchError(batch.batch_id),
          window.dispatchEvent(new CustomEvent('import-sync-update'))
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  } catch {
    await markBatchError(batch.batch_id)
    window.dispatchEvent(new CustomEvent('import-sync-update'))
  }
}
