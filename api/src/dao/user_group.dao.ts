/**
 * @file   dao/group.dao.ts — 用户分组表数据访问层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'
import { userGroup, user } from '@/schema'

type DB = DrizzleD1Database<any>

export const GroupDao = {
  async listWithMemberCount(db: DB) {
    return db.select({
      id: userGroup.id,
      name: userGroup.name,
      created_at: userGroup.created_at,
      member_count: sql<number>`(SELECT COUNT(*) FROM user WHERE user.group_id = user_group.id)`,
    }).from(userGroup).all()
  },

  async findByName(db: DB, name: string) {
    return db.select().from(userGroup).where(eq(userGroup.name, name)).get()
  },

  async insert(db: DB, name: string) {
    return db.insert(userGroup).values({ name }).returning()
  },

  async updateName(db: DB, id: number, name: string) {
    return db.update(userGroup).set({ name }).where(eq(userGroup.id, id))
  },

  async deleteById(db: DB, id: number) {
    return db.delete(userGroup).where(eq(userGroup.id, id))
  },

  async countMembers(db: DB, groupId: number) {
    const _r = await db.select({ cnt: sql<number>`COUNT(*)` }).from(user).where(eq(user.group_id, groupId)).get()
    return _r?.cnt || 0
  },
}
