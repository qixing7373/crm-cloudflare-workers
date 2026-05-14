<!--
  @file   App.vue — 根组件
  @desc   meta 驱动页面标题，公开页与登录后应用壳分离加载
-->
<template>
  <router-view v-if="route.meta.public" />
  <component :is="_private_shell" v-else />
</template>

<script lang="ts" setup>
const route = useRoute()
const _private_shell = defineAsyncComponent(() => import('@/components/PrivateShell.vue'))

// 路由切换时自动更新页面标题
watch(
  () => route.meta.title,
  (_v) => {
    if (_v) window.document.title = _v as string
  },
  { immediate: true }
)
</script>
