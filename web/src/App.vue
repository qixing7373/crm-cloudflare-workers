<!--
  @file   App.vue — 根组件
  @desc   meta 驱动页面标题 + Naive UI locale/theme 联动 i18n
-->
<template>
  <n-config-provider :locale="naive_locale" :date-locale="naive_date_locale" abstract>
    <n-global-style />
    <n-message-provider :max="1">
      <n-dialog-provider>
        <n-notification-provider>
          <Frame v-if="!route.meta.public" />
          <router-view v-else />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { app } from '@pinia'
import type { NDateLocale, NLocale } from 'naive-ui'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'
import Frame from '@/components/Frame.vue'

const route = useRoute()

const naive_locale = computed<NLocale>(() => (app().language === 'zh-CN' ? zhCN : enUS))

const naive_date_locale = computed<NDateLocale>(() =>
  app().language === 'zh-CN' ? dateZhCN : dateEnUS
)

// 路由切换时自动更新页面标题
watch(
  () => route.meta.title,
  (_v) => {
    if (_v) window.document.title = _v as string
  },
  { immediate: true }
)
</script>
