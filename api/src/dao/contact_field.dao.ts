/**
 * @file   dao/field.dao.ts — 动态字段表数据访问层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { contactField } from '@/schema'
import type { ContactFieldDo } from '@/model/entity/contact_field'

type DB = DrizzleD1Database<any>

export const FieldDao = {
  async listAll(db: DB) {
    return db.select().from(contactField).orderBy(contactField.sort).all()
  },

  async listEnabled(db: DB) {
    return db.select().from(contactField).where(eq(contactField.enabled, true)).all()
  },

  async findByKey(db: DB, key: string) {
    return db.select().from(contactField).where(eq(contactField.key, key)).get()
  },

  async insert(db: DB, data: ContactFieldDo) {
    return db.insert(contactField).values(data as any).returning()
  },

  async updateById(db: DB, id: number, data: Record<string, any>) {
    return db.update(contactField).set(data).where(eq(contactField.id, id))
  },

  async updateSort(db: DB, id: number, sort: number, updatedBy: number) {
    return db.update(contactField)
      .set({ sort, updated_at: new Date(), updated_by: updatedBy })
      .where(eq(contactField.id, id))
  },

  async disable(db: DB, id: number) {
    return db.update(contactField).set({ enabled: false }).where(eq(contactField.id, id))
  },
}
