/**
 * @file   vue-pinia.ts — Pinia 状态管理初始化
 * @desc   创建 Pinia 实例并注册持久化插件，导出全局 Store 函数
 */
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from '@/stores/global'
import User from '@/stores/user'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
export default pinia

// 全局 Store 作为函数导出
export const app = App
export const user = User
