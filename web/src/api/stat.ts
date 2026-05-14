/**
 * @file   api/stat.ts — 统计 API
 * @desc   个人、团队、全局概览统计
 */
import http from '@/plugins/axios'
import type { ApiResponse, StatOverview } from '@/types/api'

export interface MyStat {
  user_id: number
  claimed_count: number
  month: string
}

export interface GroupStat {
  user_id: number | null
  count: number
}

export const StatApi = {
  fetchMine(month?: string) {
    return http.get<never, ApiResponse<MyStat>>('/api/stat/me', {
      params: month ? { month } : undefined
    })
  },

  fetchGroup() {
    return http.get<never, ApiResponse<GroupStat[]>>('/api/stat/group')
  },

  fetchOverview() {
    return http.get<never, ApiResponse<StatOverview>>('/api/stat/overview')
  }
}
