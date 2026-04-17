/**
 * @file   model/group.dto.ts — 用户分组模块 Zod Schema
 */
import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(50),
})
export type CreateGroupInput = z.infer<typeof createGroupSchema>
