<template>
  <MyModal :show="show" @update:show="(v: boolean) => emit('update:show', v)">
    <template #header>
      <WidgetSearchContact v-model:keyword="q" v-model:tailOnly="isTail" @search="doSearch">
        <n-button secondary type="primary" @click="onDown">
          <template #icon><n-icon :component="CloudDownload" /></template>
          <span v-text="`${tabInfo.label}_${tabInfo.count}.csv`" />
        </n-button>
      </WidgetSearchContact>
    </template>

    <template #header-extra>
      <n-pagination
        :class="{ invisible: total <= size }"
        v-model:page="pg"
        v-model:page-size="size"
        :item-count="total"
        show-size-picker
        :page-sizes="[30, 50, 100]"
      />
    </template>

    <div>
      <MyTable :remote="false" :columns="cols" :data="rows" :loading="loading" />
    </div>
  </MyModal>
</template>

<script lang="ts" setup>
import { CloudDownload } from '@vicons/ionicons5'
import { countByBatchAndType, queryBatchRows, type BatchRecord } from '@/plugins/localDb'

const props = defineProps<{ show: boolean; batch: BatchRecord | null; initialTab?: string }>()
const emit = defineEmits(['update:show'])
const t = inject('import-t') as any

const tab = ref('pending')
const q = ref('')
const query = ref('')
const isTail = ref(false)
const loading = ref(false)
const pg = ref(1)
const size = ref(30)
const rows = ref<any[]>([])
const total = ref(0)
const counts = ref<Record<string, number>>({})

const TABS = [
  { name: 'pending', label: '待同步', type: 'default' },
  { name: 'added', label: '新增', type: 'success' },
  { name: 'updated', label: '更新', type: 'info' },
  { name: 'skipped', label: '重复', type: 'warning' },
  { name: 'frozen', label: '冻结', type: 'error' }
]

const COLORS: Record<string, string> = {
  pending: '#666666',
  added: '#137a40',
  updated: '#1764c0',
  skipped: '#c36a00',
  frozen: '#a6203a'
}

const tabInfo = computed(() => {
  const tDef = TABS.find((x) => x.name === tab.value) || TABS[0]
  return { ...tDef, label: t(tDef.label), count: counts.value[tDef.name] || 0 }
})

const load = async () => {
  if (!props.batch || !props.show) return
  loading.value = true
  try {
    const id = props.batch.batch_id
    counts.value = await countByBatchAndType(id)
    const { total: tCount, rows: rList } = await queryBatchRows(
      id,
      tab.value,
      query.value,
      isTail.value,
      size.value,
      (pg.value - 1) * size.value
    )
    rows.value = rList.map((r) => ({
      ...r,
      _data: r.data ? JSON.parse(r.data) : {},
      _changes: r.changes ? JSON.parse(r.changes) : null
    }))
    total.value = tCount
  } finally {
    loading.value = false
  }
}

watch(
  [tab, query, isTail, () => props.batch],
  () => ((pg.value = 1), props.show && props.batch && load())
)
watch([pg, size], () => props.show && props.batch && load())
watch(
  () => props.show,
  (s) => s && (props.initialTab && (tab.value = props.initialTab), props.batch && load())
)

const doSearch = () => (query.value = q.value.trim().toLowerCase())

const fieldMap = computed(() => {
  if (!props.batch?.headers) return {}
  try {
    const arr = JSON.parse(props.batch.headers)
    return arr.reduce((acc: any, h: any) => ({ ...acc, [h.key]: h.label }), {})
  } catch {
    return {}
  }
})

const cols = computed(() => {
  const c = COLORS[tab.value] || '#333'
  const dataKeys = rows.value.length ? Object.keys(rows.value[0]._data || {}) : []
  return [
    {
      title: t('手机'),
      key: 'phone',
      width: 160,
      align: 'center',
      fixed: 'left',
      render: (r: any) => h('span', { style: `color:${c};font-weight:500;` }, r.phone)
    },
    ...dataKeys.map((k) => ({
      title: fieldMap.value[k] || k,
      key: `_data_${k}`,
      minWidth: 120,
      ellipsis: { tooltip: true },
      render: (r: any) => {
        const ch = r._changes?.[k]
        return ch
          ? h('div', { style: 'display:flex;flex-direction:column;gap:4px;padding:4px 0;' }, [
              h(
                'del',
                { style: 'color:#aaa;text-decoration-color:#f5222d;font-size:12px;' },
                String(ch.old ?? '空')
              ),
              h('span', { style: `color:${c};font-weight:bold;` }, String(ch.new ?? '空'))
            ])
          : h('span', { style: `color:${c};` }, String(r._data?.[k] ?? '-'))
      }
    })),
    ...(tab.value === 'frozen'
      ? [
          {
            title: t('拦截原因'),
            key: 'reason',
            fixed: 'right',
            width: 240,
            render: (r: any) =>
              h('span', { style: 'color:#d03050;font-weight:bold;' }, r.reason || '-')
          }
        ]
      : [])
  ]
})

const escapeCsv = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

async function onDown() {
  if (!total.value || !props.batch) return
  const { rows: rList } = await queryBatchRows(
    props.batch.batch_id,
    tab.value,
    query.value,
    isTail.value,
    1e6,
    0
  )
  if (!rList.length) return

  const out = rList.map((r) => ({ ...r, _data: r.data ? JSON.parse(r.data) : {} }))
  const keys = Object.keys(out[0]._data || {})
  const isErr = tab.value === 'frozen'
  const heads = [t('手机'), ...keys.map((k) => fieldMap.value[k] || k), ...(isErr ? [t('拦截原因')] : [])].join(',')

  const csv = [
    heads,
    ...out.map((r) =>
      [
        r.phone,
        ...keys.map((k) => escapeCsv(String(r._data?.[k] ?? ''))),
        ...(isErr ? [escapeCsv(String(r.reason ?? ''))] : [])
      ].join(',')
    )
  ]

  const ts = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\D/g, '')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(
    new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
  )
  a.download = `${tabInfo.value.label}_${tabInfo.value.count}_${ts}.csv`
  a.click()
}
</script>
