import type { AppEnv } from '@/hono/env'
import { Hono } from 'hono'
import { requireRole } from '@/middleware/role.mid'
import { success, fail, paginate } from '@/hono/response'
import { ErrorCode } from '@/codes'
import { getHistory, getDetail, syncImport } from '@/service/import.svc'

const importRouter = new Hono<AppEnv>()

// ── POST /import/sync ── 分片同步入库（新架构：分类 + 入库一体化）

importRouter.post('/sync', requireRole('manager'), async (c) => {
  const _viewer = c.get('user')
  const { clean_list, file_name, file_hash, import_id } = await c.req.json() as {
    clean_list: Array<{ phone: string; data: Record<string, unknown> }>
    file_name: string
    file_hash: string
    import_id?: number
  }

  if (!clean_list || clean_list.length === 0 || !file_name) {
    return fail(c, ErrorCode.UNSUPPORTED_FORMAT)
  }

  try {
    const _result = await syncImport(clean_list, user_id, db, file_name, file_hash, import_id)
    return success(c, _result)
  } catch (_error: any) {
    console.error('[API /sync] CRASH:', _error)
    return fail(c, ErrorCode.INTERNAL_ERROR)
  }
})

// ── GET /import/verify-hash?hash=... ── 校验哈希
importRouter.get('/verify-hash', requireRole('manager'), async (c) => {
  const hash = c.req.query('hash')
  if (!hash) return fail(c, ErrorCode.BAD_REQUEST)
  
  const _db = c.get('db')
  const { importLog } = await import('@/schema')
  const { eq } = await import('drizzle-orm')
  
  const existing = await _db.select({ id: importLog.id })
    .from(importLog)
    .where(eq(importLog.file_hash, hash))
    .limit(1)
    .get()

  return success(c, { exists: !!existing })
})

// ── GET /import/history ── 导入历史

importRouter.get('/history', requireRole('manager'), async (c) => {
  const _db = c.get('db')
  const { page: _page, size: _size, offset: _offset } = c.get('page_info')
  const _q = c.req.query('q') || ''

  const { list, total } = await getHistory(_db, { offset: _offset, size: _size, q: _q || undefined })
  return paginate(c, list, total, _page, _size)
})

// ── GET /import/:id ── 单批次明细

importRouter.get('/:id', requireRole('manager'), async (c) => {
  const _id = Number(c.req.param('id'))
  const _db = c.get('db')

  const _result = await getDetail(_db, _id)
  if (!_result) return fail(c, ErrorCode.PHONE_NOT_FOUND)

  return success(c, _result)
})

export default importRouter
