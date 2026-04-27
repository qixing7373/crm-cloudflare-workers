/**
 * @file   contactService.ts — 联系人资源业务逻辑层
 * @desc   认领、撤销、转移、删除等核心业务封装，调用 DAO 层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { ContactDao, ContactLogDao } from '@/dao/contact.dao'
import { ErrorCode } from '@/codes'
import { AppError } from '@/hono/AppError'
import { audit } from '@/utility/audit'
import { maskContact } from '@/utility/mask'
import type { TransferInput } from '@/model/contact.dto'

type DB = DrizzleD1Database<any>

export const ContactService = {
  async list(db: DB, viewer: any, opts: {
    offset: number; size: number;
    status?: string; q?: string; tailOnly?: boolean;
  }) {
    const _opts: any = { ...opts }
    if (viewer.role === 'staff') {
      _opts.owner_id = viewer.id
    }
    return ContactDao.listPaginated(db, _opts)
  },

  async search(db: DB, q: string, tailOnly: boolean, viewer: { id: number; role: string; owner_id?: number }) {
    const _results = await ContactDao.search(db, q, tailOnly)
    await audit(db, viewer.id, 'search', { query: q, result_count: _results.length })

    if (_results.length === 0) throw new AppError(ErrorCode.PHONE_NOT_FOUND)

    return _results.map((_r) => maskContact(_r, viewer))
  },

  async detail(db: DB, id: number, viewer: any) {
    const _row = await ContactDao.findById(db, id)
    if (!_row) throw new AppError(ErrorCode.PHONE_NOT_FOUND)
    return maskContact(_row, viewer)
  },

  async claim(
    params: { phone: string; data?: Record<string, unknown> },
    viewerId: number,
    db: DB,
  ) {
    const { phone, data } = params
    const _existing = await ContactDao.findByPhone(db, phone)

    if (!_existing) {
      // 新建并认领
      try {
        const _result = await ContactDao.insert(db, {
          phone,
          data: JSON.stringify(data || {}),
          status: 'developed',
          owner_id: viewerId,
          claimed_at: new Date(),
        })

        const logPromise = ContactLogDao.insert(db, {
          contact_id: _result[0].id,
          user_id: viewerId,
          import_id: null,
          type: 'create',
        })
        const auditPromise = audit(db, viewerId, 'claim', { phone, contact_id: _result[0].id })

        await Promise.all([logPromise, auditPromise])
        return { id: _result[0].id, phone, status: 'developed' }
      } catch (e: any) {
        if (e.message?.includes('UNIQUE constraint failed: contact.phone') || e.message?.includes('D1_ERROR')) {
          throw new AppError(ErrorCode.COLLISION_DETECTED)
        }
        throw e
      }
    }

    if (_existing.status === 'developed') {
      throw new AppError(ErrorCode.COLLISION_DETECTED)
    }

    // 乐观锁抢占 undeveloped
    const _update = await ContactDao.claimOptimistic(db, _existing.id, viewerId)
    if (_update.length === 0) {
      throw new AppError(ErrorCode.COLLISION_DETECTED)
    }

    await audit(db, viewerId, 'claim', { phone, contact_id: _existing.id })
    return { id: _existing.id, phone, status: 'developed' }
  },

  async update(db: DB, id: number, data: any, viewerId: number) {
    const _old = await ContactDao.findById(db, id)
    if (!_old) throw new AppError(ErrorCode.PHONE_NOT_FOUND, 'Contact not found')
    
    let _merged_data = _old.data
    if (data.data) {
      const _oldPayload = typeof _old.data === 'string' ? JSON.parse(_old.data) : (_old.data || {})
      _merged_data = JSON.stringify({ ..._oldPayload, ...data.data })
    }
    
    const _updatePayload: any = {
      updated_at: new Date(),
      updated_by: viewerId
    }
    if (data.status) _updatePayload.status = data.status
    if (data.phone) _updatePayload.phone = data.phone
    if (data.data) _updatePayload.data = _merged_data

    await ContactDao.update(db, id, _updatePayload)
    await audit(db, viewerId, 'update', { contact_id: id })
    
    return { id }
  },

  async revoke(db: DB, contactId: number, viewerId: number) {
    const _row = await ContactDao.findById(db, contactId)
    if (!_row) throw new AppError(ErrorCode.PHONE_NOT_FOUND)

    await ContactDao.revoke(db, contactId)
    await audit(db, viewerId, 'revoke', { contact_id: contactId, prev_owner_id: _row.owner_id })
    return { id: contactId, status: 'undeveloped' }
  },

  async transfer(db: DB, data: TransferInput, viewerId: number) {
    await ContactDao.transferOwnership(db, data.from_user_id, data.to_user_id, data.scope)
    await audit(db, viewerId, 'transfer', { ...data })
  },

  async delete(db: DB, contactId: number, viewerId: number) {
    await ContactDao.softDelete(db, contactId)
    await audit(db, viewerId, 'delete_contact', { contact_id: contactId })
  },
}
