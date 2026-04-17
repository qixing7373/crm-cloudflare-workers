<template>
  <n-modal
    :show="show"
    @update:show="(val: boolean) => emit('update:show', val)"
    preset="card"
    :class="customClass || '!w-[85vw] !h-[95vh]'"
    content-class="overflow-auto"
    :bordered="false"
    :segmented="{ content: true }"
    :closable="false"
    :mask-closable="false"
    v-bind="$attrs"
  >
    <template #default v-if="$slots.default">
      <slot />
    </template>

    <template #header v-if="$slots.header">
      <slot name="header" />
    </template>

    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>

    <template #action v-if="$slots.action">
      <slot name="action" />
    </template>

    <!-- 移入 header-extra 屏蔽 default slot 的 overflow 容器裁剪 -->
    <template #header-extra>
      <slot name="header-extra" />
      <n-button
        secondary
        circle
        type="error"
        size="large"
        class="absolute top-0 -right-14 !bg-white"
        @click="emit('update:show', false)"
      >
        <template #icon>
          <n-icon :size="24">
            <CloseOutline />
          </n-icon>
        </template>
      </n-button>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { CloseOutline } from '@vicons/ionicons5'

defineProps<{ show: boolean; customClass?: string }>()
const emit = defineEmits(['update:show'])
</script>

<style>
/* 精准锁定包含 `my-heavy-card` 的弹窗顶层容器，将遮罩加深至 0.8 */
.n-modal-mask {
  background-color: rgba(0, 0, 0, 0.8) !important;
}

/* 强制允许 MyModal 里的元素溢出（为了外挂的关闭按钮），仅限此容器 */
.n-modal.n-card {
  overflow: visible !important;
}
</style>
