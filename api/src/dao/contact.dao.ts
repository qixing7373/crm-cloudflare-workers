/**
 * @file   dao/contact.dao.ts — 联系人表数据访问层
 * @desc   纯 CRUD 封装，不包含任何业务判断逻辑
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, and, or, like, sql, desc, inArray, lte, gte, isNull } from 'drizzle-orm'
import { contact, contactLog } from '@/schema'
import type { ContactDo } from '@/model/entity/contact'
import type { ContactLogDo } from '@/model/entity/contact_log'

type DB = DrizzleD1Database<any>

export const ContactDao = {
  async findById(db: DB, id: number) {
    return db.select().from(contact).where(eq(contact.id, id)).get()
  },

  async findByPhone(db: DB, phone: string) {
    return db.select().from(contact).where(eq(contact.phone, phone)).get()
  },

  async listPaginated(db: DB, opts: {
    offset: number; size: number;
    status?: string; q?: string; tailOnly?: boolean;
    owner_id?: number;
  }) {
    const _conds: any[] = [isNull(contact.deleted_at)]
    if (opts.status) _conds.push(eq(contact.status, opts.status as any))
    if (opts.owner_id) _conds.push(eq(contact.owner_id, opts.owner_id))
    if (opts.q) {
      if (opts.tailOnly) {
        _conds.push(like(contact.phone, `%${opts.q}`))
      } else {
        _conds.push(or(
          like(contact.phone, `%${opts.q}%`),
          like(contact.data, `%${opts.q}%`),
        ))
      }
    }
    const _where = _conds.length ? (_conds.length === 1 ? _conds[0] : and(..._conds)) : undefined

    const [_total, _list] = await Promise.all([
      db.select({ cnt: sql<number>`COUNT(*)` }).from(contact).where(_where).get(),
      db.select().from(contact).where(_where)
        .limit(opts.size).offset(opts.offset)
        .orderBy(desc(contact.id))
        .all()
    ])

    return { list: _list, total: _total?.cnt || 0 }
  },

  async search(db: DB, q: string, tailOnly = false, limit = 20) {
    const _conds = [isNull(contact.deleted_at)]
    if (tailOnly) {
      _conds.push(like(contact.phone, `%${q}`))
    } else {
      _conds.push(or(
        like(contact.phone, `%${q}%`),
        like(contact.data, `%${q}%`),
      ) as any)
    }
    return db.select().from(contact).where(and(...(_conds as any[]))).limit(limit).all()
  },

  async insert(db: DB, data: ContactDo) {
    return db.insert(contact).values(data as any).returning({ id: contact.id })
  },

  async update(db: DB, id: number, data: ContactDo) {
    return db.update(contact).set(data as any).where(eq(contact.id, id))
  },

  async revoke(db: DB, id: number) {
    return db.update(contact)
      .set({ status: 'undeveloped', owner_id: null, claimed_at: null })
      .where(eq(contact.id, id))
  },

  async claimOptimistic(db: DB, id: number, ownerId: number) {
    return db.update(contact)
      .set({ status: 'developed', owner_id: ownerId, claimed_at: new Date() })
      .where(and(eq(contact.id, id), eq(contact.status, 'undeveloped')))
      .returning({ id: contact.id })
  },

  async transferOwnership(db: DB, fromUserId: number, toUserId: number, scope: 'all' | 'undeveloped') {
    const _conds = [eq(contact.owner_id, fromUserId)]
    if (scope === 'undeveloped') _conds.push(eq(contact.status, 'undeveloped'))
    return db.update(contact).set({ owner_id: toUserId }).where(and(..._conds))
  },

  async releaseByOwner(db: DB, ownerId: number) {
    return db.update(contact)
      .set({ status: 'undeveloped', owner_id: null, claimed_at: null })
      .where(and(eq(contact.owner_id, ownerId), eq(contact.status, 'developed')))
  },

  async softDelete(db: DB, id: number) {
    return db.update(contact).set({ deleted_at: new Date() }).where(eq(contact.id, id))
  },

  async listAll(db: DB) {
    return db.select().from(contact).all()
  },

  async findByPhones(db: DB, phones: string[]) {
    return db.select().from(contact).where(inArray(contact.phone, phones)).all()
  },

  async findExpiredDeveloped(db: DB, cutoff: Date) {
    return db.select({ id: contact.id, owner_id: contact.owner_id })
      .from(contact)
      .where(and(eq(contact.status, 'developed'), lte(contact.claimed_at, cutoff)))
      .all()
  },

  async releaseByIds(db: DB, ids: number[]) {
    return db.update(contact)
      .set({ status: 'undeveloped', owner_id: null, claimed_at: null })
      .where(inArray(contact.id, ids))
  },

  async insertBatch(db: DB, rows: Array<ContactDo>) {
    return db.insert(contact).values(rows as any).returning({ id: contact.id })
  },

  updateImportData(db: DB, id: number, data: string, now: Date) {
    return db.update(contact)
      .set({ data, import_count: sql`import_count + 1`, latest_imported_at: now })
      .where(eq(contact.id, id))
  },
}

export const ContactLogDao = {
  async insert(db: DB, data: ContactLogDo) {
    return db.insert(contactLog).values(data as any)
  },

  async insertBatch(db: DB, rows: Array<ContactLogDo>) {
    if (rows.length === 0) return
    return db.insert(contactLog).values(rows as any)
  },

  async listByContact(db: DB, contactId: number) {
    return db.select().from(contactLog)
      .where(eq(contactLog.contact_id, contactId))
      .orderBy(desc(contactLog.id))
      .all()
  },
}

// ── 统计聚合（contact 表的聚合查询，无独立表）──

export const ContactStatDao = {
  async countMyDeveloped(db: DB, ownerId: number, month?: string) {
    let _where: any = and(eq(contact.owner_id, ownerId), isNull(contact.deleted_at))
    if (month) {
      const _start = new Date(`${month}-01`)
      const _end = new Date(_start)
      _end.setMonth(_end.getMonth() + 1)
      _where = and(_where, gte(contact.claimed_at, _start), lte(contact.claimed_at, _end))
    }
    const _r = await db.select({ cnt: sql<number>`COUNT(*)` }).from(contact)
      .where(and(_where, eq(contact.status, 'developed')))
      .get()
    return _r?.cnt || 0
  },

  async groupByOwner(db: DB) {
    return db.select({
      user_id: contact.owner_id,
      count: sql<number>`COUNT(*)`,
    }).from(contact)
      .where(and(eq(contact.status, 'developed'), isNull(contact.deleted_at)))
      .groupBy(contact.owner_id)
      .all()
  },

  async overview(db: DB) {
    const _r = await db.select({
      total: sql<number>`COUNT(*)`,
      developed: sql<number>`SUM(CASE WHEN status='developed' THEN 1 ELSE 0 END)`,
      undeveloped: sql<number>`SUM(CASE WHEN status='undeveloped' THEN 1 ELSE 0 END)`,
    }).from(contact).where(isNull(contact.deleted_at)).get()

    const _total = _r?.total || 0
    const _developed = _r?.developed || 0
    const _undeveloped = _r?.undeveloped || 0

    return {
      total: _total,
      developed: _developed,
      undeveloped: _undeveloped,
      develop_rate: _total ? (_developed / _total * 100).toFixed(1) + '%' : '0%',
    }
  },
}
