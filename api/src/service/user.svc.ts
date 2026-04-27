/**
 * @file   services/userService.ts — 用户管理业务逻辑层
 * @desc   调用 UserDao / ContactDao 完成用户 CRUD 及关联操作
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { UserDao } from '@/dao/user.dao'
import { ContactDao } from '@/dao/contact.dao'
import { hashPassword } from '@/service/auth.svc'
import { ErrorCode } from '@/codes'
import { AppError } from '@/hono/AppError'
import { audit } from '@/utility/audit'
import type { CreateUserInput } from '@/model/user.dto'

type DB = DrizzleD1Database<any>

export const UserService = {
  async list(db: DB, viewer: { role: string; group_id: number | null }) {
    if (viewer.role === 'superadmin') {
      return UserDao.listAll(db)
    }
    return UserDao.listByGroup(db, viewer.group_id as number)
  },

  async create(db: DB, data: CreateUserInput, viewer: { id: number; group_id: number | null }) {
    const _existing = await UserDao.findByUsername(db, data.username)
    if (_existing) throw new AppError(ErrorCode.USERNAME_EXISTS)

    const _hashed = await hashPassword(data.password)
    const _result = await UserDao.insert(db, {
      username: data.username,
      password: _hashed,
      role: data.role,
      group_id: data.group_id ?? viewer.group_id,
      created_by: viewer.id,
    })
    return { id: _result[0].id }
  },

  async setStatus(db: DB, targetId: number, status: 'active' | 'disabled', viewer: { id: number; role: string; group_id: number | null }) {
    const _target = await UserDao.findById(db, targetId)
    if (!_target) throw new AppError(ErrorCode.NOT_FOUND)

    if (viewer.role === 'manager' && _target.group_id !== viewer.group_id) {
      throw new AppError(ErrorCode.FORBIDDEN)
    }

    if (status === 'disabled' && targetId === viewer.id) {
      throw new AppError(ErrorCode.FORBIDDEN, '不能封禁自己的账号')
    }

    await UserDao.updateStatus(db, targetId, status)

    // 禁用联动：释放私海资源
    if (status === 'disabled') {
      await ContactDao.releaseByOwner(db, targetId)
      await audit(db, viewer.id, 'disable_user', { target_id: targetId })
    }

    return { id: targetId, status }
  },

  async setRole(db: DB, targetId: number, role: string) {
    await UserDao.updateRole(db, targetId, role)
    return { id: targetId, role }
  },

  async setGroup(db: DB, targetId: number, groupId: number) {
    await UserDao.updateGroup(db, targetId, groupId)
    return { id: targetId, group_id: groupId }
  },

  async resetPassword(db: DB, targetId: number, newPasswordRaw: string, viewer: { id: number; role: string; group_id: number | null }) {
    const _target = await UserDao.findById(db, targetId)
    if (!_target) throw new AppError(ErrorCode.NOT_FOUND)

    if (viewer.role === 'manager' && _target.group_id !== viewer.group_id) {
      throw new AppError(ErrorCode.FORBIDDEN)
    }

    const _hashed = await hashPassword(newPasswordRaw)
    await UserDao.updatePassword(db, targetId, _hashed)
    await audit(db, viewer.id, 'reset_password', { target_id: targetId })

    return { id: targetId }
  },
}
