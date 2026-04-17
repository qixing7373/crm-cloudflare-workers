<template>
  <n-card
    v-bind="filteredAttrs"
    :bordered="bordered"
    :hoverable="hoverable"
    :class="cardClass"
  >
    <!-- 透传所有卡片插槽（header, header-extra, default, footer, action 等） -->
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </n-card>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

const props = withDefaults(
  defineProps<{
    bordered?: boolean
    hoverable?: boolean
    cardClass?: string
  }>(),
  {
    bordered: false,
    hoverable: true,
    cardClass: '!shadow !rounded-xl'
  }
)

// 当通过模板外层在使用 MyCard 时，如果也传了 class 属性，Vue 默认会保留但有时会出现合并策略问题，
// 这里我们可以简单将外部传递的除了 class 的 attrs 透传进入 n-card
const filteredAttrs = computed(() => {
  const result: any = { ...attrs }
  // Vue 特殊处理的 class 和 style 默认会自动 fallthrough，不需要我们重复绑定。
  // 若有需要，也可提取并安全传递。
  return result
})
</script>
