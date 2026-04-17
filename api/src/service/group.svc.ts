/**
 * @file   services/groupService.ts — 用户分组业务逻辑层
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { GroupDao } from '@/dao/user_group.dao'
import { ErrorCode } from '@/codes'
import { AppError } from '@/hono/AppError'
import { audit } from '@/utility/audit'
import type { CreateGroupInput } from '@/model/group.dto'

type DB = DrizzleD1Database<any>

export const GroupService = {
  async list(db: DB) {
    return GroupDao.listWithMemberCount(db)
  },

  async create(db: DB, data: CreateGroupInput) {
    const _existing = await GroupDao.findByName(db, data.name)
    if (_existing) throw new AppError(ErrorCode.BAD_REQUEST, 'Group name already exists')

    const _result = await GroupDao.insert(db, data.name)
    return _result[0]
  },

  async update(db: DB, id: number, data: CreateGroupInput) {
    await GroupDao.updateName(db, id, data.name)
    return { id, name: data.name }
  },

  async delete(db: DB, id: number, viewerId: number) {
    const _count = await GroupDao.countMembers(db, id)
    if (_count > 0) throw new AppError(ErrorCode.FORBIDDEN)

    await GroupDao.deleteById(db, id)
    await audit(db, viewerId, 'delete_group', { group_id: id })
  },
}
