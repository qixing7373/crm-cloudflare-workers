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
import { runIdle } from '@/utils/idle'
import './index.css'

export const app = createApp(App)

app.use(router)
app.use(store)
app.use(i18n)

router.isReady().then(() => {
  app.mount('#root')
  runIdle(() => {
    if (!localStorage.getItem('crm_token') && !localStorage.getItem('crm_user')) return
    import('@/plugins/syncEngine')
      .then(({ initSyncEngine }) => initSyncEngine())
      .catch(() => undefined)
  })
})
