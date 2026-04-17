// 通用字体
import 'vfonts/Lato.css'
// 等宽字体
import 'vfonts/FiraCode.css'
/**
 * @file   index.ts — 应用入口
 * @desc   组装插件，router.isReady() 后再 mount，避免闪屏和权限判断竞态
 * @ref    https://github.com/webees/rsbuild-vue3-vant4/blob/main/src/index.ts
 */
import i18n from '@i18n'
import store from '@pinia'
import router from '@router'
import { createApp } from 'vue'
import App from '@/App.vue'
import './index.css'
import { initSyncEngine } from '@/plugins/syncEngine'

export const app = createApp(App)

app.use(router)
app.use(store)
app.use(i18n)

router.isReady().then(() => {
  app.mount('#root')
  // 不阻塞首屏，后台静默启动
  initSyncEngine()
})
