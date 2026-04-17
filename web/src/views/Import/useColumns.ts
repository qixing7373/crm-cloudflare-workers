import {
  AddCircle,
  DocumentText,
  Layers,
  Person,
  Copy,
  ShieldCheckmark,
  SyncCircle,
  Time,
  EyeOutline
} from '@vicons/ionicons5'
import { computed } from 'vue'
import type { MyTableColumn } from '@/components/MyTable.type'

export interface ColumnOptions {
  t: (key: string, ...args: any[]) => string
  onDetail?: (row: any, tabName?: string) => void
  onDelete?: (row: any) => void
}

export function useColumns({ t, onDetail }: ColumnOptions) {
  const btn = (type: any) => ({
    type,
    icon: EyeOutline,
    isShow: (row: any) => row._is_local,
    onClick: onDetail
  })

  return computed<MyTableColumn[]>(() => [
    { title: 'ID', key: 'id', width: 70 },
    { title: t('用户'), icon: Person, key: 'username', copyable: true },
    {
      title: t('文件'),
      icon: DocumentText,
      key: 'file',
      copyable: true,
      truncate: true
    },
    { title: t('总数'), icon: Layers, key: 'total' },
    {
      title: t('新增'),
      icon: AddCircle,
      key: 'added',
      button: btn('success')
    },
    {
      title: t('更新'),
      icon: SyncCircle,
      key: 'updated',
      button: btn('info')
    },
    {
      title: t('重复'),
      icon: Copy,
      key: 'skipped',
      button: btn('warning')
    },
    {
      title: t('冻结'),
      icon: ShieldCheckmark,
      key: 'frozen',
      button: btn('error')
    },
    { title: t('时间'), icon: Time, key: 'created_at', timeFormat: true }
  ])
}
