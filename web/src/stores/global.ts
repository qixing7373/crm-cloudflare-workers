/**
 * @file   stores/global.ts — 全局应用状态
 * @desc   语言偏好、主题、侧边栏折叠等全局 UI 状态
 */
import { defineStore } from 'pinia'

export default defineStore(
  'app',
  () => {
    const language = ref('')
    const is_sidebar_collapsed = ref(false)
    return { language, is_sidebar_collapsed }
  },
  { persist: true }
)
