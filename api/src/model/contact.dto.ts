/**
 * @file   model/contact.dto.ts — 联系人模块 Zod Schema
 */
import { z } from 'zod'

export const claimSchema = z.object({
  phone: z.string().trim().min(1),
  data: z.record(z.unknown()).optional(),
})
export type ClaimInput = z.infer<typeof claimSchema>

export const revokeSchema = z.object({
  confirm_word: z.string().trim(),
})
export type RevokeInput = z.infer<typeof revokeSchema>

export const transferSchema = z.object({
  from_user_id: z.number(),
  to_user_id: z.number(),
  scope: z.enum(['all', 'undeveloped']).default('all'),
})
export type TransferInput = z.infer<typeof transferSchema>

export const updateContactSchema = z.object({
  data: z.record(z.unknown()).optional(),
  status: z.enum(['undeveloped', 'developed']).optional(),
  phone: z.string().trim().optional(),
})
export type UpdateContactInput = z.infer<typeof updateContactSchema>
