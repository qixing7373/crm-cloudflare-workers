/**
 * @file   dao/import.dao.ts — 导入记录表数据访问层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, desc, sql, like, or, getTableColumns } from 'drizzle-orm'
import { importLog, contactLog, user, userLog } from '@/schema'
import type { ImportLogDo } from '@/model/entity/import_log'
import type { UserLogDo } from '@/model/entity/user_log'

type DB = DrizzleD1Database<any>

export const ImportDao = {
  async insertLog(db: DB, data: ImportLogDo) {
    return db.insert(importLog).values(data as any).returning({ id: importLog.id })
  },

  async incrementLogCounters(db: DB, id: number, increments: { total: number, added: number, updated: number, skipped: number, frozen: number }) {
    return db.update(importLog)
      .set({
        total: sql`total + ${increments.total}`,
        added: sql`added + ${increments.added}`,
        updated: sql`updated + ${increments.updated}`,
        skipped: sql`skipped + ${increments.skipped}`,
        frozen: sql`frozen + ${increments.frozen}`
      })
      .where(eq(importLog.id, id))
  },

  async insertUserLog(db: DB, data: UserLogDo) {
    return db.insert(userLog).values(data as any)
  },

  async findLogById(db: DB, id: number) {
    return db.select().from(importLog).where(eq(importLog.id, id)).get()
  },

  async listHistory(db: DB, opts: { offset: number; size: number; q?: string }) {
    let _condition = undefined
    if (opts.q) {
      _condition = or(
        like(importLog.file, `%${opts.q}%`),
        like(user.username, `%${opts.q}%`),
      )
    }

    const [_total, _list] = await Promise.all([
      db.select({ cnt: sql<number>`COUNT(*)` })
        .from(importLog)
        .leftJoin(user, eq(importLog.user_id, user.id))
        .where(_condition)
        .get(),
      db.select({
        ...getTableColumns(importLog),
        username: user.username,
      }).from(importLog)
        .leftJoin(user, eq(importLog.user_id, user.id))
        .where(_condition)
        .limit(opts.size).offset(opts.offset)
        .orderBy(desc(importLog.id))
        .all()
    ])

    return { list: _list, total: _total?.cnt || 0 }
  },

  async listDetailsByImportId(db: DB, importId: number) {
    return db.select().from(contactLog)
      .where(eq(contactLog.import_id, importId))
      .orderBy(desc(contactLog.id))
      .all()
  },
}
