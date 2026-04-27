/**
 * @file   model/auth.dto.ts — 认证模块 Zod Schema
 */
import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  invite_code: z.string().trim().length(6),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  username: z.string().trim(),
  password: z.string(),
})
export type LoginInput = z.infer<typeof loginSchema>

export const changePasswordSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(8)
})
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
