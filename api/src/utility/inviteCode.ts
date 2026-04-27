/**
 * @file   inviteCode.ts — 可逆邀请码工具（含 XOR 掩码保护）
 * @desc   码结构：base36(user_id ⊕ mask, 3位) + HMAC签名(3位) = 6 位大写字母数字
 *         mask 由 HMAC(secret, date) 派生，每天轮换
 *         没有 secret 无法从码中推导出 user_id
 *
 * @security
 *   - user_id 经 XOR 掩码混淆，外部无法通过码面反解出管理员 ID
 *   - 签名防伪造：篡改任意一位都会导致验签失败
 *   - 每日轮换：mask 和签名均含日期因子，昨日码今日失效
 */

/**
 * 生成邀请码
 */
export async function generateInviteCode(
  user_id: number,
  secret: string,
  date?: string,
): Promise<string> {
  const _date = date || _today()
  const _key = await _importKey(secret)
  
  const _mask = await _deriveMask(_key, _date)
  const _scrambled = (user_id ^ _mask) >>> 0
  const _id_part = _scrambled.toString(36).toUpperCase().padStart(3, '0').slice(-3)
  const _sig_part = await _sign(user_id, _key, _date)
  
  return _id_part + _sig_part
}

/**
 * 从邀请码反解出 user_id（O(1)，需 secret）
 * @returns user_id 或 null（无效/过期/伪造）
 */
export async function resolveInviteCode(
  code: string,
  secret: string,
  date?: string,
): Promise<number | null> {
  if (!code || code.length !== 6) return null

  const _upper = code.toUpperCase()
  const _id_part = _upper.slice(0, 3)
  const _sig_part = _upper.slice(3, 6)

  const _date = date || _today()
  const _key = await _importKey(secret)
  
  const _mask = await _deriveMask(_key, _date)
  const _scrambled = parseInt(_id_part, 36)
  if (isNaN(_scrambled)) return null

  const _user_id = (_scrambled ^ _mask) >>> 0
  if (_user_id <= 0 || _user_id > 46655) return null // base36 3位上限

  // 验签
  const _expected_sig = await _sign(_user_id, _key, _date)
  if (_sig_part !== _expected_sig) return null

  return _user_id
}

// ── 内部工具 ──

function _today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 从 CryptoKey + date 派生 XOR 掩码（3 字节 → 0~46655 范围） */
async function _deriveMask(key: CryptoKey, date: string): Promise<number> {
  const _sig = await crypto.subtle.sign(
    'HMAC', key,
    new TextEncoder().encode(`mask:${date}`),
  )
  const _bytes = new Uint8Array(_sig)
  // 取 3 字节，mod 46656 确保在 base36 3位范围内
  return ((_bytes[0] << 16 | _bytes[1] << 8 | _bytes[2]) >>> 0) % 46656
}

/** HMAC 签名 → 3 位 base36 */
async function _sign(user_id: number, key: CryptoKey, date: string): Promise<string> {
  const _sig = await crypto.subtle.sign(
    'HMAC', key,
    new TextEncoder().encode(`invite:${user_id}:${date}`),
  )
  const _bytes = new Uint8Array(_sig)
  const _num = (_bytes[0] << 16 | _bytes[1] << 8 | _bytes[2]) >>> 0
  return _num.toString(36).toUpperCase().padStart(4, '0').slice(0, 3)
}

async function _importKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}
