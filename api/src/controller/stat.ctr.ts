/**
 * @file   controller/stat.ts — 统计路由
 * @routes GET /stat/me       — 员工个人统计
 *         GET /stat/group    — 分组统计（manager+）
 *         GET /stat/overview — 全局概览（超管）
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { StatService } from '@/service/stat.svc'
import { requireRole } from '@/middleware/role.mid'
import { success } from '@/hono/response'

const statRouter = new Hono<AppEnv>()

// ── GET /stat/me ── 个人统计
statRouter.get('/me', async (c) => {
  const _viewer = c.get('user')
  const _month = c.req.query('month')
  const _db = c.get('db')
  const _data = await StatService.getMyStats(_db, _viewer.id, _month)
  return success(c, _data)
})

// ── GET /stat/group ── 分组统计（manager）
statRouter.get('/group', requireRole('manager'), async (c) => {
  const _db = c.get('db')
  const _stats = await StatService.getGroupStats(_db)
  return success(c, _stats)
})

// ── GET /stat/overview ── 天眼（superadmin）
statRouter.get('/overview', requireRole('superadmin'), async (c) => {
  const _db = c.get('db')
  const _stats = await StatService.getOverview(_db)
  return success(c, _stats)
})

export default statRouter
