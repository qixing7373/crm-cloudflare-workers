/**
 * @file   dropoff.ts — 定时资源释放（Cron 触发）
 * @desc   扫描已认领超过 PROTECT_DAYS 天的 developed 资源，将其释放回公海（undeveloped）
 *         由 Workers Scheduled Event 每日触发，通过 index.ts 的 scheduled() 调用
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { ContactDao, ContactLogDao } from '@/dao/contact.dao'
import { PROTECT_DAYS, SECONDS_PER_DAY } from '@/consts'

export async function runDropoff(db: DrizzleD1Database<any>) {
  const _cutoff = new Date(Date.now() - PROTECT_DAYS * SECONDS_PER_DAY * 1000)

  // 查询超期资源（通过 DAO）
  const _expired = await ContactDao.findExpiredDeveloped(db, _cutoff)

  if (_expired.length === 0) return { released: 0 }

  // 批量释放（通过 DAO）
  const BATCH_SIZE = 90
  for (let i = 0; i < _expired.length; i += BATCH_SIZE) {
    const _chunk = _expired.slice(i, i + BATCH_SIZE)
    const _ids = _chunk.map(r => r.id)

    await ContactDao.releaseByIds(db, _ids)

    // 批量插入审计日志（通过 DAO）
    const _logs = _chunk.map(_row => ({
      contact_id: _row.id,
      user_id: _row.owner_id || 0,
      import_id: null,
      type: 'update' as const,
      changes: JSON.stringify({ action: 'system_dropoff', prev_owner_id: _row.owner_id }),
    }))

    await ContactLogDao.insertBatch(db, _logs)
  }

  return { released: _expired.length }
}
