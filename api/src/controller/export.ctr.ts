/**
 * @file   controller/export.ts — CSV 导出路由（超管）
 * @routes GET /export/contacts — 全量导出联系人为 CSV 文件流
 * @security 导出操作写入审计日志，记录导出条数
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { ExportService } from '@/service/export.svc'
import { requireRole } from '@/middleware/role.mid'

const exportRouter = new Hono<AppEnv>()

// ── GET /export/contacts ── CSV 流式导出（超管）
exportRouter.get('/contacts', requireRole('superadmin'), async (c) => {
  const _db = c.get('db')
  const _viewer = c.get('user')

  const _all = await ExportService.exportContacts(_db, _viewer.id)

  // 构建 CSV
  const _header = 'id,phone,status,owner_id,data,claimed_at,import_count\n'
  const _rows = _all.map((_r) =>
    `${_r.id},"${_r.phone || ''}","${_r.status}",${_r.owner_id || ''},"${(_r.data || '').replace(/"/g, '""')}",${_r.claimed_at || ''},${_r.import_count || 0}`
  ).join('\n')

  const _today = new Date().toISOString().slice(0, 10)
  return new Response(_header + _rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="contacts_${_today}.csv"`,
    },
  })
})

export default exportRouter
