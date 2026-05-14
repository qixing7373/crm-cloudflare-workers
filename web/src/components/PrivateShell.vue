<!--
  @file   PrivateShell.vue — 登录后应用壳
  @desc   Naive UI 全局能力延迟到受保护页面加载，避免拖慢公开页首屏
-->
<template>
  <n-config-provider :locale="_naive_locale" :date-locale="_naive_date_locale" abstract>
    <n-global-style />
    <n-message-provider :max="1">
      <HttpErrorBridge />
      <n-dialog-provider>
        <n-notification-provider>
          <Frame />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { app } from '@pinia'
import type { NDateLocale, NLocale } from 'naive-ui'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'

const _naive_locale = computed<NLocale>(() => (app().language === 'zh-CN' ? zhCN : enUS))

const _naive_date_locale = computed<NDateLocale>(() =>
  app().language === 'zh-CN' ? dateZhCN : dateEnUS
)
</script>
