import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const contactLog = sqliteTable('contact_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contact_id: integer('contact_id').notNull(),
  user_id: integer('user_id').notNull(),
  import_id: integer('import_id'),
  type: text('type', {
    enum: ['create', 'update', 'reimport', 'frozen_import'],
  }).notNull(),
  changes: text('changes'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export type ContactLogEntity = typeof contactLog.$inferSelect
export type ContactLogDo = Partial<typeof contactLog.$inferInsert>
