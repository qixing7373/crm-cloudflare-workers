# CRM 当前执行计划

本文档记录当前代码真实状态和后续执行顺序。旧版设计中 `/import/upload`、`/import/confirm`、`/config`、标签、待审批用户等接口已经不再作为当前实现基线。

## 当前技术栈

- 后端：Cloudflare Workers + Hono + Drizzle ORM + D1 + Bun Test。
- 前端：Vue 3 + Naive UI + Pinia + Vue Router + Rsbuild。
- 导入架构：前端解析 Excel/CSV，本地 SQLite 队列分片，后端 `/api/import/sync` 直接分类并入库。
- 默认导入分片：`BATCH_SIZE = 200`，写入批量：`INSERT_BATCH_SIZE = 25`，最大文件：`20MB`。

## 已完成

- 基础登录、注册、JWT 校验、修改密码。
- 用户、组织、字段、联系人、导入、导出、统计、日志后端路由。
- 前端登录、注册、搜索、客户跟进、用户、组织、字段、导入页面。
- 批量导入支持普通状态和已开发状态；未填写状态时按普通未开发处理。
- 导入历史支持查看所有历史批次和单批次明细。
- 超级管理员和子管理员可查看所有导入历史。
- 后端单元测试覆盖认证、联系人、导入、字段、组织、用户、导出、安全边界和工具函数。

## 本轮待完成

1. 文档同步
   - 更新 API 文档、批量导入文档、前端方案、部署文档、`api/README.md`、`web/README.md`。
   - 删除或标记旧接口，避免后续按过期方案继续开发。

2. 前端真实缺口
   - 完成工作台 `Overview.vue`。
   - 完成个人统计 `Stats.vue`。
   - 完成团队统计 `TeamStats.vue`。
   - 完成系统日志 `Logs.vue`。

3. E2E 测试
   - 登录。
   - 搜索。
   - 认领。
   - 导入。
   - 权限。
   - 日志。

4. 部署和限流收尾
   - 明确 Cloudflare Workers / Pages 配置。
   - 明确 D1 初始化和迁移命令。
   - 增加生产 smoke 脚本。
   - 增加接口限流中间件和测试。

## 验收命令

```bash
cd api && bun test
cd api && bunx tsc --noEmit --pretty false
cd web && bunx tsc --noEmit --pretty false
cd web && bun run build
git diff --check
```

## 后续可选项

- 如需恢复标签功能，单独补表、DAO、API、前端筛选和测试。
- 如需恢复系统配置页，单独设计配置表和权限模型。
- 如需浏览器级 E2E，可在当前 API E2E 稳定后引入 Playwright。
