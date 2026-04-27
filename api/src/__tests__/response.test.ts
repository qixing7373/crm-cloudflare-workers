/**
 * @file   response.test.ts — 响应工具函数测试
 */
import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'

describe('response helpers', () => {
  it('success 返回 code=1', async () => {
    const { success } = await import('../hono/response')
    const _app = new Hono()
    _app.get('/ok', (c) => success(c, { id: 1 }))
    const _res = await _app.request('/ok')
    expect(_res.status).toBe(200)
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.msg).toBe('success')
    expect(_json.data.id).toBe(1)
  })

  it('fail 返回错误码 + 对应消息', async () => {
    const { fail } = await import('../hono/response')
    const { ErrorCode } = await import('@/codes')
    const _app = new Hono()
    _app.get('/err', (c) => fail(c, ErrorCode.PHONE_NOT_FOUND))
    const _res = await _app.request('/err')
    expect(_res.status).toBe(200)
    const _json = await _res.json() as any
    expect(_json.code).toBe(-200)
    expect(_json.msg).toBe('Phone number not found')
    expect(_json.data).toBeNull()
  })

  it('fail 未知错误码返回 Unknown error', async () => {
    const { fail } = await import('../hono/response')
    const _app = new Hono()
    _app.get('/err', (c) => fail(c, -999))
    const _res = await _app.request('/err')
    const _json = await _res.json() as any
    expect(_json.msg).toBe('Unknown error')
  })

  it('paginate 返回分页结构', async () => {
    const { paginate } = await import('../hono/response')
    const _app = new Hono()
    _app.get('/page', (c) => paginate(c, [{ id: 1 }, { id: 2 }], 100, 3, 20))
    const _res = await _app.request('/page')
    const _json = await _res.json() as any
    expect(_json.code).toBe(1)
    expect(_json.data.list.length).toBe(2)
    expect(_json.data.total_count).toBe(100)
    expect(_json.data.page_index).toBe(3)
    expect(_json.data.page_size).toBe(20)
  })
})
