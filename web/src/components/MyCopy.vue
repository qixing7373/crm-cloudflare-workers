<template>
  <span v-if="!text || text === '-'">-</span>

  <n-tooltip v-else-if="isTruncated" trigger="hover" placement="top">
    <template #trigger>
      <n-button size="small" dashed @click="onCopy">
        <template #icon>
          <n-icon><CopyOutline /></n-icon>
        </template>
        <!-- 截断显示内容 -->
        <span class="font-mono"
          >{{ strText.slice(0, 8) }}···{{ strText.slice(-8) }}</span
        >
      </n-button>
    </template>
    <!-- 悬浮完整内容 -->
    <span class="font-mono">{{ strText }}</span>
  </n-tooltip>

  <n-button v-else dashed size="small" @click="onCopy">
    <template #icon>
      <n-icon><CopyOutline /></n-icon>
    </template>
    <span class="font-mono">{{ strText }}</span>
  </n-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { CopyOutline } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { t } from '@i18n'

const props = defineProps<{
  text: string | number
  truncate?: boolean
}>()

const message = useMessage()

const strText = computed(() => String(props.text))

const isTruncated = computed(() => {
  if (!props.truncate) return false
  return strText.value.length > 18
})

const onCopy = (e: MouseEvent) => {
  e.stopPropagation()
  navigator.clipboard.writeText(String(props.text))
  message.success(t('复制成功'))
}
</script>
