<template>
  <n-input-group>
    <n-input
      v-model:value="val"
      :class="inputClass"
      :placeholder="placeholder || t('模糊检索...')"
      :size="size"
      :status="status"
      :style="{
        '--n-border': `1px solid ${themeVars.primaryColor}`,
        '--n-border-hover': `1px solid ${themeVars.primaryColorHover}`,
        '--n-border-focus': `1px solid ${themeVars.primaryColorHover}`
      }"
      clearable
      @keyup.enter="onSearch"
      @clear="onSearch"
    />
    <n-button
      :class="btnClass"
      type="primary"
      :size="size"
      :loading="loading"
      @click="onSearch"
    >
      <template #icon v-if="!btnText || showIcon">
        <n-icon :component="SearchOutline" />
      </template>
      {{ btnText || "" }}
    </n-button>
  </n-input-group>
</template>

<script lang="ts" setup>
import { SearchOutline } from '@vicons/ionicons5'
import { t } from '@i18n'
import { useThemeVars } from 'naive-ui'

const val = defineModel<string>('value')
const themeVars = useThemeVars()

withDefaults(
  defineProps<{
    placeholder?: string
    size?: 'small' | 'medium' | 'large'
    loading?: boolean
    status?: 'success' | 'warning' | 'error'
    btnText?: string
    inputClass?: string
    btnClass?: string
    showIcon?: boolean
  }>(),
  {
    showIcon: true,
    inputClass: '!w-[222px]'
  }
)

const emit = defineEmits(['search'])

const onSearch = () => emit('search', val.value?.trim() || '')
</script>
