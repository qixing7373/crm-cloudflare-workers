<template>
  <n-data-table v-bind="props" :columns="cols" :pagination="pager" :scroll-x="autoScrollX">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </n-data-table>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'
import { NFlex, NIcon, NTime, NButton } from 'naive-ui'
import MyCopy from '@/components/MyCopy.vue'

const props = withDefaults(
  defineProps<{
    columns?: any[]
    striped?: boolean
    remote?: boolean
    size?: 'small' | 'medium' | 'large'
    bordered?: boolean
    singleLine?: boolean
    pagination?: any
    rowKey?: (row: any) => string | number
    scrollX?: number | string
  }>(),
  {
    striped: true,
    remote: true,
    size: 'medium',
    bordered: true,
    singleLine: false,
    rowKey: (r: any) => r._row_key || r.id
  }
)

const pager = computed(() => {
  const { pagination: p } = props
  return p && (!p.itemCount || p.itemCount > p.pageSize) ? p : false
})

const autoScrollX = computed(() => {
  if (props.scrollX !== undefined) return props.scrollX
  // Default dynamic calculation for inner width based on columns to prevent squeezing
  return cols.value.reduce((acc, col: any) => acc + (Number(col.width) || Number(col.minWidth)), 0)
})

const cols = computed(() =>
  (props.columns || []).map((col: any, idx: number) => {
    const out = {
      key: `auto_${idx}`,
      align: 'center',
      minWidth: col.width ? undefined : 135,
      ellipsis: col.ellipsis === false ? false : col.ellipsis || { tooltip: true },
      ...col
    }
    const {
      render: fn,
      key,
      icon,
      title,
      type,
      timeFormat: time,
      copyable: copy,
      button: btn,
      actions: acts
    } = out

    if (icon)
      out.title = () =>
        h(
          NFlex,
          {
            size: 3,
            align: 'center',
            justify: 'center',
            class: 'text-gray-800 font-semibold'
          },
          () => [
            h(NIcon, { size: 14 }, () => h(icon)),
            h('span', null, typeof title === 'function' ? title() : title || key)
          ]
        )

    if (!type && !time && !fn && key)
      out.render = (row: any) => {
        const v = row[key]
        return typeof v === 'number' || (!isNaN(Number(v)) && String(v).trim() !== '')
          ? h('span', { class: 'font-mono tabular-nums' }, v)
          : v || '-'
      }

    if (time)
      out.render = (row: any) =>
        row[key]
          ? h(
              'span',
              { class: 'font-mono tabular-nums' },
              h(NTime, {
                time: new Date(row[key]),
                format: typeof time === 'string' ? time : 'yyyy-MM-dd HH:mm:ss'
              })
            )
          : '-'

    if (copy) {
      const run = out.render
      out.render = (row: any, i: number) =>
        h(MyCopy, {
          text: run ? run(row, i) : row[key],
          truncate: out.truncate
        })
    }

    if (btn)
      out.render = (row: any) => {
        const text = row[key]
        if (!text) return '-'
        if (typeof btn.isShow === 'function' ? !btn.isShow(row) : btn.isShow === false)
          return h('span', { class: 'font-mono tabular-nums' }, String(text))

        return h(
          NButton,
          {
            size: btn.size || 'small',
            type: btn.type || 'default',
            quaternary: btn.quaternary === true,
            dashed: btn.dashed !== false,
            secondary: btn.secondary === true,
            onClick: () => btn.onClick?.(row, key)
          },
          {
            icon: btn.icon && (() => h(NIcon, null, () => h(btn.icon))),
            default: () => h('span', { class: 'font-mono tabular-nums' }, String(text))
          }
        )
      }

    if (acts?.length)
      out.render = (row: any, i: number) => {
        const list = acts
          .filter((a: any) => (typeof a.isShow === 'function' ? a.isShow(row) : a.isShow !== false))
          .map((a: any) =>
            h(
              NButton,
              {
                size: a.size || 'small',
                type: a.type || 'default',
                quaternary: a.quaternary !== false && !a.secondary && !a.dashed,
                secondary: !!a.secondary && !a.dashed,
                dashed: a.dashed === true,
                onClick: () => a.onClick?.(row, i)
              },
              {
                icon: a.icon && (() => h(NIcon, null, () => h(a.icon))),
                default: a.label && (() => a.label)
              }
            )
          )
        return !list.length
          ? '-'
          : list.length === 1
            ? list[0]
            : h(NFlex, { size: 12, wrap: false, align: 'center', justify: 'center' }, () => list)
      }

    return out
  })
)
</script>
