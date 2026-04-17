import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', {
    enum: ['staff', 'manager', 'superadmin'],
  }).notNull().default('staff'),
  group_id: integer('group_id'),
  status: text('status', {
    enum: ['active', 'disabled'],
  }).notNull().default('active'),
  created_by: integer('created_by'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_by: integer('updated_by'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
})

export type UserEntity = typeof user.$inferSelect
export type UserDo = Partial<typeof user.$inferInsert>
