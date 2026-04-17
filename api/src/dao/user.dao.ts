/**
 * @file   dao/user.dao.ts — 用户表数据访问层
 * @desc   纯 CRUD 封装，不包含任何业务判断逻辑
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, and, inArray } from 'drizzle-orm'
import { user, userGroup } from '@/schema'
import type { UserDo } from '@/model/entity/user'

type DB = DrizzleD1Database<any>

export const UserDao = {
  async findById(db: DB, id: number) {
    return db.select().from(user).where(eq(user.id, id)).get()
  },

  async findByUsername(db: DB, username: string) {
    return db.select().from(user).where(eq(user.username, username)).get()
  },

  async findActiveInviter(db: DB, id: number) {
    return db.select({ id: user.id, group_id: user.group_id })
      .from(user)
      .where(and(
        eq(user.id, id),
        eq(user.status, 'active'),
        inArray(user.role, ['manager', 'superadmin']),
      ))
      .get()
  },

  async listAll(db: DB) {
    const _cols = {
      id: user.id, username: user.username, role: user.role,
      group_id: user.group_id, status: user.status, created_at: user.created_at,
      group_name: userGroup.name,
    }
    return db.select(_cols).from(user).leftJoin(userGroup, eq(user.group_id, userGroup.id)).all()
  },

  async listByGroup(db: DB, groupId: number) {
    const _cols = {
      id: user.id, username: user.username, role: user.role,
      group_id: user.group_id, status: user.status, created_at: user.created_at,
      group_name: userGroup.name,
    }
    return db.select(_cols).from(user).leftJoin(userGroup, eq(user.group_id, userGroup.id)).where(eq(user.group_id, groupId)).all()
  },

  async insert(db: DB, data: UserDo) {
    return db.insert(user).values(data as any).returning({ id: user.id })
  },

  async updateStatus(db: DB, id: number, status: 'active' | 'disabled') {
    return db.update(user).set({ status }).where(eq(user.id, id))
  },

  async updateRole(db: DB, id: number, role: string) {
    return db.update(user).set({ role: role as any }).where(eq(user.id, id))
  },

  async updateGroup(db: DB, id: number, groupId: number) {
    return db.update(user).set({ group_id: groupId }).where(eq(user.id, id))
  },

  async updatePassword(db: DB, id: number, passwordHash: string) {
    return db.update(user).set({ password: passwordHash }).where(eq(user.id, id))
  },
}
