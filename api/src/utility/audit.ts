/**
 * @file   audit.ts — 审计日志快捷工具
 * @desc   封装 userLog INSERT，通过 LogDao 访问数据库
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { LogDao } from '@/dao/user_log.dao'

export async function audit(
  db: DrizzleD1Database<any>,
  userId: number,
  action: string,
  details: Record<string, unknown>,
) {
  await LogDao.insertUserLog(db, {
    user_id: userId,
    action: action as any,
    details: JSON.stringify(details),
  })
}
