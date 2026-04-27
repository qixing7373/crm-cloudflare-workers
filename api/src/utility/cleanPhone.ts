/**
 * @file   cleanPhone.ts — 手机号清洗器
 * @desc   去除非数字字符，自动补 '+' 国际前缀，用 PHONE_REGEX 校验格式
 * @return 合法号码返回 E.164 格式字符串，非法返回 null
 */
import { PHONE_REGEX } from '@/consts'

export function cleanPhone(raw_value: string): string | null {
  let _phone = raw_value.toString().trim()
  _phone = _phone.replace(/[^\d+]/g, '')
  if (_phone.length > 0 && !_phone.startsWith('+')) {
    _phone = '+' + _phone
  }
  return PHONE_REGEX.test(_phone) ? _phone : null
}
