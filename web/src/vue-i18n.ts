import Axios from 'axios'
import type { App } from 'vue'
import type { Composer } from 'vue-i18n'
import { createI18n } from 'vue-i18n'
import enUS from '@/i18n/en-US'
import { app } from '@/vue-pinia'

let i18n!: ReturnType<typeof createI18n>
const g = () => i18n.global as unknown as Composer

const setLang = (v: string) => {
  g().locale.value = v
  Axios.defaults.headers.common['Accept-Language'] = v
  document.documentElement.lang = v
  app().language = v
  return v
}

export const loadLang = async (v: string) => {
  // 基于新版架构（Chinese-Base Paradigm）：
  // 在以中文为主键的架构下，若当前在 zh-CN 环境，Vue i18n 将依靠原生兜底机制（Fallback）直接呈现源码里的中文字符。
  // 若切换至 en-US，会命中预挂载的以中译英对象 `en-US`。不再需要加载 zh-CN.ts。
  return setLang(v)
}

/**
 * @desc 伪翻译占位符（Dummy Wrapper）。
 * 专供 python 提取脚本作为正则特征捕获静态文本（如 vue-router 的标题），无任何运行时代价。
 */
export const _t = (k: string) => k
export const t = (k: string, ...args: any[]) => (g().t as any)(k, ...args)

export default {
  install(a: App) {
    const l = app().language || navigator.language
    i18n = createI18n({
      legacy: false,
      locale: l,
      fallbackLocale: 'zh-CN', // Fallback to raw Chinese keys natively defined in application source!
      globalInjection: true,
      silentTranslationWarn: true,
      missingWarn: false,
      fallbackWarn: false,
      messages: enUS // Load English dictionaries to flip translations natively
    })
    a.use(i18n)
    loadLang(l)
  },
  t,
  merge: (locale: string, msgs: Record<string, string>) => g().mergeLocaleMessage(locale, msgs)
}
