import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const contactField = sqliteTable('contact_field', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  label_en: text('label_en'),
  type: text('type', {
    enum: ['text', 'number', 'select', 'phone', 'date', 'boolean'],
  }).notNull().default('text'),
  options: text('options'),
  required: integer('required', { mode: 'boolean' }).default(false),
  editable: integer('editable', { mode: 'boolean' }).default(true),
  indexed: integer('indexed', { mode: 'boolean' }).default(false),
  sort: integer('sort').default(0),
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  created_by: integer('created_by'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_by: integer('updated_by'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
})

export type ContactFieldEntity = typeof contactField.$inferSelect
export type ContactFieldDo = Partial<typeof contactField.$inferInsert>
