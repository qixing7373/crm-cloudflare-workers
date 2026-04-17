/**
 * @file   api/group.ts
 * @desc   分组 API 接口
 */
import http from '@/plugins/axios'
import type { ApiResponse } from '@/types/api'

export interface UserGroup {
  id: number
  name: string
  created_at: string
  member_count: number
}

export const GroupApi = {
  /** 获取分组列表 */
  list() {
    return http.get<never, ApiResponse<UserGroup[]>>('/api/group')
  },

  /** 创建分组 */
  create(name: string) {
    return http.post<never, ApiResponse<UserGroup>>('/api/group', { name })
  },

  /** 编辑分组名 */
  update(id: number, name: string) {
    return http.put<never, ApiResponse<{ id: number; name: string }>>(`/api/group/${id}`, { name })
  },

  /** 删除分组 */
  delete(id: number) {
    return http.delete<never, ApiResponse<null>>(`/api/group/${id}`)
  }
}
