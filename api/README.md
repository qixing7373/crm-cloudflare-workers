# CRM API

Cloudflare Workers 后端，基于 Hono、Drizzle ORM、D1 和 Bun。

## 命令

```bash
bun install
bun test
bunx tsc --noEmit --pretty false
bun run dev
bun run deploy
```

## 数据库

```bash
bun run db:generate
bunx wrangler d1 migrations apply crm-api --local
bunx wrangler d1 execute crm-api --local --file src/seed.sql
```

远程：

```bash
bunx wrangler d1 migrations apply crm-api --remote
bunx wrangler d1 execute crm-api --remote --file src/seed.sql
```

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DB` | 是 | D1 绑定 |
| `JWT_SECRET` | 是 | JWT HMAC 密钥 |
| `FRONTEND_URL` | 是 | 允许跨域的前端域名，多个用逗号分隔 |
| `ENVIRONMENT` | 否 | 运行环境 |
| `RATE_LIMIT_PER_MINUTE` | 否 | 单客户端每分钟请求上限 |
| `RATE_LIMIT_WINDOW_SECONDS` | 否 | 限流窗口秒数 |

## 路由

- `/auth/*`：登录、注册、token 校验、修改密码。
- `/api/contact/*`：联系人搜索、认领、跟进、转移、删除。
- `/api/import/*`：Hash 校验、分片同步、导入历史、明细。
- `/api/stat/*`：个人、团队、全局统计。
- `/api/log/*`：用户操作日志和联系人日志。
- `/api/user/*`：用户管理。
- `/api/group/*`：组织管理。
- `/api/field/*`：动态字段配置。
- `/api/export/*`：导出。
- `/api/invite/*`：邀请码。

## 批量导入

当前只支持 `/api/import/sync` 分片同步。前端负责解析原始文件，后端只接收清洗后的 `clean_list`。

默认分片为 `200`，写入子批量为 `25`。未传 `status` 的导入行按 `undeveloped` 处理，`developed` 会自动归属当前导入用户。

## 测试

```bash
bun test
```

测试使用内存 SQLite 适配 D1 接口，覆盖服务层、路由集成、导入、权限、安全边界和 E2E 工作流。
