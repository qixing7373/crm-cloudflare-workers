import { computed, h, type Ref } from 'vue'
import { NTag, NText, NTime, NFlex, NButton, NPopconfirm } from 'naive-ui'
import type { ContactField } from '@/api/field'

export interface ColumnOptions {
  t: (key: string, ...args: any[]) => string
  fields: Ref<ContactField[]>
  onEdit: (row: any) => void
  onDelete: (id: number) => void
}

export const parseOpts = (raw: any) => {
  if (!raw) return []
  try {
    return (JSON.parse(raw) as any[]).map((x) =>
      typeof x === 'object'
        ? {
            label: x.label || x.zh || x.name || x.value || x.val || x.id,
            value: String(x.value || x.val || x.id)
          }
        : { label: String(x), value: String(x) }
    )
  } catch {
    return String(raw)
      .split(',')
      .filter(Boolean)
      .map((x) => ({ label: x.trim(), value: x.trim() }))
  }
}

const getVal = (r: any, k: string) => {
  if (k in r && k !== 'data') return r[k]
  try {
    const obj = typeof r.data === 'string' ? JSON.parse(r.data) : r.data || {}
    return obj[k] ?? ''
  } catch {
    return ''
  }
}

export function useColumns({ t, fields, onEdit, onDelete }: ColumnOptions) {
  return computed(() => [
    { title: 'ID', key: 'id', width: 70, align: 'center', ellipsis: { tooltip: true } },
    {
      title: () => t('状态'),
      key: 'status',
      align: 'center',
      ellipsis: { tooltip: true },
      render: (r: any) =>
        h(
          NTag,
          { type: r.status === 'developed' ? 'success' : 'warning', size: 'small', bordered: false },
          { default: () => t(r.status === 'developed' ? '已开发' : '未开发') }
        )
    },
    ...fields.value
      .filter((f) => f.enabled)
      .map((f) => ({
        title: f.label || '',
        key: f.key,
        ellipsis: { tooltip: true },
        align: 'center' as const,
        render: (r: any) => {
          const v = getVal(r, f.key)
          if (!v) return h(NText, { depth: 3 }, { default: () => '-' })
          if (f.type === 'select') {
            const matched = parseOpts(f.options).find((o) => String(o.value) === String(v))
            return matched ? matched.label : v
          }
          return v
        }
      })),
    {
      title: () => t('更新时间'),
      key: 'latest_imported_at',
      align: 'center',
      render: (r: any) =>
        !r.latest_imported_at
          ? h(NText, { depth: 3 }, { default: () => '-' })
          : h(NTime, { time: new Date(r.latest_imported_at), format: 'yyyy-MM-dd HH:mm' })
    },
    {
      title: () => t('操作'),
      key: 'actions',
      width: 140,
      ellipsis: false,
      align: 'center',
      fixed: 'right',
      render: (r: any) =>
        h(
          NFlex,
          { justify: 'center', size: 'small', wrap: false },
          {
            default: () => [
              h(
                NButton,
                { size: 'small', type: 'info', quaternary: true, onClick: () => onEdit(r) },
                { default: () => t('编辑') }
              ),
              h(
                NPopconfirm,
                {
                  onNegativeClick: () => onDelete(r.id),
                  positiveText: t('取消'),
                  negativeText: t('确认'),
                  negativeButtonProps: { type: 'error' }
                },
                {
                  trigger: () =>
                    h(
                      NButton,
                      { size: 'small', type: 'error', quaternary: true },
                      { default: () => t('删除') }
                    ),
                  default: () => t('确定删除？')
                }
              )
            ]
          }
        )
    }
  ])
}
