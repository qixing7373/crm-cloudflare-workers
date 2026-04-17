/**
 * @file   dao/log.dao.ts — 日志表数据访问层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, and, desc, sql } from 'drizzle-orm'
import { contactLog, userLog } from '@/schema'
import type { UserLogDo } from '@/model/entity/user_log'

type DB = DrizzleD1Database<any>

export const LogDao = {
  async insertUserLog(db: DB, data: UserLogDo) {
    return db.insert(userLog).values(data as any)
  },

  async listByContact(db: DB, contactId: number) {
    return db.select().from(contactLog)
      .where(eq(contactLog.contact_id, contactId))
      .orderBy(desc(contactLog.id))
      .all()
  },

  async listUserLogs(db: DB, opts: {
    offset: number; size: number;
    action?: string; userId?: number;
  }) {
    const _conds = [
      opts.action ? eq(userLog.action, opts.action as any) : undefined,
      opts.userId ? eq(userLog.user_id, opts.userId) : undefined,
    ].filter(Boolean)

    const _where = _conds.length ? and(..._conds as any[]) : undefined

    const [_total, _list] = await Promise.all([
      db.select({ cnt: sql<number>`COUNT(*)` }).from(userLog).where(_where).get(),
      db.select().from(userLog).where(_where)
        .limit(opts.size).offset(opts.offset)
        .orderBy(desc(userLog.id))
        .all()
    ])

    return { list: _list, total: _total?.cnt || 0 }
  },
}
