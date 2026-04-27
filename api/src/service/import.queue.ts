import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle } from 'drizzle-orm/d1'
import { ContactDao, ContactLogDao } from '@/dao/contact.dao'
import { ImportDao } from '@/dao/import_log.dao'
import { diffRecord } from '@/utility/diffRecord'

export interface ImportQueueRow {
  phone: string
  data: Record<string, unknown>
}

export interface ImportQueueMessage {
  row: ImportQueueRow
  user_id: number
  import_id: number
}

const QUEUE_WRITE_BATCH_SIZE = 100

export async function processImportQueueMessages(
  rawMessages: ImportQueueMessage[],
  d1: D1Database
) {
  if (!rawMessages.length) return

  const db = drizzle(d1) as DrizzleD1Database<any>
  const now = new Date()

  let totalAdded = 0
  let totalUpdated = 0
  let totalSkipped = 0
  let totalFrozen = 0

  // 按 import_id 分组，避免不同导入任务混在一起更新统计
  const groupMap = new Map<number, ImportQueueMessage[]>()

  for (const msg of rawMessages) {
    const list = groupMap.get(msg.import_id) || []
    list.push(msg)
    groupMap.set(msg.import_id, list)
  }

  for (const [importId, messages] of groupMap.entries()) {
    const userId = messages[0].user_id
    const rows = messages.map((m) => m.row)
    const phones = rows.map((r) => r.phone)

    const existing = await ContactDao.findByPhones(db, phones)
    const existMap = new Map(existing.map((e) => [e.phone, e]))

    const toAdd: ImportQueueRow[] = []
    const toUpdate: Array<
      ImportQueueRow & {
        contact_id: number
        changes: Record<string, { old: unknown; new: unknown }>
      }
    > = []

    let added = 0
    let updated = 0
    let skipped = 0
    let frozen = 0

    for (const row of rows) {
      const old = existMap.get(row.phone)

      if (!old) {
        toAdd.push(row)
        added++
        continue
      }

      if (old.status === 'developed') {
        frozen++
        continue
      }

      const oldData =
        typeof old.data === 'string'
          ? JSON.parse(old.data)
          : old.data || {}

      const changes = diffRecord(oldData, row.data)

      if (Object.keys(changes).length > 0) {
        toUpdate.push({
          ...row,
          contact_id: old.id,
          changes,
        })
        updated++
      } else {
        skipped++
      }
    }

    // 新增联系人
    for (let i = 0; i < toAdd.length; i += QUEUE_WRITE_BATCH_SIZE) {
      const batch = toAdd.slice(i, i + QUEUE_WRITE_BATCH_SIZE)

      const contactValues = batch.map((row) => ({
        phone: row.phone,
        data: JSON.stringify(row.data),
        status: 'undeveloped' as const,
        import_count: 1,
        first_imported_at: now,
        latest_imported_at: now,
      }))

      const contactResults = await ContactDao.insertBatch(db, contactValues)

      if (contactResults.length) {
        await ContactLogDao.insertBatch(
          db,
          contactResults.map((c) => ({
            contact_id: c.id,
            user_id: userId,
            import_id: importId,
            type: 'create' as const,
          }))
        )
      }
    }

    // 更新联系人
    for (let i = 0; i < toUpdate.length; i += QUEUE_WRITE_BATCH_SIZE) {
      const batch = toUpdate.slice(i, i + QUEUE_WRITE_BATCH_SIZE)

      const updateQueries = batch.map((row) =>
        ContactDao.updateImportData(
          db,
          row.contact_id,
          JSON.stringify(row.data),
          now
        )
      )

      await db.batch(updateQueries as any)

      await ContactLogDao.insertBatch(
        db,
        batch.map((row) => ({
          contact_id: row.contact_id,
          user_id: userId,
          import_id: importId,
          type: 'update' as const,
          changes: JSON.stringify(row.changes),
        }))
      )
    }

    await ImportDao.incrementLogCounters(db, importId, {
      total: rows.length,
      added,
      updated,
      skipped,
      frozen,
    })

    totalAdded += added
    totalUpdated += updated
    totalSkipped += skipped
    totalFrozen += frozen
  }

  console.log('[IMPORT_QUEUE_DONE]', {
    total: rawMessages.length,
    added: totalAdded,
    updated: totalUpdated,
    skipped: totalSkipped,
    frozen: totalFrozen,
  })
}
