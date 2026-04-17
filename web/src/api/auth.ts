/**
 * @file   api/auth.ts — 认证 API
 * @desc   登录、注册、令牌校验
 */
import http from '@/plugins/axios'
import type { ApiResponse, LoginResult } from '@/types/api'

export function login(username: string, password: string) {
  return http.post<never, ApiResponse<LoginResult>>('/auth/login', {
    username,
    password
  })
}

export function register(username: string, password: string, invite_code: string) {
  return http.post<never, ApiResponse<{ id: number }>>('/auth/register', {
    username,
    password,
    invite_code
  })
}

export function checkToken() {
  return http.get<never, ApiResponse<{ id: number; username: string; role: string }>>('/auth/check')
}

export function getInviteCode() {
  return http.get<never, ApiResponse<{ code: string }>>('/api/invite/code')
}

export function changePassword(old_password: string, new_password: string) {
  return http.put<never, ApiResponse<{ id: number }>>('/auth/password', {
    old_password,
    new_password
  })
}
