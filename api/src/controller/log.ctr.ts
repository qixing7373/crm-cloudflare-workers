/**
 * @file   controller/log.ts — 审计日志路由
 * @routes GET /log/contact/:id — 单个联系人变更时间轴
 *         GET /log             — 全局审计日志（支持 action/user_id 筛选）
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { LogService } from '@/service/log.svc'
import { requireRole } from '@/middleware/role.mid'
import { success, paginate } from '@/hono/response'

const logRouter = new Hono<AppEnv>()

// ── GET /log/contact/:id ── 联系人变更时间轴
logRouter.get('/contact/:id', async (c) => {
  const _contact_id = Number(c.req.param('id'))
  const _db = c.get('db')
  const _logs = await LogService.listByContact(_db, _contact_id)
  return success(c, _logs)
})

// ── GET /log ── 全局审计（manager+）
logRouter.get('/', requireRole('manager'), async (c) => {
  const _db = c.get('db')
  const { page: _page, size: _size, offset: _offset } = c.get('page_info')
  const _action = c.req.query('action')
  const _user_id = c.req.query('user_id')

  const { list, total } = await LogService.listUserLogs(_db, {
    offset: _offset, size: _size,
    action: _action, userId: _user_id ? +_user_id : undefined,
  })

  return paginate(c, list, total, _page, _size)
})

export default logRouter
