<!--
  @file   views/Fields.vue
  @desc   CRM 动态字段配置页面 (极简重构版)
-->
<template>
  <div>
    <n-card :bordered="false" class="!shadow !rounded-xl" hoverable>
      <n-flex class="!mb-4" justify="end">
        <n-button type="primary" @click="fieldDrawerRef?.openCreate()">
          <template #icon
            ><n-icon> <AddOutline /> </n-icon
          ></template>
          {{ t("新建字段") }}
        </n-button>
      </n-flex>

      <n-data-table
        :columns="columns"
        :data="field_list"
        :loading="loading"
        :pagination="false"
        :row-key="(row) => row.id"
        scroll-x="1200"
      />
    </n-card>

    <FieldDrawer ref="fieldDrawerRef" @refresh="fetchData" />
  </div>
</template>

<script lang="ts" setup>
import { t } from '@i18n'
import { AddOutline } from '@vicons/ionicons5'
import { NButton, NCard, NDataTable, NFlex, NIcon } from 'naive-ui'
import { type ContactField, FieldApi } from '@/api/field'
import { useColumns } from './useColumns'
import FieldDrawer from './FieldDrawer.vue'

provide('field-t', t)

const message = useMessage()
const fieldDrawerRef = ref<InstanceType<typeof FieldDrawer> | null>(null)

const loading = ref(false)
const field_list = ref<ContactField[]>([])

async function fetchData() {
  loading.value = true
  try {
    const res = await FieldApi.list()
    if (res.code === 1) field_list.value = res.data
  } catch (err) {
    message.error(t('获取配置失败'))
  } finally {
    loading.value = false
  }
}

async function moveRow(index: number, direction: 'up' | 'down') {
  if (direction === 'up' && index === 0) return
  if (direction === 'down' && index === field_list.value.length - 1) return

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  const newList = [...field_list.value]
  const temp = newList[index]
  newList[index] = newList[targetIndex]
  newList[targetIndex] = temp

  field_list.value = newList
  const ids = newList.map((f) => f.id)

  try {
    await FieldApi.sort(ids)
    message.success(t('排序已更新'))
  } catch (e) {
    fetchData()
  }
}

async function toggleEnable(row: ContactField) {
  try {
    if (row.enabled) {
      await FieldApi.delete(row.id)
      row.enabled = false
      message.warning(t('"{0}" 已停用').replace('{0}', row.label))
    } else {
      await FieldApi.update(row.id, { enabled: true })
      row.enabled = true
      message.success(t('"{0}" 已启用').replace('{0}', row.label))
    }
  } catch (e) {}
}

const { columns } = useColumns(t, field_list, moveRow, toggleEnable, (row: ContactField) =>
  fieldDrawerRef.value?.openEdit(row)
)

onMounted(() => {
  fetchData()
})
</script>
