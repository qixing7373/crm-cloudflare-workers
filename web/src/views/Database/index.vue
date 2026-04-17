<template>
  <n-card :bordered="false" class="!shadow !rounded-xl" hoverable>
    <WidgetSearchContact
      v-model:keyword="st.keyword"
      v-model:tailOnly="st.keywordTail"
      @search="onSearch"
      class="!mb-4"
    />

    <MyTable
      :columns="cols"
      :data="st.list"
      :loading="st.loading"
      :pagination="truePage"
      @update:page="onPage"
      @update:page-size="onPageSize"
    />

    <EditDrawer
      v-model:show="st.editOpen"
      :saving="st.saving"
      :form="st.form"
      :fields="st.fields"
      @save="saveEdit"
    />
  </n-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue'
import { useMessage } from 'naive-ui'
import { deleteContact, updateContact } from '@/api/contact'
import { FieldApi, type ContactField } from '@/api/field'
import http from '@/plugins/axios'
import { t } from '@i18n'

import { useColumns } from './useColumns'
import EditDrawer from './EditDrawer.vue'

const ms = useMessage()

const st = reactive({
  loading: false,
  saving: false,
  keyword: '',
  keywordTail: false,
  list: [],
  fields: [] as ContactField[],
  page: 1,
  size: 20,
  total: 0,
  editOpen: false,
  editId: null as number | null,
  form: { phone: '', status: 'undeveloped', data: {} as Record<string, any> }
})

const openEdit = (r: any) => {
  st.editId = r.id
  st.form = {
    phone: r.phone || '',
    status: r.status || 'undeveloped',
    data: typeof r.data === 'string' ? JSON.parse(r.data || '{}') : { ...r.data }
  }
  st.editOpen = true
}

const onSearch = () => {
  st.page = 1
  fetch()
}

const onPage = (p: number) => {
  st.page = Number(p)
  fetch()
}

const onPageSize = (s: number) => {
  st.size = Number(s)
  st.page = 1
  fetch()
}

const saveEdit = async () => {
  if (!st.editId) return
  st.saving = true
  try {
    const res: any = await updateContact(st.editId, st.form)
    if (res.code === 1 || res.code === 200) {
      ms.success(t('成功'))
      st.editOpen = false
      fetch()
    } else ms.error(res?.msg || t('失败'))
  } catch (e: any) {
    ms.error(e?.message)
  } finally {
    st.saving = false
  }
}

const drop = async (id: number) => {
  try {
    const res: any = await deleteContact(id)
    if (res.code === 1 || res.code === 200) {
      ms.success(t('成功'))
      fetch()
    } else ms.error(res?.msg || t('失败'))
  } catch (e: any) {
    ms.error(e?.message)
  }
}

const fetch = async () => {
  st.loading = true
  try {
    const p: any = {
      page: st.page,
      size: st.size,
      ...(st.keyword ? { q: st.keyword, tail_only: st.keywordTail ? '1' : undefined } : {})
    }
    const res: any = await http.get(`/api/contact`, { params: p })
    if (res.code === 1 || res.code === 200) {
      st.list = res.data.list
      st.total = res.data.total_count || res.data.total || 0
    } else ms.error(res?.msg || t('异常'))
  } finally {
    st.loading = false
  }
}

const cols = useColumns({
  t,
  fields: computed(() => st.fields),
  onEdit: openEdit,
  onDelete: drop
})

const truePage = computed(() => ({
  page: st.page,
  pageSize: st.size,
  itemCount: st.total,
  showSizePicker: true,
  pageSizes: [20, 50, 100, 500]
}))

onMounted(async () => {
  try {
    const r = await FieldApi.list()
    if (r.code === 1) st.fields = r.data || []
  } catch {}
  fetch()
})
</script>
