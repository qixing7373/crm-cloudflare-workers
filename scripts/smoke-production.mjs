#!/usr/bin/env bun

const baseUrl = (process.env.API_BASE_URL || '').replace(/\/+$/, '')
const username = process.env.SMOKE_USERNAME
const password = process.env.SMOKE_PASSWORD

if (!baseUrl) {
  console.error('缺少 API_BASE_URL，例如：API_BASE_URL=https://crm-api.example.workers.dev bun scripts/smoke-production.mjs')
  process.exit(1)
}

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json) throw new Error(`${path} HTTP ${res.status}`)
  if (json.code < 0) throw new Error(`${path} code=${json.code} msg=${json.msg}`)
  return json
}

const health = await request('/')
if (!health.data?.db) throw new Error('D1 健康检查失败')
console.log('OK / health db=true')

if (username && password) {
  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  const token = login.data?.token
  if (!token) throw new Error('登录未返回 token')
  console.log(`OK /auth/login user=${login.data.user.username}`)

  await request('/auth/check', {
    headers: { Authorization: `Bearer ${token}` }
  })
  console.log('OK /auth/check')

  await request('/api/stat/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
  console.log('OK /api/stat/me')
} else {
  console.log('SKIP auth smoke: 未设置 SMOKE_USERNAME/SMOKE_PASSWORD')
}
