/**
 * @file   api/http.ts — Axios 封装（JWT 注入 + i18n 错误翻译）
 * @desc   请求拦截注入 JWT，响应拦截通过 i18n 翻译错误码为本地化消息
 * @ref    docs/dev/09-前端方案.md
 */

import i18n from '@i18n'
import { user } from '@pinia'
import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'], {
  messageProviderProps: { max: 1 }
})

const http: AxiosInstance = axios.create({
  // 开发环境默认用 '/' 走 rsbuild 代理，正式环境通过 PUBLIC_API_URL 注入
  baseURL: import.meta.env.PUBLIC_API_URL || '/',
  timeout: 30000
})

// ── 深度消除字符串头尾空格（跳过非文本实体与密码字段） ──
function deepTrim(obj: any): any {
  if (typeof obj === 'string') return obj.trim()
  if (obj && typeof obj === 'object') {
    if (obj instanceof Blob || obj instanceof File || obj instanceof Date) return obj
    if (Array.isArray(obj)) return obj.map(deepTrim)
    const cloned: any = {}
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        if (key === 'password') cloned[key] = obj[key]
        else cloned[key] = deepTrim(obj[key])
      }
    }
    return cloned
  }
  return obj
}

// ── 请求拦截：自动注入 JWT 与全局数据清洗 ──
http.interceptors.request.use((config) => {
  const _store = user()
  if (_store.token) config.headers.Authorization = `Bearer ${_store.token}`

  if (config.params) config.params = deepTrim(config.params)
  if (config.data && !(config.data instanceof FormData)) {
    config.data = deepTrim(config.data)
  }

  return config
})

// ── 响应拦截：code < 0 全局 Toast + i18n 翻译 ──
http.interceptors.response.use(
  (res) => {
    const { code, msg } = res.data
    if (code < 0) {
      // @security token 过期或未授权 → 强制登出
      if (code === -104 || code === -401) {
        user().logout()
        window.location.href = '/login'
      }
      // 采用 Natural Language Keys 翻译返回的原生英文错误信息
      const _translated = i18n.t(msg)
      message.error(_translated === msg ? msg : _translated)
      return Promise.reject(res.data)
    }
    return res.data
  },
  () => {
    message.error(i18n.t('服务器内部错误'))
    return Promise.reject()
  }
)

export default http
