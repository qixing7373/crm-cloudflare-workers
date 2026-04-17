/**
 * @file   api/field.ts
 * @desc   动态字段配置 API
 */
import http from '@/plugins/axios'
import type { ApiResponse } from '@/types/api'

export interface ContactField {
  id: number
  key: string
  label: string
  label_en: string | null
  type: 'text' | 'number' | 'select' | 'phone' | 'date' | 'boolean'
  options: string | null
  required: boolean
  editable: boolean
  enabled: boolean
  sort: number
}

export const FieldApi = {
  /** 获取全量字段列表 */
  list() {
    return http.get<never, ApiResponse<ContactField[]>>('/api/field')
  },

  /** 新建字段配置 */
  create(data: Omit<ContactField, 'id' | 'enabled' | 'sort'>) {
    return http.post<never, ApiResponse<ContactField>>('/api/field', data)
  },

  /** 编辑属性 (Key不能修改) */
  update(id: number, data: Partial<Omit<ContactField, 'id' | 'key'>>) {
    return http.put<never, ApiResponse<{ id: number }>>(`/api/field/${id}`, data)
  },

  /** 禁用字段（enabled=false） */
  delete(id: number) {
    return http.delete<never, ApiResponse<null>>(`/api/field/${id}`)
  },

  /** 批量提交排序 */
  sort(ids: number[]) {
    return http.put<never, ApiResponse<null>>('/api/field/sort', { ids })
  }
}
