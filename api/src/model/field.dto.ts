/**
 * @file   model/field.dto.ts — 字段配置模块 Zod Schema
 */
import { z } from 'zod'

export const createFieldSchema = z.object({
  key: z.string().trim().min(1).max(50).regex(/^[a-z_]+$/),
  label: z.string().trim().min(1).max(50),
  label_en: z.string().trim().optional(),
  type: z.enum(['text', 'number', 'select', 'phone', 'date', 'boolean']).default('text'),
  options: z.string().trim().optional(),
  required: z.boolean().default(false),
  editable: z.boolean().default(true),
})
export type CreateFieldInput = z.infer<typeof createFieldSchema>

export const updateFieldSchema = z.object({
  label: z.string().trim().min(1).max(50).optional(),
  label_en: z.string().trim().nullable().optional(),
  type: z.enum(['text', 'number', 'select', 'phone', 'date', 'boolean']).optional(),
  options: z.string().trim().nullable().optional(),
  required: z.boolean().optional(),
  editable: z.boolean().optional(),
  enabled: z.boolean().optional(),
})
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>

export const sortFieldSchema = z.object({
  ids: z.array(z.number()),
})
export type SortFieldInput = z.infer<typeof sortFieldSchema>
