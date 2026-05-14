# CRM Web

Vue 3 前端，基于 Naive UI、Pinia、Vue Router、Rsbuild、Axios、ExcelJS 和浏览器 SQLite。

## 命令

```bash
bun install
bunx tsc --noEmit --pretty false
bun run dev
bun run build
```

开发服务默认端口 `7777`，代理：

- `/api` -> `http://127.0.0.1:8888`
- `/auth` -> `http://127.0.0.1:8888`

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `PUBLIC_API_URL` | 生产 API 地址，不设置时默认走同域 `/` |

## 页面

| 路由 | 说明 | 最低角色 |
| --- | --- | --- |
| `/search` | 客户搜索和认领 | staff |
| `/database` | 客户跟进库 | staff |
| `/stats` | 个人统计 | staff |
| `/teamstats` | 团队统计 | manager |
| `/import` | 数据导入和历史 | manager |
| `/users` | 用户管理 | manager |
| `/logs` | 系统日志 | manager |
| `/overview` | 全局概览 | superadmin |
| `/groups` | 组织管理 | superadmin |
| `/fields` | 字段配置 | superadmin |

## 批量导入

前端负责：

- 读取 Excel/CSV。
- 匹配动态字段。
- 清洗手机号。
- 识别普通/已开发状态。
- 写入本地 SQLite 队列。
- 按 `200` 条分片同步到 `/api/import/sync`。
- 展示同步进度、失败重试、导入历史和批次明细。

## 构建部署

```bash
PUBLIC_API_URL=https://<worker-domain>/ bun run build
```

Cloudflare Pages 输出目录为 `dist`。
