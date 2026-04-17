/**
 * @file   api/import.ts — 导入相关 API
 * @desc   获取合并历史、验证 Hash、同步数据等
 */
import http from '@/plugins/axios'
import type { ApiResponse, PaginateResponse } from '@/types/api'

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
  created_at: number
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
    clean_list: Array<{ phone: string; data: Record<string, any> }>
    file_name: string
    file_hash: string
    import_id?: number
  }) {
    return http.post<
      never,
      ApiResponse<{
        import_id: number
        results: Array<{ type: string; changes?: any; reason?: string }>
      }>
    >('/api/import/sync', payload)
  },

  /**
   * 获取单次导入任务的详细云端变更日志
   */
  fetchHistoryDetail(id: number) {
    return http.get<never, ApiResponse<any>>(`/api/import/${id}`)
  }
}
