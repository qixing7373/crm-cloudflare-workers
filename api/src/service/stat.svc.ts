/**
 * @file   service/statService.ts — 统计业务逻辑层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { ContactStatDao as StatDao } from '@/dao/contact.dao'

type DB = DrizzleD1Database<any>

export const StatService = {
  async getMyStats(db: DB, userId: number, month?: string) {
    const _count = await StatDao.countMyDeveloped(db, userId, month)
    return { user_id: userId, claimed_count: _count, month: month || 'all' }
  },

  async getGroupStats(db: DB) {
    return StatDao.groupByOwner(db)
  },

  async getOverview(db: DB) {
    return StatDao.overview(db)
  },
}
