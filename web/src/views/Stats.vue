<template>
  <n-flex vertical :size="16">
    <n-card :bordered="false" class="!shadow !rounded-xl">
      <n-flex align="center" justify="space-between">
        <div>
          <n-text class="!text-xl !font-bold">我的报表</n-text>
          <div class="!text-sm !text-gray-500 !mt-1">按月份查看当前账号已开发客户数量</div>
        </div>
        <n-flex align="center" :size="12">
          <n-date-picker v-model:formatted-value="month" type="month" value-format="yyyy-MM" clearable />
          <n-button type="primary" :loading="loading" @click="loadData">刷新</n-button>
        </n-flex>
      </n-flex>
    </n-card>

    <n-grid :cols="3" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="已开发客户" :value="stat?.claimed_count ?? 0" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="统计月份" :value="stat?.month === 'all' ? '全部' : stat?.month || '-'" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="用户 ID" :value="stat?.user_id ?? user().user_info?.id ?? '-'" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-card :bordered="false" class="!shadow !rounded-xl">
      <n-alert type="info" :show-icon="true">
        个人统计来自 `/api/stat/me`，只统计当前账号名下已开发客户。清空月份后统计全部数据。
      </n-alert>
    </n-card>
  </n-flex>
</template>

<script lang="ts" setup>
import { user } from '@pinia'
import { type MyStat, StatApi } from '@/api/stat'

const message = useMessage()
const loading = ref(false)
const month = ref<string | null>(new Date().toISOString().slice(0, 7))
const stat = ref<MyStat | null>(null)

async function loadData() {
  loading.value = true
  try {
    const res = await StatApi.fetchMine(month.value || undefined)
    stat.value = res.data
  } catch {
    message.error('个人统计加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
