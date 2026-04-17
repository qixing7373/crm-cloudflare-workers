/**
 * @file   response.ts — 统一响应工具
 * @desc   封装 success / fail / paginate 三种标准 JSON 响应格式
 *         所有路由必须使用这些函数返回数据，禁止直接 c.json()
 * @convention HTTP 状态码一律 200，业务状态通过 code 字段区分：
 *             code > 0 = 成功，code < 0 = 业务错误
 */
import type { Context } from 'hono'
import { ErrorMsg } from '@/codes'

export function success<T>(c: Context, data: T, customMsg?: string) {
  return c.json({ code: 1, msg: customMsg || 'success', data })
}

export function fail(c: Context, code: number, customMsg?: string) {
  return c.json({ code, msg: customMsg || ErrorMsg[code] || 'Unknown error', data: null })
}

export function paginate<T>(c: Context, list: T[], total_count: number, page: number, size: number) {
  return c.json({
    code: 1,
    msg: 'success',
    data: { list, total_count, page_index: page, page_size: size },
  })
}
