<template>
  <n-flex vertical :size="16">
    <n-card :bordered="false" class="!shadow !rounded-xl">
      <n-flex align="center" justify="space-between">
        <div>
          <n-text class="!text-xl !font-bold">团队统计</n-text>
          <div class="!text-sm !text-gray-500 !mt-1">按客户归属人聚合团队已开发数量</div>
        </div>
        <n-button type="primary" :loading="loading" @click="loadData">刷新</n-button>
      </n-flex>
    </n-card>

    <n-grid :cols="3" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="团队已开发总数" :value="totalDeveloped" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="参与成员" :value="rows.length" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="!shadow !rounded-xl">
          <n-statistic label="最高个人量" :value="topCount" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-card :bordered="false" class="!shadow !rounded-xl">
      <n-data-table
        :columns="columns"
        :data="rows"
        :loading="loading"
        :pagination="{ pageSize: 20 }"
        :row-key="(row) => row.user_id ?? 'none'"
      />
    </n-card>
  </n-flex>
</template>

<script lang="ts" setup>
import { NTag } from 'naive-ui'
import { h } from 'vue'
import { type GroupStat, StatApi } from '@/api/stat'
import { UserApi } from '@/api/user'

type TeamRow = GroupStat & {
  username: string
  role?: string
}

const message = useMessage()
const loading = ref(false)
const rows = ref<TeamRow[]>([])

const totalDeveloped = computed(() =>
  rows.value.reduce((sum, row) => sum + Number(row.count || 0), 0)
)
const topCount = computed(() => Math.max(0, ...rows.value.map((row) => Number(row.count || 0))))

const columns = [
  { title: '用户 ID', key: 'user_id', width: 100, align: 'center' },
  { title: '用户', key: 'username', minWidth: 160, align: 'center' },
  {
    title: '角色',
    key: 'role',
    width: 120,
    align: 'center',
    render(row: TeamRow) {
      const type = row.role === 'superadmin' ? 'error' : row.role === 'manager' ? 'info' : 'default'
      const label =
        row.role === 'superadmin' ? '超管' : row.role === 'manager' ? '管理员' : '业务员'
      return h(
        NTag,
        { type: type as 'error' | 'info' | 'default', bordered: false },
        { default: () => label }
      )
    }
  },
  { title: '已开发数量', key: 'count', width: 140, align: 'center', sorter: 'default' }
]

async function loadData() {
  loading.value = true
  try {
    const [statRes, userRes] = await Promise.all([StatApi.fetchGroup(), UserApi.list()])
    const users = new Map(userRes.data.map((item) => [item.id, item]))
    rows.value = statRes.data
      .map((row) => {
        const matched = row.user_id ? users.get(row.user_id) : null
        return {
          ...row,
          username: matched?.username || (row.user_id ? `用户 ${row.user_id}` : '未归属'),
          role: matched?.role
        }
      })
      .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
  } catch {
    message.error('团队统计加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
