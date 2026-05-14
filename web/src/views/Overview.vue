<template>
  <n-flex vertical :size="16">
    <n-card :bordered="false" class="!shadow !rounded-xl">
      <n-flex align="center" justify="space-between">
        <div>
          <n-text class="!text-xl !font-bold">工作台</n-text>
          <div class="!text-sm !text-gray-500 !mt-1">全局资源概览、近期导入和系统动作</div>
        </div>
        <n-button type="primary" :loading="loading" @click="loadData">刷新</n-button>
      </n-flex>
    </n-card>

    <n-grid :cols="4" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="总客户" :value="overview?.total ?? 0" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="已开发" :value="overview?.developed ?? 0" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="未开发" :value="overview?.undeveloped ?? 0" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="开发率" :value="overview?.develop_rate ?? '0%'" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid :cols="2" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-card title="近期导入" :bordered="false" class="!shadow !rounded-xl">
          <n-data-table
            :columns="importColumns"
            :data="imports"
            :loading="loading"
            :pagination="false"
            :row-key="(row) => row.id"
          />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="近期动作" :bordered="false" class="!shadow !rounded-xl">
          <n-data-table
            :columns="logColumns"
            :data="logs"
            :loading="loading"
            :pagination="false"
            :row-key="(row) => row.id"
          />
        </n-card>
      </n-gi>
    </n-grid>
  </n-flex>
</template>

<script lang="ts" setup>
import { NTime } from 'naive-ui'
import { h } from 'vue'
import { ImportApi, type ImportHistoryRow } from '@/api/import'
import { LogApi, type UserLogRow } from '@/api/log'
import { StatApi } from '@/api/stat'
import type { StatOverview } from '@/types/api'

const message = useMessage()
const loading = ref(false)
const overview = ref<StatOverview | null>(null)
const imports = ref<ImportHistoryRow[]>([])
const logs = ref<UserLogRow[]>([])

function toTime(value: unknown) {
  if (typeof value === 'number') return value < 1e12 ? value * 1000 : value
  return value ? new Date(value as string).getTime() : Date.now()
}

const importColumns = [
  { title: '文件', key: 'file', minWidth: 180, ellipsis: { tooltip: true } },
  { title: '总数', key: 'total', width: 80, align: 'center' },
  { title: '新增', key: 'added', width: 80, align: 'center' },
  { title: '更新', key: 'updated', width: 80, align: 'center' },
  {
    title: '时间',
    key: 'created_at',
    width: 170,
    render(row: ImportHistoryRow) {
      return row.created_at
        ? h(NTime, { time: toTime(row.created_at), format: 'yyyy-MM-dd HH:mm' })
        : '-'
    }
  }
]

const logColumns = [
  { title: '用户', key: 'user_id', width: 80, align: 'center' },
  { title: '动作', key: 'action', width: 120, align: 'center' },
  {
    title: '时间',
    key: 'created_at',
    width: 170,
    render(row: UserLogRow) {
      return row.created_at
        ? h(NTime, { time: toTime(row.created_at), format: 'yyyy-MM-dd HH:mm' })
        : '-'
    }
  }
]

async function loadData() {
  loading.value = true
  try {
    const [overviewRes, importRes, logRes] = await Promise.all([
      StatApi.fetchOverview(),
      ImportApi.fetchHistory({ page: 1, size: 5 }),
      LogApi.fetchUserLogs({ page: 1, size: 5 })
    ])
    overview.value = overviewRes.data
    imports.value = importRes.data.list
    logs.value = logRes.data.list
  } catch {
    message.error('工作台数据加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
