<!--
  @file   views/Import/index.vue
  @desc   客户导入页 — 集成本地 WASM-SQLite 暂存 + 后台同步引擎 + 云端历史
-->
<template>
  <div class="relative min-h-[400px]">
    <n-spin :show="!isLocalDbReady">
      <template #description>{{ t('正在初始化') }}</template>
      <MyCard>
        <template #header>
          <MySearch v-model:value="keyword" @search="doSearch" />
        </template>
        <template #header-extra>
          <Toolbar @success="onImport" />
        </template>
        <MyTable
          :columns="columns"
          :data="merged"
          :loading="loading"
          :pagination="pager"
          @update:page="onPage"
        />
      </MyCard>

      <n-flex justify="end" class="mt-4">
        <n-button dashed size="small" text-color="#999" @click="onClearLocal">
          {{ t('清空本地数据') }}
        </n-button>
      </n-flex>
      <ModalDetail v-model:show="showModal" :batch="curBatch" :initial-tab="initTab" />
    </n-spin>
  </div>
</template>

<script lang="ts" setup>
import { t } from '@i18n'
import { user } from '@pinia'
import { ImportApi, type ImportHistoryRow } from '@/api/import'
import {
  type BatchRecord,
  clearAllLocalData,
  initLocalDb,
  isLocalDbReady,
  listBatches
} from '@/plugins/localDb'
import { startSyncEngine } from '@/plugins/syncEngine'
import ModalDetail from './ModalDetail.vue'
import Toolbar from './Toolbar.vue'
import { useColumns } from './useColumns'

const keyword = ref('')
const loading = ref(false)
const clouds = ref<ImportHistoryRow[]>([])
const locals = ref<BatchRecord[]>([])
const pager = ref({ page: 1, pageSize: 50, itemCount: 0 })
const showModal = ref(false)
const curBatch = ref<BatchRecord | null>(null)
const initTab = ref('pending')

function showBatchDetail(r: BatchRecord, tabName = 'pending') {
  curBatch.value = r
  initTab.value = tabName
  showModal.value = true
}

const columns = useColumns({
  t,
  onDetail: showBatchDetail
})
provide('import-t', t)

const merged = computed(() => {
  const { username } = user().user_info || {}
  const localIds = new Set(locals.value.map((b) => b.import_id).filter(Boolean))
  return [
    ...locals.value.map((b) => ({
      ...b,
      id: b.import_id ?? '-',
      status: b.status === 'done' ? t('已完成') : b.status === 'error' ? t('失败') : t('同步中'),
      username,
      _row_key: b.batch_id,
      file: b.file_name,
      _is_local: true
    })),
    ...clouds.value
      .filter((c) => !localIds.has(c.id))
      .map((c) => ({ ...c, status: t('已完成'), _is_local: false }))
  ]
})

const loadList = async (silent = false) => {
  if (!silent) loading.value = true
  try {
    const { data } = await ImportApi.fetchHistory({
      page: pager.value.page,
      size: pager.value.pageSize,
      q: keyword.value
    })
    if (data) {
      clouds.value = data.list
      pager.value.itemCount = data.total_count || data.total || 0
    }
  } finally {
    if (!silent) loading.value = false
  }
}

const loadLocal = async () => {
  await initLocalDb().catch(() => {})
  locals.value = await listBatches().catch(() => [])
}

function onPage(pg: number) {
  pager.value.page = pg
  void loadList()
}

function doSearch() {
  keyword.value = keyword.value.trim()
  pager.value.page = 1
  void loadList()
}

function onSync() {
  void loadLocal()
  void loadList(true)
}

async function onImport() {
  await loadLocal()
  startSyncEngine()
}

async function onClearLocal() {
  await clearAllLocalData()
  void loadLocal()
}

onMounted(() => (loadList(), loadLocal(), window.addEventListener('import-sync-update', onSync)))
onUnmounted(() => window.removeEventListener('import-sync-update', onSync))
</script>
