# CRM API — AI 编码自检提示词

> **用途**：每次 AI 辅助编码前，先阅读本文件，避免重复踩坑。
> **技术栈**：Hono + Drizzle ORM + D1 (SQLite) + Wrangler 4.x + Bun

---

## 一、Wrangler / esbuild 致命陷阱

### ❌ 禁止在 `wrangler.jsonc` 中使用 `alias` 映射 TypeScript 路径
```jsonc
// 绝对不要这样做！会导致 esbuild 无限循环，wrangler dev 永久挂起
{ "alias": { "@": "./src", "@shared": "./shared" } }
```
**正确做法**：只在 `tsconfig.json` 的 `paths` 中声明路径别名，Wrangler/esbuild 会自动识别。

### ❌ 禁止在 Workers 环境引入重量级 npm 包
- `xlsx` / `exceljs` 等包依赖 Node.js API，在 V8 isolate 中无法运行
- **正确做法**：CSV 用纯手写解析器(`utils/parseFile.ts`)，Excel 由前端转为 CSV 后上传

### 🔧 wrangler dev 挂起时的急救流程
```bash
killall -9 esbuild     # 清理僵尸 esbuild 进程
killall -9 wrangler
rm -rf .wrangler        # 清除本地缓存
bun run dev            # 重启
```

---

## 二、TypeScript 类型规范

### Hono 泛型
创建 Hono 实例时必须声明 `Variables` 类型，否则 `c.get('user')` 会报 `never` 类型错误：
```typescript
// ✅ 正确
new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string }; Variables: { user: any } }>()
// ❌ 错误 — c.get('user') 编译报错
new Hono<{ Bindings: { DB: D1Database; JWT_SECRET: string } }>()
```

### ArrayBuffer vs ArrayBufferLike
`Uint8Array.buffer` 返回的是 `ArrayBufferLike`，传给接受 `ArrayBuffer` 的函数时需显式断言：
```typescript
const _buffer = new TextEncoder().encode(text).buffer as ArrayBuffer
```

### 联合类型返回值的属性访问
当函数返回两种形状的对象时（如脱敏/不脱敏），必须显式声明返回类型：
```typescript
// ✅ 用显式返回类型避免 TS2339
function maskContact(...): ContactRow & { _is_masked: boolean; _private_owner?: number | null }
```

---

## 三、测试规范

### 共享 D1 适配器
所有需要内存数据库的测试统一使用 `__tests__/helpers/d1.ts`，禁止在测试文件中重复定义 `wrapAsD1` / `createTestDB`。

### 测试文件必须导入真实函数
```typescript
// ✅ 测试真实代码
import { matchFields } from '../services/importService'
// ❌ 在测试文件中重新实现一遍被测函数
function matchFields(...) { ... }
```

### 测试覆盖清单（当前 139 tests / 302 assertions）
| 测试文件 | 覆盖模块 | 用例数 |
|---------|---------|-------|
| `cleanPhone.test.ts` | `utils/cleanPhone` | 8 |
| `mask.test.ts` | `utils/mask` | 8 |
| `diffRecord.test.ts` | `utils/diffRecord` | 5 |
| `parseFile.test.ts` | `utils/parseFile` | 16 |
| `response.test.ts` | `utils/response` | 4 |
| `matchFields.test.ts` | `services/importService.matchFields` | 6 |
| `import.test.ts` | `services/importService` 全链路 | 21 |
| `confirmImport.test.ts` | `services/importService.confirmImport` | 5 |
| `contact.test.ts` | `routes/contact.maskContact` 脱敏逻辑 | 9 |
| `dropoff.test.ts` | `cron/dropoff.runDropoff` 实际 DB | 6 |
| `api.auth.test.ts` | `routes/auth` 集成测试 | 11 |
| `security.test.ts` | JWT攻击 + 越权攻击 + 路由隔离 | 18 |
| `codes.test.ts` | `shared/codes` 错误码完整性 | 5 |
| `constants.test.ts` | `constants` 常量校验 | 8 |
| `password.test.ts` | `services/authService.checkPasswordComplexity` | 8 |
| `schema.test.ts` | `db/schema` 表导出 | 1 |

### 新增功能时必须同步补测试
- 纯函数 → 直接单测
- 路由业务逻辑 → 提取核心逻辑为纯函数再单测，或用 `app.request()` 集成测试
- DB 操作 → 用 `helpers/d1.ts` 的内存数据库

---

## 四、注释规范

### 文件级注释（必须）
每个 `.ts` 源文件顶部必须有 JSDoc 文件头注释，包含：
```typescript
/**
 * @file   文件名 — 一句话职责描述
 * @desc   详细说明该文件的功能、设计意图
 * @routes （路由文件特有）列出所有 HTTP 端点及其权限要求
 * @security （涉及安全的文件）标注安全设计要点
 */
```

### 行内注释
- 关键业务逻辑（如乐观锁、脱敏规则、联动释放）必须用 `// @security` 或 `// 说明` 标注
- 简单的 CRUD 操作无需逐行注释，用路由段分隔注释 `// ── GET /xxx ──` 即可
- 禁止注释废弃代码，直接删除

---

## 五、代码风格

### 无用代码清理 (Dead Code Elimination)
- 定期使用 `bun x tsc --noEmit --noUnusedLocals --noUnusedParameters` 深度扫描未使用的变量和引用的包。
- 在发现不再使用的变量、类型、函数时，顺手将其清理，保持代码高内聚不冗余。

### 极限精简 (Modern Syntax & Framework Features)
- **可读性优先**：精简的前提是不降低可读性。`Number(c.req.param('id'))` 比 `+(x || 0)` 更清晰，应保留 `Number()`。
- **变量解构加类型断言**：禁止分别声明 body 再解构，必须结合一行：`const { a, b } = await c.req.json() as MyType`。
- **数组高阶映射**：用 `map/reduce/some/every` 和 `Promise.all` 杜绝循环体内的过度声明和 `for` 循环（特别强调 `return reduce(...)` 单行替代）。
- **善用 Hono 特性**：直接利用上下文自带的快捷写法，消灭大段流水账代码，让代码“骨感性感”。

### 变量命名
- 所有局部变量以 `_` 前缀（项目约定）: `_db`, `_viewer`, `_result`
- 未使用的函数参数（如框架必需签名）以 `_` 开头: `async scheduled(_event, env)`
- 常量全大写: `PROTECT_DAYS`, `BATCH_SIZE`

### 函数大小
- 单个路由 handler 不超过 40 行，超过则提取服务函数到 `services/`
- 可复用逻辑（如脱敏、分页、清洗）必须提取到 `utils/`

### 错误码
- 所有错误码定义在 `shared/codes.ts`，前后端共享
- 新增错误码必须在 `ErrorCode` 和 `ErrorMsg` 中同步添加
- 必须是负数且不能与已有的重复

---

## 六、数据库操作

### 本地 D1 初始化
```bash
bunx wrangler d1 execute crm-db --local --file=drizzle/0000_magenta_fenris.sql
bunx wrangler d1 execute crm-db --local --file=src/db/seed.sql
```

### Schema 修改流程
1. 修改 `src/db/schema.ts`
2. 运行 `bunx drizzle-kit generate` 生成迁移
3. 在本地和远程分别执行迁移 SQL

### seed.sql 注意事项
- bcrypt hash 必须用代码生成，不能用占位值
- 生成命令: `bun -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('密码', 10))"`

---

## 七、安全设计要点

- **防写保护**：已开发 (`developed`) 的联系人，导入时进入 `frozen_list`，绝不覆盖
- **脱敏规则**：非本人、非超管查看他人已开发资源时，phone/email/social 自动脱敏
- **导入 token**：15 分钟有效，含 user_id 校验，防止跨用户提交
- **安全词确认**：撤销需输入"确认撤销"，导入需输入"确认导入"
- **角色层级**：staff(1) < manager(2) < superadmin(3)，用 `requireRole()` 中间件守护

---

## 八、优化重构与钩子机制（Hooks）

为了极化减少样板代码，提升路由层的核心业务清晰度，项目必须遵循以下 Hono 钩子开发规范：

1. **DB 全局注入**：
   禁止在 Controller 内重复写 `const _db = drizzle(c.env.DB)`。
   所有请求均已在 `index.ts` 通过 `dbHook` 挂载，只需在控制器内使用 `c.get('db')` 即可获取。
   同时，路由文件**禁止**导入 `drizzle-orm/d1`（该导入仅存在于 `hook.ts`、`importService.ts` 和 `dropoff.ts`）。

2. **分页规范抽离**：
   禁止在 Controller 内部手写 `page` / `size` / `offset` 参数转换。
   任何需要分页的列表 API 直接使用全局 `paginateHook` 注入的变量：
   `const { page: _page, size: _size, offset: _offset } = c.get('page_info')`

3. **CORS 跨域环境变量注入**：
   开发和生产域名的 `FRONTEND_URL` 被彻底收敛进 `wrangler.jsonc` 与 `.dev.vars`，保持 `index.ts` 代码纯粹。

4. **Upsert 优先**：
   当操作语义为"存在则更新，不存在则插入"时，禁止先 SELECT 再 if/else UPDATE/INSERT。
   必须使用 Drizzle 的 `onConflictDoUpdate`（利用 D1/SQLite 的 `ON CONFLICT` 语法），将两次 DB 调用合并为一次。
   示例（`config.ts`）：
   ```typescript
   await _db.insert(sysConfig).values({ key, value })
     .onConflictDoUpdate({ target: sysConfig.key, set: { value } })
   ```

5. **共享字段选择常量**：
   当多个路由使用相同的字段选择（如 `user.ts` 的用户列表和待审核列表），必须提取为模块级常量（如 `USER_COLUMNS`），杜绝重复的内联字段声明。

6. **审计日志保留在 Controller 内**：
   经论证，审计日志**不适合**提取为通用中间件。因为每个业务场景需要记录的 `details` 快照高度定制化（如联系人撤销需记录 `prev_user_id`、导入需记录四路分类统计）。审计日志必须在 Controller 内直白书写，确保日志内容精确。

7. **Zod 校验保留手工 safeParse**：
   经论证，`@hono/zod-validator` 与项目的自定义错误码体系不兼容（会破坏 TypeScript 类型链路且无法返回业务特定的 ErrorCode）。校验逻辑必须使用原生 `schema.safeParse()` + `fail()` 组合。

---

## 九、依赖管理

| 包 | 角色 | 说明 |
|----|------|------|
| `bcryptjs` | 密码哈希 | 纯 JS 实现，兼容 Workers V8 isolate |
| `drizzle-orm` | ORM | 类型安全 SQL 构建器，通过 `dbHook` 全局实例化 |
| `hono` | Web 框架 | 路由、中间件、CORS 等 HTTP 能力 |
| `zod` | 请求校验 | 声明式参数校验，与 `fail()` 配合返回业务错误码 |

### 依赖引入原则
- **禁止引入** `@hono/zod-validator`、`@hono/zod-openapi`、`@hono/swagger-ui`（已论证不适用）
- 新增依赖前必须确认在 Workers V8 isolate 环境中可用
- 优先使用 Web 标准 API（如 `crypto.subtle`）而非 Node.js 特定包

