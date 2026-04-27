/**
 * @file   routes/invite.ts — 邀请码路由
 * @desc   邀请码基于 HMAC(user_id + 日期) 计算，每天自动轮换
 *         只有 manager/superadmin 可获取自己的邀请码
 * @routes GET /invite/code — 获取当前用户今日邀请码（manager+）
 */
import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { requireRole } from '@/middleware/role.mid'
import { success } from '@/hono/response'
import { generateInviteCode } from '@/utility/inviteCode'

const inviteRouter = new Hono<AppEnv>()

// ── GET /invite/code ── 获取今日邀请码（manager+）
inviteRouter.get('/code', requireRole('manager'), async (c) => {
  const _viewer = c.get('user')
  const _code = await generateInviteCode(_viewer.id, c.env.JWT_SECRET)

  return success(c, {
    code: _code
  })
})

export default inviteRouter
