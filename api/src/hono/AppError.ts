/**
 * @file   AppError.ts — 业务异常类
 * @desc   继承 Error，携带 code（错误码），
 *         在全局 onError 中被捕获并转为标准 JSON 响应（HTTP 200）
 */
import { ErrorMsg } from '@/codes'

export class AppError extends Error {
  constructor(
    public code: number,
    message?: string,
  ) {
    super(message || ErrorMsg[code] || 'Unknown error')
  }
}
