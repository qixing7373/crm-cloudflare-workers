/**
 * @file   mask.ts — 敏感信息脱敏工具
 * @desc   maskPhone / maskEmail 基础脱敏；maskContact 按角色+归属关系决定是否脱敏
 * @rule   未开发资源、本人资源、超管查看 → 不脱敏；其余 → phone/email/social 全部掩码
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return '***'
  return phone.slice(0, 4) + '****' + phone.slice(-4)
}

export function maskEmail(email: string): string {
  if (!email) return '***'
  const _at = email.indexOf('@')
  if (_at < 1) return '***'
  return email[0] + '***' + email.slice(_at)
}

export interface ContactRow {
  phone: string | null
  status: string
  owner_id: number | null
  data: string
}

export interface Viewer {
  id: number
  role: string
}

export function maskContact(row: ContactRow, viewer: Viewer): ContactRow & { _is_masked: boolean; _private_owner?: number | null } {
  if (row.status === 'undeveloped' || row.owner_id === viewer.id || viewer.role === 'superadmin') {
    return { ...row, _is_masked: false }
  }
  const _data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
  const _masked_data: Record<string, any> = {}
  for (const [_k, _v] of Object.entries(_data)) {
    if (_k === 'email') _masked_data[_k] = maskEmail(_v as string)
    else if (_k === 'social') _masked_data[_k] = '***'
    else _masked_data[_k] = _v
  }
  return {
    ...row,
    phone: row.phone ? maskPhone(row.phone) : null,
    data: JSON.stringify(_masked_data),
    _is_masked: true,
    _private_owner: row.owner_id,
  }
}
