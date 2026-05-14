/**
 * @file   api/user.ts
 * @desc   用户 API 接口
 */
import http from '@/plugins/axios'
import type { ApiResponse, DateLike, EditableUserRole, UserRole, UserStatus } from '@/types/api'

export interface UserItem {
  id: number
  username: string
  role: UserRole
  group_id: number | null
  group_name?: string | null
  status: UserStatus
  created_at: DateLike | null
}

export interface CreateUserPayload {
  username: string
  password: string
  role?: EditableUserRole
  group_id?: number
}

export const UserApi = {
  /** 获取用户列表 */
  list() {
    return http.get<never, ApiResponse<UserItem[]>>('/api/user')
  },

  /** 创建账号 */
  create(data: CreateUserPayload) {
    return http.post<never, ApiResponse<{ id: number }>>('/api/user', data)
  },

  /** 审核/禁用 */
  updateStatus(id: number, status: UserStatus) {
    return http.put<never, ApiResponse<{ id: number; status: UserStatus }>>(
      `/api/user/${id}/status`,
      {
        status
      }
    )
  },

  /** 修改角色（超管可用） */
  updateRole(id: number, role: UserRole) {
    return http.put<never, ApiResponse<{ id: number; role: UserRole }>>(`/api/user/${id}/role`, {
      role
    })
  },

  /** 调整分组（超管可用） */
  updateGroup(id: number, group_id: number) {
    return http.put<never, ApiResponse<{ id: number; group_id: number }>>(`/api/user/${id}/group`, {
      group_id
    })
  },

  /** 重置密码 */
  resetPassword(id: number, password: string) {
    return http.put<never, ApiResponse<{ id: number }>>(`/api/user/${id}/password`, {
      password
    })
  }
}
