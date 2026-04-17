<template>
  <n-space :size="16" align="center">
    <MySearch
      v-model:value="keyword"
      :placeholder="placeholder"
      @search="onSearch"
      :input-class="inputClass"
      :loading="loading"
    />
    <n-checkbox v-model:checked="tailOnly" @update:checked="onSearch" class="shrink-0">
      <span v-text="t('手机尾号')" />
    </n-checkbox>
    <slot />
  </n-space>
</template>

<script lang="ts" setup>
import { NSpace, NCheckbox } from 'naive-ui'
import { t } from '@i18n'
import MySearch from './MySearch.vue'

const keyword = defineModel<string>('keyword')
const tailOnly = defineModel<boolean>('tailOnly')

withDefaults(
  defineProps<{
    placeholder?: string
    inputClass?: string
    loading?: boolean
  }>(),
  {}
)

const emit = defineEmits(['search'])

const onSearch = () => {
  emit('search')
}
</script>
