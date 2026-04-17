import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const userLog = sqliteTable('user_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull(),
  action: text('action', {
    enum: [
      'login', 'search', 'claim', 'revoke', 'transfer',
      'delete_contact', 'export', 'update_config', 'disable_user',
      'import', 'update_field', 'delete_group',
    ],
  }).notNull(),
  details: text('details'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export type UserLogEntity = typeof userLog.$inferSelect
export type UserLogDo = Partial<typeof userLog.$inferInsert>
