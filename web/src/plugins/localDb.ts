import { ref } from 'vue'
import * as Comlink from 'comlink'
import type { DbApi } from './localDb.worker'

let _remote: Comlink.Remote<DbApi> | null = null
let _initPromise: Promise<void> | null = null

export const isLocalDbReady = ref(false)

export async function initLocalDb(): Promise<void> {
  if (_initPromise) return _initPromise

  _initPromise = (async () => {
    const worker = new Worker(new URL('./localDb.worker.ts', import.meta.url), { type: 'module' })
    _remote = Comlink.wrap<DbApi>(worker)
    const mode = await _remote.init()
    isLocalDbReady.value = true
    console.log('[localDb] 存储模式:', mode)
  })()

  return _initPromise
}

function api(): Comlink.Remote<DbApi> {
  if (!_remote) throw new Error('[localDb] 未初始化，请先调用 initLocalDb()')
  return _remote
}

// ── 类型定义 ──

export interface BatchRecord {
  batch_id: string
  file_name: string
  file_hash: string
  total: number
  synced: number
  added: number
  updated: number
  skipped: number
  frozen: number
  status: string
  import_id: number | null
  headers?: string
  created_at: number
}

export interface QueueRow {
  id: number
  batch_id: string
  phone: string
  data: string
  changes: string | null
  reason: string | null
  sync_status: string
  sync_type: string | null
  file_name: string
  created_at: number
}

// ── 批次 CRUD ──

export const checkBatchByHash = (hash: string) => api().checkBatchByHash(hash) as Promise<boolean>

export const insertImportData = (
  batchId: string,
  fileName: string,
  fileHash: string,
  total: number,
  rows: Array<{ phone: string; data: Record<string, any> }>,
  headers?: any[]
) => api().insertImportData(batchId, fileName, fileHash, total, rows, headers)
export const updateBatchImportId = (batchId: string, importId: number) =>
  api().updateBatchImportId(batchId, importId)
export const updateBatchProgress = (
  batchId: string,
  counts: { added: number; updated: number; skipped: number; frozen: number; synced: number }
) => api().updateBatchProgress(batchId, counts)
export const markBatchDone = (batchId: string) => api().markBatchDone(batchId)
export const markBatchError = (batchId: string) => api().markBatchError(batchId)
export const listBatches = () => api().listBatches() as Promise<BatchRecord[]>
export const listSyncingBatches = () => api().listSyncingBatches() as Promise<BatchRecord[]>

// ── 行队列 CRUD ──

export const getPendingRows = (batchId: string, limit: number) =>
  api().getPendingRows(batchId, limit) as Promise<QueueRow[]>
export const markRowsSynced = (
  results: Array<{ id: number; type: string; changes?: any; reason?: string }>
) => api().markRowsSynced(results)
export const getRowsByBatchAndType = (
  batchId: string,
  syncType: string,
  offset: number,
  limit: number
) => api().getRowsByBatchAndType(batchId, syncType, offset, limit) as Promise<QueueRow[]>
export const getRowsByBatchPending = (batchId: string, offset: number, limit: number) =>
  api().getRowsByBatchPending(batchId, offset, limit) as Promise<QueueRow[]>
export const countByBatchAndType = (batchId: string) => api().countByBatchAndType(batchId) as any
export const queryBatchRows = (
  batchId: string,
  tab: string,
  keyword: string,
  isTail: boolean,
  limit: number,
  offset: number
) =>
  api().queryBatchRows(batchId, tab, keyword, isTail, limit, offset) as Promise<{
    total: number
    rows: QueueRow[]
  }>

// ── 纯函数（主线程执行）──

export const clearAllLocalData = () => api().clearAllLocalData()
export const generateBatchId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
