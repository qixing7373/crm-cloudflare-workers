<template>
  <n-drawer :show="show" @update:show="(val) => emit('update:show', val)" :width="400">
    <n-drawer-content :title="t('编辑客户信息')" closable>
      <n-form :model="form" label-placement="top">
        <n-form-item :label="t('手机号')">
          <n-input v-model:value="form.phone" />
        </n-form-item>
        <n-form-item :label="t('状态')">
          <n-select
            v-model:value="form.status"
            :options="[
              { label: t('已开发'), value: 'developed' },
              { label: t('未开发'), value: 'undeveloped' }
            ]"
          />
        </n-form-item>
        <template v-for="f in fields.filter((x: any) => x.enabled && x.editable)" :key="f.id">
          <n-form-item :label="f.label">
            <n-radio-group
              v-if="f.type === 'select' && f.key === 'gender'"
              v-model:value="form.data[f.key]"
            >
              <n-space>
                <n-radio v-for="o in parseOpts(f.options)" :key="o.value" :value="o.value">
                  {{ o.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
            <n-select
              v-else-if="f.type === 'select'"
              v-model:value="form.data[f.key]"
              :options="parseOpts(f.options)"
              clearable
            />
            <n-input-number
              v-else-if="f.type === 'number'"
              v-model:value="form.data[f.key]"
              class="w-full"
              clearable
            />
            <n-switch v-else-if="f.type === 'boolean'" v-model:value="form.data[f.key]" />
            <n-date-picker
              v-else-if="f.type === 'date'"
              v-model:formatted-value="form.data[f.key]"
              value-format="yyyy-MM-dd"
              type="date"
              clearable
              class="w-full"
            />
            <n-input
              v-else-if="['remark', 'remarks', 'note', 'notes'].includes(f.key)"
              v-model:value="form.data[f.key]"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 6 }"
              clearable
            />
            <n-input v-else v-model:value="form.data[f.key]" clearable />
          </n-form-item>
        </template>
      </n-form>
      <template #footer>
        <n-flex justify="end" class="w-full">
          <n-button @click="emit('update:show', false)">{{ t('取消') }}</n-button>
          <n-button type="primary" :loading="saving" @click="emit('save')">
            {{ t('保存') }}
          </n-button>
        </n-flex>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts" setup>
import { NButton, NDatePicker, NDrawer, NDrawerContent, NFlex, NForm, NFormItem, NInput, NInputNumber, NRadio, NRadioGroup, NSelect, NSpace, NSwitch } from 'naive-ui'
import { t } from '@i18n'
import type { ContactField } from '@/api/field'
import { parseOpts } from './useColumns'

defineProps<{
  show: boolean
  saving: boolean
  form: { phone: string; status: string; data: Record<string, any> }
  fields: ContactField[]
}>()

const emit = defineEmits(['update:show', 'save'])
</script>
