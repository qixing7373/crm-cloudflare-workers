/**
 * @file   api/contact.ts — 联系人 API
 * @desc   搜索、认领、撤销、转移、标签等
 */
import http from '@/plugins/axios'
import type { ApiResponse, ContactRow, ContactStatus, PaginateResponse } from '@/types/api'

export interface ContactListParams {
  page?: number
  size?: number
  status?: ContactStatus
  q?: string
  tail_only?: '1' | boolean
}

export interface UpdateContactPayload {
  phone?: string
  status?: ContactStatus
  data?: Record<string, unknown>
}

const normalizeTailOnly = (value?: ContactListParams['tail_only']) =>
  value === true ? '1' : value || undefined

export function fetchContacts(params: ContactListParams) {
  const { tail_only, ...rest } = params
  return http.get<never, PaginateResponse<ContactRow>>('/api/contact', {
    params: { ...rest, tail_only: normalizeTailOnly(tail_only) }
  })
}

export function searchContacts(q: string, tailOnly?: boolean | '1') {
  return http.get<never, ApiResponse<ContactRow[]>>('/api/contact/search', {
    params: { q, tail_only: tailOnly === true ? '1' : tailOnly }
  })
}

export function fetchContact(id: number) {
  return http.get<never, ApiResponse<ContactRow>>(`/api/contact/${id}`)
}

export function claimContact(phone: string, data?: Record<string, unknown>) {
  return http.post<never, ApiResponse<{ id: number; phone: string; status: ContactStatus }>>(
    '/api/contact/claim',
    { phone, data }
  )
}

export function revokeContact(id: number, confirm_word: string) {
  return http.put<never, ApiResponse<{ id: number; status: ContactStatus }>>(
    `/api/contact/${id}/revoke`,
    {
      confirm_word
    }
  )
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

export function updateContact(id: number, data: UpdateContactPayload) {
  return http.put<never, ApiResponse<{ id: number }>>(`/api/contact/${id}`, data)
}
