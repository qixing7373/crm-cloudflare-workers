/**
 * @file   drizzle.config.ts — Drizzle ORM 配置
 * @desc   指定 schema 路径和输出目录，驱动 D1 migration 生成
 * @usage  bunx drizzle-kit generate
 */
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
} satisfies Config
