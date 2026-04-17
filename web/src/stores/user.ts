/**
 * @file   stores/user.ts — 用户状态管理
 * @desc   JWT 持久化、登录登出、角色判断
 */

import { defineStore } from 'pinia'
import { login as apiLogin, checkToken } from '@/api/auth'

export default defineStore(
  'user',
  () => {
    // ═══ 状态 ═══
    const token = ref('')
    const user_info = ref<{
      id: number
      username: string
      role: string
    } | null>(null)

    // ═══ 计算属性 ═══
    const is_logged_in = computed(() => !!token.value)
    const is_superadmin = computed(() => user_info.value?.role === 'superadmin')
    const is_manager = computed(() =>
      ['manager', 'superadmin'].includes(user_info.value?.role || '')
    )
    const role_level = computed(() => {
      const _map: Record<string, number> = {
        staff: 1,
        manager: 2,
        superadmin: 3
      }
      return _map[user_info.value?.role || ''] ?? 0
    })

    // ═══ 方法 ═══
    async function login(username: string, password: string) {
      const _res = await apiLogin(username, password)
      token.value = _res.data.token
      user_info.value = _res.data.user
      localStorage.setItem('crm_token', _res.data.token)
      return _res
    }

    function logout() {
      token.value = ''
      user_info.value = null
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    }

    async function initAuth() {
      const _saved = localStorage.getItem('crm_token')
      if (!_saved) return false
      token.value = _saved
      try {
        const _res = await checkToken()
        user_info.value = _res.data
        return true
      } catch {
        logout()
        return false
      }
    }

    return {
      token,
      user_info,
      is_logged_in,
      is_superadmin,
      is_manager,
      role_level,
      login,
      logout,
      initAuth
    }
  },
  {
    persist: {
      key: 'crm_user',
      pick: ['token', 'user_info']
    }
  }
)
