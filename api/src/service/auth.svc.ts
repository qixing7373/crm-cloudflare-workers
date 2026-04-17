/**
 * @file   authService.ts — 认证服务
 * @desc   密码哈希（bcrypt）、密码校验、JWT 签发（HMAC-SHA256）、密码复杂度检查
 * @security 使用 Web Crypto API 签发 JWT，兼容 Workers 环境（不依赖 jsonwebtoken）
 */
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { UserDao } from '@/dao/user.dao'
import { TOKEN_LIFE } from '@/consts'
import { ErrorCode } from '@/codes'
import { AppError } from '@/hono/AppError'
import { resolveInviteCode } from '@/utility/inviteCode'
import { audit } from '@/utility/audit'
import type { RegisterInput, LoginInput } from '@/model/auth.dto'

export async function hashPassword(plain: string): Promise<string> {
  const { hash } = await import('bcryptjs')
  return hash(plain, 10)
}

export async function checkPassword(plain: string, hashed: string): Promise<boolean> {
  const { compare } = await import('bcryptjs')
  return compare(plain, hashed)
}

export async function makeToken(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const _header = { alg: 'HS256', typ: 'JWT' }
  const _payload = { ...payload, exp: Math.floor(Date.now() / 1000) + TOKEN_LIFE }

  const _encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const _header_b64 = _encode(_header)
  const _payload_b64 = _encode(_payload)
  const _data = new TextEncoder().encode(`${_header_b64}.${_payload_b64}`)

  const _key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const _sig = await crypto.subtle.sign('HMAC', _key, _data)
  const _sig_b64 = btoa(String.fromCharCode(...new Uint8Array(_sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  return `${_header_b64}.${_payload_b64}.${_sig_b64}`
}

export function checkPasswordComplexity(pwd: string): boolean {
  return (
    pwd.length >= 8 &&
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /[0-9]/.test(pwd)
  )
}

// ── 业务流程 ──

export async function registerUser(
  params: RegisterInput,
  db: DrizzleD1Database<any>,
  secret: string
) {
  if (!checkPasswordComplexity(params.password)) {
    throw new AppError(ErrorCode.WEAK_PASSWORD)
  }

  const _existing = await UserDao.findByUsername(db, params.username)
  if (_existing) {
    throw new AppError(ErrorCode.USERNAME_EXISTS)
  }

  // O(1) 反解邀请码 → 直接得到 inviter user_id
  const _inviter_id = await resolveInviteCode(params.invite_code, secret)
  if (!_inviter_id) {
    throw new AppError(ErrorCode.INVALID_INVITE_CODE)
  }

  // 验证该用户是 active 的 manager/superadmin
  const _inviter = await UserDao.findActiveInviter(db, _inviter_id)
  if (!_inviter) {
    throw new AppError(ErrorCode.INVALID_INVITE_CODE)
  }

  const _hashed = await hashPassword(params.password)
  const _result = await UserDao.insert(db, {
    username: params.username,
    password: _hashed,
    group_id: _inviter.group_id,
    created_by: _inviter.id,
  })

  const _new_id = _result[0].id

  // 审计日志
  await audit(db, _new_id, 'login', { action: 'register', inviter_id: _inviter.id, group_id: _inviter.group_id })

  return { id: _new_id, username: params.username, status: 'active', group_id: _inviter.group_id }
}

export async function loginUser(
  params: LoginInput,
  db: DrizzleD1Database<any>,
  secret: string,
  clientIp: string
) {
  const _user = await UserDao.findByUsername(db, params.username)
  if (!_user) {
    throw new AppError(ErrorCode.INVALID_CREDENTIALS)
  }

  if (_user.status === 'disabled') {
    throw new AppError(ErrorCode.ACCOUNT_DISABLED)
  }

  const _valid = await checkPassword(params.password, _user.password)
  if (!_valid) {
    throw new AppError(ErrorCode.INVALID_CREDENTIALS)
  }

  const _token = await makeToken(
    { id: _user.id, username: _user.username, role: _user.role, status: _user.status, group_id: _user.group_id },
    secret,
  )

  // 审计日志
  await audit(db, _user.id, 'login', { ip: clientIp })

  return {
    token: _token,
    user: { id: _user.id, username: _user.username, role: _user.role },
  }
}

export async function changePassword(
  db: DrizzleD1Database<any>,
  userId: number,
  old_pwd: string,
  new_pwd: string
) {
  const _user = await UserDao.findById(db, userId)
  if (!_user) throw new AppError(ErrorCode.NOT_FOUND)

  const _valid = await checkPassword(old_pwd, _user.password)
  if (!_valid) throw new AppError(ErrorCode.INVALID_CREDENTIALS, '原密码不正确')

  if (!checkPasswordComplexity(new_pwd)) {
    throw new AppError(ErrorCode.WEAK_PASSWORD, '新密码必须包含大小写字母和数字，且至少8位')
  }

  const _hashed = await hashPassword(new_pwd)
  await UserDao.updatePassword(db, userId, _hashed)

  await audit(db, userId, 'reset_password', { action: 'self_change' })
  return { id: userId }
}
