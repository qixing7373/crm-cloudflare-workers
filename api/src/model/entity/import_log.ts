import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const importLog = sqliteTable('import_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull(),
  file: text('file'),
  file_hash: text('file_hash'),
  total: integer('total').notNull(),
  frozen: integer('frozen').notNull(),
  skipped: integer('skipped').notNull().default(0),
  added: integer('added').notNull().default(0),
  updated: integer('updated').notNull().default(0),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export type ImportLogEntity = typeof importLog.$inferSelect
export type ImportLogDo = Partial<typeof importLog.$inferInsert>
