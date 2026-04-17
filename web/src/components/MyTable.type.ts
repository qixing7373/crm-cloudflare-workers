import type { DataTableColumn } from 'naive-ui'

export interface MyTableColumn extends Omit<DataTableColumn<any>, 'title'> {
  title?: string | (() => any)
  icon?: any
  copyable?: boolean
  timeFormat?: boolean | string
  button?: {
    type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
    size?: 'tiny' | 'small' | 'medium' | 'large'
    quaternary?: boolean
    secondary?: boolean
    dashed?: boolean
    icon?: any
    isShow?: boolean | ((row: any) => boolean)
    onClick?: (row: any, key: string) => void
  }
  actions?: Array<{
    label?: string
    icon?: any
    type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
    size?: 'tiny' | 'small' | 'medium' | 'large'
    quaternary?: boolean
    secondary?: boolean
    dashed?: boolean
    isShow?: boolean | ((row: any) => boolean)
    onClick?: (row: any, index: number) => void
  }>
}
