import { app } from '@pinia'
import {
  ArrowDownOutline,
  ArrowUpOutline,
  CheckmarkCircleOutline,
  CreateOutline,
  Hammer,
  Key,
  Pricetag,
  Settings,
  Shapes,
  ShieldCheckmark,
  SwapVertical,
  TrashOutline
} from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NFlex, NIcon, NPopconfirm, NPopover, NTag, NText, NTooltip } from 'naive-ui'
import type { ContactField } from '@/api/field'

type TFunction = (key: string, ...args: any[]) => string

export function useColumns(
  t: TFunction,
  field_list: Ref<ContactField[]>,
  moveRow: (index: number, direction: 'up' | 'down') => void,
  toggleEnable: (row: ContactField) => void,
  openEditDrawer: (row: ContactField) => void
) {
  const typeMap = computed<Record<string, string>>(() => ({
    text: t('文本输入'),
    number: t('数字输入'),
    phone: t('手机号'),
    select: t('下拉单选'),
    date: t('日期选择'),
    boolean: t('开关配置')
  }))

  const columns = computed<DataTableColumns<ContactField>>(() => [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render(_, index) {
        return h(NText, { depth: 3, class: 'font-mono' }, { default: () => index + 1 })
      }
    },
    {
      title: t('排序'),
      icon: SwapVertical,
      key: 'sort',
      width: 80,
      align: 'center',
      render(_, index) {
        return h(NFlex, { size: 4, align: 'center', justify: 'center' }, () => [
          h(
            NButton,
            { size: 'tiny', disabled: index === 0, onClick: () => moveRow(index, 'up') },
            { icon: () => h(NIcon, null, { default: () => h(ArrowUpOutline) }) }
          ),
          h(
            NButton,
            {
              size: 'tiny',
              disabled: index === field_list.value.length - 1,
              onClick: () => moveRow(index, 'down')
            },
            { icon: () => h(NIcon, null, { default: () => h(ArrowDownOutline) }) }
          )
        ])
      }
    },
    {
      title: t('名称'),
      icon: Pricetag,
      key: 'label',
      minWidth: 120,
      align: 'center',
      render(row) {
        const displayLabel = app().language === 'en-US' && row.label_en ? row.label_en : row.label
        return h(
          NText,
          { strong: true, class: !row.enabled ? 'line-through text-gray-400' : '' },
          { default: () => displayLabel }
        )
      }
    },
    {
      title: t('标识符'),
      icon: Key,
      key: 'key',
      align: 'center',
      render(row) {
        return h(NTag, { type: 'default', bordered: false }, { default: () => row.key })
      }
    },
    {
      title: t('类型'),
      icon: Shapes,
      key: 'type',
      align: 'center',
      render(row) {
        return typeMap.value[row.type] || row.type
      }
    },
    {
      title: t('约束'),
      icon: ShieldCheckmark,
      key: 'constraints',
      align: 'center',
      render(row) {
        const tags: any[] = []
        if (row.required)
          tags.push(
            h(NTag, { type: 'error', size: 'small', bordered: false }, { default: () => t('必填') })
          )
        if (!row.editable)
          tags.push(
            h(
              NTag,
              { type: 'warning', size: 'small', bordered: false },
              { default: () => t('锁定') }
            )
          )
        if (tags.length === 0) tags.push(h(NText, { depth: 3 }, { default: () => t('-') }))
        return h(NFlex, { size: 6, justify: 'center' }, () => tags)
      }
    },
    {
      title: t('选项'),
      icon: Settings,
      key: 'options',
      align: 'center',
      render(row) {
        if (row.type !== 'select') return '-'
        if (!row.options) return '-'
        try {
          const arr = JSON.parse(row.options)
          const tags = arr.map((o: any) => {
            const displayLabel = app().language === 'en-US' ? o.en || o.val : o.zh || o.val
            return h(
              NTag,
              { size: 'small', type: 'info', bordered: false },
              { default: () => `${o.val} : ${displayLabel}` }
            )
          })

          if (tags.length > 3) {
            const visibleTags = tags.slice(0, 3)
            visibleTags.push(
              h(
                NTag,
                { size: 'small', type: 'warning', bordered: false, style: 'cursor: help' },
                { default: () => t('+{0} 展开', [tags.length - 3]) }
              )
            )
            return h(
              NPopover,
              { placement: 'right', trigger: 'hover' },
              {
                trigger: () =>
                  h(NFlex, { vertical: true, size: 4, align: 'center' }, () => visibleTags),
                default: () => h(NFlex, { vertical: true, size: 4, align: 'center' }, () => tags)
              }
            )
          }
          return h(NFlex, { vertical: true, size: 4, align: 'center' }, () => tags)
        } catch (e) {
          return h(
            NTooltip,
            { placement: 'top' },
            {
              trigger: () =>
                h(
                  NText,
                  { depth: 3, class: 'truncate max-w-[150px] inline-block cursor-help' },
                  { default: () => row.options || '-' }
                ),
              default: () => row.options
            }
          )
        }
      }
    },
    {
      title: t('操作'),
      icon: Hammer,
      key: 'actions',
      minWidth: 160,
      align: 'center',
      render(row) {
        return h(NFlex, { size: 12, justify: 'center' }, () => [
          row.enabled
            ? h(
                NPopconfirm,
                {
                  onNegativeClick: () => toggleEnable(row),
                  positiveText: t('取消'),
                  negativeText: t('确定'),
                  negativeButtonProps: { type: 'error' }
                },
                {
                  trigger: () =>
                    h(
                      NButton,
                      { size: 'small', type: 'error', quaternary: true },
                      {
                        default: () => t('停用'),
                        icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
                      }
                    ),
                  default: () => t('停用后不可录入，确定停用？')
                }
              )
            : h(
                NButton,
                {
                  size: 'small',
                  type: 'success',
                  quaternary: true,
                  onClick: () => toggleEnable(row)
                },
                {
                  default: () => t('启用'),
                  icon: () => h(NIcon, null, { default: () => h(CheckmarkCircleOutline) })
                }
              ),
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              quaternary: true,
              onClick: () => openEditDrawer(row)
            },
            {
              default: () => t('编辑'),
              icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
            }
          )
        ])
      }
    }
  ])

  return { columns, typeMap }
}
