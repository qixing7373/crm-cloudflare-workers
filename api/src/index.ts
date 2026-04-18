/**
 * @file   index.ts — Workers 入口
 * @desc   注册全局中间件（CORS、JWT 认证）、挂载路由、全局错误兜底、Cron 触发器
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from '@/hono/env'
import { AppError } from '@/hono/AppError'
import { success, fail } from '@/hono/response'
import { ErrorCode } from '@/codes'
import { auth } from '@/middleware/auth.mid'
import authRouter from '@/controller/auth.ctr'
import userRouter from '@/controller/user.ctr'
import groupRouter from '@/controller/group.ctr'
import contactRouter from '@/controller/contact.ctr'
import fieldRouter from '@/controller/field.ctr'
import statRouter from '@/controller/stat.ctr'
import logRouter from '@/controller/log.ctr'
import exportRouter from '@/controller/export.ctr'
import importRouter from '@/controller/import.ctr'
import inviteRouter from '@/controller/invite.ctr'
import { runDropoff } from '@/wrangler/dropoff'
import { dbHook, paginateHook } from '@/middleware/hook.mid'

const app = new Hono<AppEnv>()

// ── 钩子与中间件 ──
app.use('*', dbHook, paginateHook)
app.use('/*', async (c, next) => {
  return cors({
    // 完全通过环境变量 FRONTEND_URL 注入，多域名用逗号分隔
    origin: c.env.FRONTEND_URL ? c.env.FRONTEND_URL.split(',') : ['*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })(c, next)
})

// ── 健康检查 ──
// app.get('/', async (c) => {
//   let db = false
//   try {
//     // 执行原生 D1 极简查询以探测可用性
//     await c.env.DB.prepare('SELECT 1').first()
//     db = true
//   } catch (e) {
//     console.error('[DB_ERROR]', e)
//   }
//   return success(c, { db })
// })

// ── 健康检查 ──
app.get('/', async (c) => {
  let db = false
  try {
    await c.env.DB.prepare('SELECT 1').first()
    db = true
  } catch (e) {
    console.error('[DB_ERROR]', e)
  }

  return c.json({
    jwt: c.env.JWT_SECRET ? 'OK' : 'EMPTY',
    testFlag: c.env.TEST_FLAG || 'EMPTY',
    db,
  })
})


// ── 公开路由 ──
app.route('/auth', authRouter)

// ── 需要认证的路由 ──
app.use('/api/*', auth)
app.route('/api/user', userRouter)
app.route('/api/group', groupRouter)
app.route('/api/contact', contactRouter)
app.route('/api/field', fieldRouter)
app.route('/api/stat', statRouter)
app.route('/api/log', logRouter)
app.route('/api/export', exportRouter)
app.route('/api/import', importRouter)
app.route('/api/invite', inviteRouter)

// ── 全局错误处理 ──
app.onError((_error, c) => {
  if (_error instanceof AppError) {
    return fail(c, _error.code, _error.message)
  }
  console.error(_error)
  return fail(c, ErrorCode.INTERNAL_ERROR)
})

// ── 404 ──
app.notFound((c) => fail(c, -1, 'Not found'))

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: AppEnv['Bindings'], ctx: ExecutionContext) {
    const { drizzle } = await import('drizzle-orm/d1')
    ctx.waitUntil(runDropoff(drizzle(env.DB)))
  },
}
