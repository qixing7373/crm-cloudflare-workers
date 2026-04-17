/**
 * @file   hook.ts — 全局业务钩子
 * @desc   提供 db 实例全局注入、分页参数标准化解析
 */
import type { Context, Next } from 'hono'
import { drizzle } from 'drizzle-orm/d1'

/** 
 * db 挂载中间件
 * 将 drizzle(c.env.DB) 缓存至 c.set('db')，避免重复实例化
 */
export const dbHook = async (c: Context, next: Next) => {
  // 如果尚未挂载则挂载，防止重复执行
  if (!c.var.db) {
    c.set('db', drizzle(c.env.DB))
  }
  await next()
}

/** 
 * 分页参数解析中间件
 * 将 query 参数 page 和 size 解析为数字并计算 offset 注入变量
 */
export const paginateHook = async (c: Context, next: Next) => {
  const page = Math.max(1, Number(c.req.query('page') || '1'))
  const size = Math.min(100, Math.max(1, Number(c.req.query('size') || '20')))
  c.set('page_info', { page, size, offset: (page - 1) * size })
  await next()
}

