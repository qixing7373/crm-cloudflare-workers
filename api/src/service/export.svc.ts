/**
 * @file   service/exportService.ts — 导出业务逻辑层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { ContactDao } from '@/dao/contact.dao'
import { audit } from '@/utility/audit'

type DB = DrizzleD1Database<any>

export const ExportService = {
  async exportContacts(db: DB, viewerId: number) {
    const _all = await ContactDao.listAll(db)
    await audit(db, viewerId, 'export', { count: _all.length })
    return _all
  },
}
