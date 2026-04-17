/**
 * @file   service/logService.ts — 日志业务逻辑层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { LogDao } from '@/dao/user_log.dao'

type DB = DrizzleD1Database<any>

export const LogService = {
  async listByContact(db: DB, contactId: number) {
    return LogDao.listByContact(db, contactId)
  },

  async listUserLogs(db: DB, opts: {
    offset: number; size: number;
    action?: string; userId?: number;
  }) {
    return LogDao.listUserLogs(db, opts)
  },
}
