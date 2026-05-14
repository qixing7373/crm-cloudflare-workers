/**
 * @file   api/import.ts — 导入相关 API
 * @desc   获取合并历史、验证 Hash、同步数据等
 */
import http from '@/plugins/axios'
import type { ApiResponse, ContactStatus, DateLike, PaginateResponse } from '@/types/api'

export type ImportChangeMap = Record<string, { old: unknown; new: unknown }>
export type ImportSyncType = 'added' | 'updated' | 'skipped' | 'frozen'
export type ImportLogType = 'create' | 'update' | 'reimport' | 'frozen_import'

export interface ImportCleanRow {
  phone: string
  data: Record<string, unknown>
  status?: ContactStatus
}

export interface ImportHistoryRow {
  id: number
  user_id: number
  file: string
  file_hash: string
  total: number
  frozen: number
  skipped: number
  added: number
  updated: number
  username?: string
  created_at: DateLike | null
}

export interface ImportSyncResult {
  phone: string
  type: ImportSyncType
  changes?: ImportChangeMap
  reason?: string
}

export interface ImportDetailRow {
  id: number
  contact_id: number
  user_id: number
  import_id: number
  type: ImportLogType
  changes: string | null
  created_at: DateLike | null
  phone: string | null
  data: string | null
  status: ContactStatus | null
  owner_id: number | null
}

export interface ImportDetailResponse {
  log: ImportHistoryRow
  details: ImportDetailRow[]
}

export const ImportApi = {
  /**
   * 获取导入历史（云端）
   */
  fetchHistory(params: { page: number; size: number; q?: string }) {
    return http.get<never, PaginateResponse<ImportHistoryRow>>('/api/import/history', {
      params
    })
  },

  /**
   * 验证文件 Hash 是否已在云端存在
   */
  verifyHash(hash: string) {
    return http.get<never, ApiResponse<{ exists: boolean }>>('/api/import/verify-hash', {
      params: { hash }
    })
  },

  /**
   * 同步增量数据到服务器
   */
  sync(payload: {
    clean_list: ImportCleanRow[]
    file_name: string
    file_hash: string
    import_id?: number
  }) {
    return http.post<
      never,
      ApiResponse<{
        import_id: number
        results: ImportSyncResult[]
        chunk_size: number
      }>
    >('/api/import/sync', payload)
  },

  /**
   * 获取单次导入任务的详细云端变更日志
   */
  fetchHistoryDetail(id: number) {
    return http.get<never, ApiResponse<ImportDetailResponse>>(`/api/import/${id}`)
  }
}
