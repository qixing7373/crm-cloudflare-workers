import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const contact = sqliteTable('contact', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phone: text('phone').unique(),
  data: text('data').notNull().default('{}'),
  status: text('status', {
    enum: ['undeveloped', 'developed'],
  }).notNull().default('undeveloped'),
  owner_id: integer('owner_id'),
  claimed_at: integer('claimed_at', { mode: 'timestamp' }),
  import_count: integer('import_count').default(0),
  first_imported_at: integer('first_imported_at', { mode: 'timestamp' }),
  latest_imported_at: integer('latest_imported_at', { mode: 'timestamp' }),
  created_by: integer('created_by'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_by: integer('updated_by'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
})

export type ContactEntity = typeof contact.$inferSelect
export type ContactDo = Partial<typeof contact.$inferInsert>
