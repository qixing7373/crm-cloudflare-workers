/**
 * @file   model/user.dto.ts — 用户管理模块 Zod Schema
 */
import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, '用户名只能由3-20位英文字母、数字、下划线组成'),
  password: z.string().min(8),
  role: z.enum(['staff', 'manager']).default('staff'),
  group_id: z.number().optional(),
})
export type CreateUserInput = z.infer<typeof createUserSchema>

export const statusSchema = z.object({
  status: z.enum(['active', 'disabled']),
})
export type StatusInput = z.infer<typeof statusSchema>

export const roleSchema = z.object({
  role: z.enum(['staff', 'manager', 'superadmin']),
})
export type RoleInput = z.infer<typeof roleSchema>

export const groupAssignSchema = z.object({
  group_id: z.number(),
})
export type GroupAssignInput = z.infer<typeof groupAssignSchema>

export const passwordResetSchema = z.object({
  password: z.string().min(8),
})
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
