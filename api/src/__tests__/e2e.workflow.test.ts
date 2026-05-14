/**
 * @file   e2e.workflow.test.ts — 核心业务 E2E
 * @desc   通过 Workers 入口覆盖登录、搜索、认领、导入、权限、日志
 */
import { beforeAll, describe, expect, it } from 'bun:test'
import worker from '@/index'
import { createTestDB, TEST_SECRET, wrapAsD1 } from './helpers/d1'
import { hashPassword } from '@/service/auth.svc'

const BASE = 'http://crm.test'

describe('核心业务 E2E', () => {
  let env: {
    DB: D1Database
    JWT_SECRET: string
    FRONTEND_URL: string
    ENVIRONMENT: string
    RATE_LIMIT_PER_MINUTE?: string
  }
  let staffToken = ''
  let managerToken = ''

  async function request(path: string, init: RequestInit = {}) {
    const res = await worker.fetch(new Request(`${BASE}${path}`, init), env as any, {} as any)
    return res.json() as Promise<any>
  }

  beforeAll(async () => {
    const sqlite = createTestDB()
    const staffPwd = await hashPassword('Staff123')
    const managerPwd = await hashPassword('Manager123')
    const superPwd = await hashPassword('Admin123')

    sqlite.run(`INSERT INTO user_group (id, name) VALUES (1, '销售一部')`)
    sqlite.run(
      `INSERT INTO user (id, username, password, role, group_id, status) VALUES
       (1, 'admin', ?, 'superadmin', 1, 'active'),
       (2, 'manager', ?, 'manager', 1, 'active'),
       (3, 'staff', ?, 'staff', 1, 'active')`,
      [superPwd, managerPwd, staffPwd]
    )
    sqlite.run(
      `INSERT INTO contact (id, phone, data, status, import_count) VALUES
       (10, '+8613800001111', '{"name":"待认领"}', 'undeveloped', 1)`
    )

    env = {
      DB: wrapAsD1(sqlite),
      JWT_SECRET: TEST_SECRET,
      FRONTEND_URL: 'http://localhost:7777',
      ENVIRONMENT: 'test'
    }
  })

  it('健康检查返回 D1 可用', async () => {
    const json = await request('/')
    expect(json.code).toBe(1)
    expect(json.data.db).toBe(true)
  })

  it('登录成功并返回 JWT', async () => {
    const staff = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '10.0.0.3' },
      body: JSON.stringify({ username: 'staff', password: 'Staff123' })
    })
    const manager = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '10.0.0.2' },
      body: JSON.stringify({ username: 'manager', password: 'Manager123' })
    })

    expect(staff.code).toBe(1)
    expect(manager.code).toBe(1)
    staffToken = staff.data.token
    managerToken = manager.data.token
  })

  it('搜索后可认领未开发客户', async () => {
    const auth = { Authorization: `Bearer ${staffToken}` }
    const searched = await request('/api/contact/search?q=13800001111', { headers: auth })
    expect(searched.code).toBe(1)
    expect(searched.data[0].status).toBe('undeveloped')

    const claimed = await request('/api/contact/claim', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+8613800001111' })
    })
    expect(claimed.code).toBe(1)
    expect(claimed.data.status).toBe('developed')
  })

  it('staff 无权查看导入历史，manager 可以导入并查看明细', async () => {
    const staffHistory = await request('/api/import/history', {
      headers: { Authorization: `Bearer ${staffToken}` }
    })
    expect(staffHistory.code).toBe(-400)

    const managerAuth = { Authorization: `Bearer ${managerToken}` }
    const synced = await request('/api/import/sync', {
      method: 'POST',
      headers: { ...managerAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_name: 'e2e.csv',
        file_hash: 'e2e-hash',
        clean_list: [
          { phone: '+8613800002222', status: 'developed', data: { name: '已开发导入' } },
          { phone: '+8613800003333', data: { name: '普通导入' } }
        ]
      })
    })

    expect(synced.code).toBe(1)
    expect(synced.data.results.map((row: any) => row.type)).toEqual(['added', 'added'])

    const history = await request('/api/import/history', { headers: managerAuth })
    expect(history.code).toBe(1)
    expect(history.data.total_count).toBe(1)

    const detail = await request(`/api/import/${synced.data.import_id}`, { headers: managerAuth })
    expect(detail.code).toBe(1)
    expect(detail.data.details).toHaveLength(2)
    expect(detail.data.details.map((row: any) => row.phone).sort()).toEqual([
      '+8613800002222',
      '+8613800003333'
    ])
  })

  it('日志记录覆盖登录、搜索、认领、导入', async () => {
    const managerAuth = { Authorization: `Bearer ${managerToken}` }
    const logs = await request('/api/log?page=1&size=20', { headers: managerAuth })
    expect(logs.code).toBe(1)

    const actions = logs.data.list.map((row: any) => row.action)
    expect(actions).toContain('login')
    expect(actions).toContain('search')
    expect(actions).toContain('claim')
    expect(actions).toContain('import')

    const claimLogs = await request('/api/log?action=claim', { headers: managerAuth })
    expect(claimLogs.code).toBe(1)
    expect(claimLogs.data.list.every((row: any) => row.action === 'claim')).toBe(true)
  })
})
