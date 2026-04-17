<template>
  <n-drawer v-model:show="visible" :width="500" placement="right">
    <n-drawer-content :title="mode === 'create' ? t('新建字段') : t('编辑字段')" closable>
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" require-mark-placement="right-hanging">
        <n-form-item :label="t('标识符')" path="key">
          <n-input v-model:value.trim="form.key" :disabled="mode === 'edit'" :placeholder="t('仅支持小写字母和下划线，例如 wechat_id')" />
        </n-form-item>

        <n-form-item :label="t('名称')" path="label">
          <n-flex :size="8" class="!w-full" :wrap="false">
            <n-input v-model:value.trim="form.label" :placeholder="t('中文名称')" class="!flex-1" />
            <n-input v-model:value.trim="form.label_en" :placeholder="t('英文名称')" class="!flex-1" />
          </n-flex>
        </n-form-item>

        <n-form-item :label="t('类型')" path="type">
          <n-select v-model:value="form.type" :options="typeOptions" />
        </n-form-item>

        <!-- Select Options -->
        <n-collapse-transition :show="form.type === 'select'">
          <n-form-item :label="t('选项')" path="options">
            <n-flex vertical :size="8" class="!w-full">
              <n-flex v-for="(item, index) in optionsList" :key="index" :size="8" class="!w-full" :wrap="false" align="center">
                <n-input v-model:value.trim="item.val" :placeholder="t('选项值')" class="!flex-1" />
                <n-input v-model:value.trim="item.zh" :placeholder="t('中文名称')" class="!flex-1" />
                <n-input v-model:value.trim="item.en" :placeholder="t('英文名称')" class="!flex-1" />
                <n-button-group>
                  <n-button size="small" quaternary :disabled="index === 0" @click="moveOption(index, -1)">
                    <template #icon><n-icon><ArrowUpOutline /></n-icon></template>
                  </n-button>
                  <n-button size="small" quaternary :disabled="index === optionsList.length - 1" @click="moveOption(index, 1)">
                    <template #icon><n-icon><ArrowDownOutline /></n-icon></template>
                  </n-button>
                  <n-button size="small" type="error" quaternary @click="optionsList.splice(index, 1)">
                    <template #icon><n-icon><TrashOutline /></n-icon></template>
                  </n-button>
                </n-button-group>
              </n-flex>
              <n-button dashed block @click="optionsList.push({ val: '', zh: '', en: '' })">
                <template #icon><n-icon><AddOutline /></n-icon></template>
                {{ t('添加选项') }}
              </n-button>
            </n-flex>
          </n-form-item>
        </n-collapse-transition>

        <n-form-item :label="t('约束')">
          <n-flex :size="24">
            <n-checkbox v-model:checked="form.required">{{ t('创建时必填') }}</n-checkbox>
            <n-checkbox v-model:checked="form.editable">{{ t('支持后续修改') }}</n-checkbox>
          </n-flex>
        </n-form-item>
      </n-form>

      <template #footer>
        <n-flex justify="end" :size="12" class="!w-full">
          <n-button @click="visible = false">{{ t('取消') }}</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">{{ t('保存') }}</n-button>
        </n-flex>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts" setup>
import { AddOutline, ArrowDownOutline, ArrowUpOutline, TrashOutline } from '@vicons/ionicons5'
import type { FormInst, FormRules } from 'naive-ui'
import {
  NButton,
  NButtonGroup,
  NCheckbox,
  NCollapseTransition,
  NDrawer,
  NDrawerContent,
  NFlex,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NSelect
} from 'naive-ui'
import { type ContactField, FieldApi } from '@/api/field'

const t = inject('field-t') as (key: string, ...args: any[]) => string

const emit = defineEmits<(e: 'refresh') => void>()

const message = useMessage()
const visible = ref(false)
const mode = ref<'create' | 'edit'>('create')
const saving = ref(false)
const formRef = ref<FormInst | null>(null)

const typeMap = computed<Record<string, string>>(() => ({
  text: t('文本输入'),
  number: t('数字输入'),
  phone: t('手机号'),
  select: t('下拉单选'),
  date: t('日期选择'),
  boolean: t('开关配置')
}))
const typeOptions = computed(() =>
  Object.entries(typeMap.value).map(([k, v]) => ({ label: v, value: k }))
)

const form = ref<any>({
  id: 0,
  key: '',
  label: '',
  label_en: '',
  type: 'text',
  options: '',
  required: false,
  editable: true
})

const optionsList = ref<{ val: string; zh: string; en: string }[]>([])

const rules = computed<FormRules>(() => ({
  key: [
    { required: true, message: t('请设置唯一标识符'), trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: t('只能包含小写拼音及下划线'), trigger: 'input' }
  ],
  label: [{ required: true, message: t('请输入前台名称'), trigger: 'blur' }]
}))

function moveOption(index: number, offset: -1 | 1) {
  const target = index + offset
  if (target < 0 || target >= optionsList.value.length) return
  const temp = optionsList.value[index]
  optionsList.value[index] = optionsList.value[target]
  optionsList.value[target] = temp
}

async function handleSave() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      saving.value = true
      if (form.value.type === 'select') {
        const _cleaned = optionsList.value.filter((o) => o.val || o.zh || o.en)
        form.value.options = _cleaned.length ? JSON.stringify(_cleaned) : ''
      }

      try {
        if (mode.value === 'create') {
          const res = await FieldApi.create(form.value)
          if (res.code === 1) message.success(t('新建成功'))
        } else {
          const { id, key, ...rest } = form.value
          const res = await FieldApi.update(id, rest as any)
          if (res.code === 1) message.success(t('保存成功'))
        }
        visible.value = false
        emit('refresh')
      } catch (err: any) {
        // http 代理已处理错误消息
      } finally {
        saving.value = false
      }
    }
  })
}

// 暴露外部方法
defineExpose({
  openCreate: () => {
    mode.value = 'create'
    form.value = {
      id: 0,
      key: '',
      label: '',
      label_en: '',
      type: 'text',
      options: '',
      required: false,
      editable: true
    }
    optionsList.value = []
    visible.value = true
  },
  openEdit: (row: ContactField) => {
    mode.value = 'edit'
    form.value = { ...row, label_en: row.label_en || '', options: row.options || '' }
    try {
      optionsList.value = row.options ? JSON.parse(row.options) : []
    } catch {
      optionsList.value = []
    }
    visible.value = true
  }
})
</script>
