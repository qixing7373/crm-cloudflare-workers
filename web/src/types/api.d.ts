/**
 * @file   types/api.d.ts — API 请求/响应类型
 * @desc   统一定义后端接口的请求参数和响应数据结构
 */

// ── 通用响应 ──
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PaginateResponse<T = unknown> {
  code: number
  msg: string
  data: {
    list: T[]
    total_count: number
    page_index: number
    page_size: number
  }
}

// ── 用户 ──
export interface UserInfo {
  id: number
  username: string
  role: 'staff' | 'manager' | 'superadmin'
  group_id: number | null
  status: 'active' | 'disabled'
  created_at: string | null
}

export interface LoginResult {
  token: string
  user: { id: number; username: string; role: string }
}

// ── 联系人 ──
export interface ContactRow {
  id: number
  phone: string | null
  status: 'undeveloped' | 'developed'
  owner_id: number | null
  data: string
  claimed_at: string | null
  import_count: number | null
  _is_masked?: boolean
  _private_owner?: number | null
}

// ── 分组 ──
export interface GroupRow {
  id: number
  name: string
  created_at: string | null
  member_count: number
}

// ── 字段配置 ──
export interface FieldRow {
  id: number
  key: string
  label: string
  label_en: string | null
  type: string
  options: string | null
  required: boolean
  editable: boolean
  sort: number
  enabled: boolean
}

// ── 导入 ──
export interface ImportPreview {
  file: string
  total_rows: number
  clean_count: number
  matched_fields: string[]
  report: {
    added: number
    updated: number
    skipped: number
    frozen: number
    frozen_list: Array<{ phone: string; reason: string }>
    updated_list: Array<{ phone: string; changes: Record<string, unknown> }>
    skipped_list: Array<{ phone: string }>
    added_list: Array<{ phone: string }>
  }
  token: string
}

// ── 统计 ──
export interface StatOverview {
  total: number
  developed: number
  undeveloped: number
  develop_rate: string
}
