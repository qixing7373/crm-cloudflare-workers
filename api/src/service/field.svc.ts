/**
 * @file   services/fieldService.ts — 字段配置业务逻辑层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { FieldDao } from '@/dao/contact_field.dao'
import { ErrorCode } from '@/codes'
import { AppError } from '@/hono/AppError'
import { audit } from '@/utility/audit'
import type { CreateFieldInput, UpdateFieldInput } from '@/model/field.dto'

type DB = DrizzleD1Database<any>

export const FieldService = {
  async list(db: DB) {
    return FieldDao.listAll(db)
  },

  async create(db: DB, data: CreateFieldInput, viewerId: number) {
    const _existing = await FieldDao.findByKey(db, data.key)
    if (_existing) throw new AppError(ErrorCode.BAD_REQUEST, 'Field key already exists')

    const _result = await FieldDao.insert(db, data as any)
    await audit(db, viewerId, 'update_field', { action: 'create', key: data.key })
    return _result[0]
  },

  async update(db: DB, id: number, data: UpdateFieldInput, viewerId: number) {
    const _payload = {
      ...data,
      updated_at: new Date(),
      updated_by: viewerId,
    }
    await FieldDao.updateById(db, id, _payload)
    await audit(db, viewerId, 'update_field', { action: 'update', field_id: id })
    return { id }
  },

  async sort(db: DB, ids: number[], viewerId: number) {
    for (let i = 0; i < ids.length; i++) {
      await FieldDao.updateSort(db, ids[i], i, viewerId)
    }
  },

  async disable(db: DB, id: number, viewerId: number) {
    await FieldDao.disable(db, id)
    await audit(db, viewerId, 'update_field', { action: 'disable', field_id: id })
  },
}
