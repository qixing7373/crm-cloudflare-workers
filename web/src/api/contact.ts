/**
 * @file   api/contact.ts — 联系人 API
 * @desc   搜索、认领、撤销、转移、标签等
 */
import http from '@/plugins/axios'
import type { ApiResponse, ContactRow, PaginateResponse } from '@/types/api'

export function fetchContacts(params: { page?: number; size?: number; status?: string }) {
  return http.get<never, PaginateResponse<ContactRow>>('/api/contact', {
    params
  })
}

export function searchContacts(q: string, tail_only?: string) {
  return http.get<never, ApiResponse<ContactRow[]>>('/api/contact/search', {
    params: { q, tail_only }
  })
}

export function fetchContact(id: number) {
  return http.get<never, ApiResponse<ContactRow>>(`/api/contact/${id}`)
}

export function claimContact(phone: string, data?: Record<string, unknown>) {
  return http.post<never, ApiResponse<{ id: number; phone: string; status: string }>>(
    '/api/contact/claim',
    { phone, data }
  )
}

export function revokeContact(id: number, confirm_word: string) {
  return http.put<never, ApiResponse<{ id: number; status: string }>>(`/api/contact/${id}/revoke`, {
    confirm_word
  })
}

export function transferContacts(
  from_user_id: number,
  to_user_id: number,
  scope: 'all' | 'undeveloped' = 'all'
) {
  return http.put<never, ApiResponse<null>>('/api/contact/transfer', {
    from_user_id,
    to_user_id,
    scope
  })
}

export function deleteContact(id: number) {
  return http.delete<never, ApiResponse<null>>(`/api/contact/${id}`)
}

export function updateContact(id: number, data: any) {
  return http.put<never, ApiResponse<{ id: number }>>(`/api/contact/${id}`, data)
}
