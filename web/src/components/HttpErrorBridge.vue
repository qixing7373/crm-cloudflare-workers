<template></template>

<script lang="ts" setup>
const message = useMessage()

function handleHttpError(event: Event) {
  const text = (event as CustomEvent<string>).detail
  if (text) message.error(text)
}

onMounted(() => window.addEventListener('crm:http-error', handleHttpError))
onBeforeUnmount(() => window.removeEventListener('crm:http-error', handleHttpError))
</script>
