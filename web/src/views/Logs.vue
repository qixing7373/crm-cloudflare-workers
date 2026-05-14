<template>
  <n-flex vertical :size="16">
    <n-card :bordered="false" class="!shadow !rounded-xl">
      <n-flex align="center" justify="space-between">
        <div>
          <n-text class="!text-xl !font-bold">系统日志</n-text>
          <div class="!text-sm !text-gray-500 !mt-1">查看登录、搜索、认领、导入等关键操作记录</div>
        </div>
        <n-flex align="center" :size="12">
          <n-select
            v-model:value="filters.action"
            clearable
            placeholder="动作"
            :options="actionOptions"
            class="!w-44"
            @update:value="handleFilter"
          />
          <n-input-number
            v-model:value="filters.user_id"
            clearable
            placeholder="用户 ID"
            class="!w-36"
            @update:value="handleFilter"
          />
          <n-button type="primary" :loading="loading" @click="loadData">刷新</n-button>
        </n-flex>
      </n-flex>
    </n-card>

    <n-card :bordered="false" class="!shadow !rounded-xl">
      <n-data-table
        remote
        :columns="columns"
        :data="rows"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row) => row.id"
        @update:page="handlePage"
        @update:page-size="handlePageSize"
      />
    </n-card>
  </n-flex>
</template>

<script lang="ts" setup>
import { NButton, NTag, NTime } from 'naive-ui'
import { h } from 'vue'
import { LogApi, type UserLogRow } from '@/api/log'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const rows = ref<UserLogRow[]>([])
const total = ref(0)
const filters = reactive<{ action?: string | null; user_id?: number | null }>({
  action: null,
  user_id: null
})
const pager = reactive({ page: 1, pageSize: 20 })

const actionOptions = [
  'login',
  'search',
  'claim',
  'revoke',
  'transfer',
  'delete_contact',
  'export',
  'import',
  'update_field',
  'delete_group',
  'disable_user'
].map((value) => ({ label: value, value }))

const pagination = computed(() => ({
  page: pager.page,
  pageSize: pager.pageSize,
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
}))

function toTime(value: unknown) {
  if (typeof value === 'number') return value < 1e12 ? value * 1000 : value
  return value ? new Date(value as string).getTime() : Date.now()
}

function showDetails(row: UserLogRow) {
  const details = row.details || '{}'
  dialog.info({
    title: `日志 #${row.id}`,
    content: () =>
      h(
        'pre',
        {
          class:
            'max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded bg-gray-50 p-3 text-xs leading-5'
        },
        formatJson(details)
      ),
    positiveText: '关闭'
  })
}

function formatJson(raw: string) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

const columns = [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  { title: '用户 ID', key: 'user_id', width: 100, align: 'center' },
  {
    title: '动作',
    key: 'action',
    width: 150,
    align: 'center',
    render(row: UserLogRow) {
      const type = row.action === 'import' ? 'info' : row.action === 'claim' ? 'success' : 'default'
      return h(
        NTag,
        { type: type as 'info' | 'success' | 'default', bordered: false },
        { default: () => row.action }
      )
    }
  },
  {
    title: '详情',
    key: 'details',
    minWidth: 260,
    ellipsis: { tooltip: true },
    render(row: UserLogRow) {
      return row.details || '-'
    }
  },
  {
    title: '时间',
    key: 'created_at',
    width: 180,
    render(row: UserLogRow) {
      return row.created_at
        ? h(NTime, { time: toTime(row.created_at), format: 'yyyy-MM-dd HH:mm:ss' })
        : '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    render(row: UserLogRow) {
      return h(
        NButton,
        { size: 'small', onClick: () => showDetails(row) },
        { default: () => '查看' }
      )
    }
  }
]

async function loadData() {
  loading.value = true
  try {
    const res = await LogApi.fetchUserLogs({
      page: pager.page,
      size: pager.pageSize,
      action: filters.action || undefined,
      user_id: filters.user_id || undefined
    })
    rows.value = res.data.list
    total.value = res.data.total_count
  } catch {
    message.error('系统日志加载失败')
  } finally {
    loading.value = false
  }
}

function handleFilter() {
  pager.page = 1
  loadData()
}

function handlePage(page: number) {
  pager.page = page
  loadData()
}

function handlePageSize(pageSize: number) {
  pager.pageSize = pageSize
  pager.page = 1
  loadData()
}

onMounted(loadData)
</script>
