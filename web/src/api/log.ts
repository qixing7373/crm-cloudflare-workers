/**
 * @file   api/log.ts — 审计日志 API
 * @desc   用户操作日志、联系人生命周期日志
 */
import http from '@/plugins/axios'
import type { ApiResponse, DateLike, PaginateResponse } from '@/types/api'

export interface UserLogRow {
  id: number
  user_id: number
  action: string
  details: string | null
  created_at: DateLike | null
}

export interface ContactLogRow {
  id: number
  contact_id: number
  user_id: number
  import_id: number | null
  type: string
  changes: string | null
  created_at: DateLike | null
}

export const LogApi = {
  fetchUserLogs(params: { page: number; size: number; action?: string; user_id?: number }) {
    return http.get<never, PaginateResponse<UserLogRow>>('/api/log', { params })
  },

  fetchContactLogs(contactId: number) {
    return http.get<never, ApiResponse<ContactLogRow[]>>(`/api/log/contact/${contactId}`)
  }
}
