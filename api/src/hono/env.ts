/**
 * @file   env.ts — Hono 全局类型定义
 * @desc   声明 Bindings（D1、JWT_SECRET）和 Variables（JWT 解码后的用户对象）
 */

import type { DrizzleD1Database } from 'drizzle-orm/d1'

/** JWT 解码后注入到 c.get('user') 的载荷结构 */
export interface UserPayload {
  id: number
  username: string
  role: 'staff' | 'manager' | 'superadmin'
  status: string
  group_id: number | null
}

/** Hono 应用环境类型，绑定 D1 数据库和 JWT 密钥 */
export type AppEnv = {
  Bindings: {
    DB: D1Database
    JWT_SECRET: string
    ENVIRONMENT: string
    FRONTEND_URL: string
  }
  Variables: {
    user: UserPayload
    db: DrizzleD1Database<any> // TODO: 传递精确的 schema type 更佳，此处暂时 any 放宽
    page_info: { page: number; size: number; offset: number }
  }
}

