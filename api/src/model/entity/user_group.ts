import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const userGroup = sqliteTable('user_group', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  created_by: integer('created_by'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_by: integer('updated_by'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
})

export type UserGroupEntity = typeof userGroup.$inferSelect
export type UserGroupDo = Partial<typeof userGroup.$inferInsert>
