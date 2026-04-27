/**
 * @file   constants/index.ts — 全局业务常量
 * @desc   集中管理保护期天数、批量大小、令牌有效期、角色层级等运行时常量
 */
export const PROTECT_DAYS    = 90
export const BATCH_SIZE      = 100
export const TOKEN_LIFE      = 86400
export const MAX_IMPORT      = 100000
export const MAX_FILE_SIZE   = 20 * 1024 * 1024
export const INSERT_BATCH_SIZE = 10
export const PHONE_REGEX     = /^\+[1-9]\d{6,14}$/
export const SECONDS_PER_DAY = 86400

export const ROLE_LEVEL = {
  staff:      1,
  manager:    2,
  superadmin: 3,
} as const
