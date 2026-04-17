# CRM Web Frontend

> **用途**：本项目的前端核心技术文档与编码自检提示词。
> **技术栈**：Rsbuild + Vue 3 (Composition API) + Ant Design Vue 4 + Pinia + Vue Router + Axios + vue-i18n

---

## 一、技术栈与构建

### 核心依赖

| 包 | 角色 | 说明 |
|----|------|------|
| `rsbuild` | 构建工具 | 基于 Rspack（Rust）的极速构建 |
| `vue 3` | UI 框架 | Composition API + `<script setup>` |
| `ant-design-vue 4` | 组件库 | 企业级 UI 组件 |
| `pinia` | 状态管理 | 含持久化插件，JWT token 本地持久化 |
| `vue-router 4` | 路由 | 含权限守卫 |
| `axios` | HTTP 客户端 | 含请求/响应拦截器 |
| `vue-i18n 9` | 国际化 | 中英文切换 |

### 开发命令

```bash
bun run dev        # 启动开发服务器
bun run build      # 生产构建
bun run preview    # 预览生产构建
bun run check      # Biome 格式化 + lint
```

---

## 二、目录结构

```
src/
├── api/               # API 调用层（Axios 封装 + 各模块 API）
├── assets/            # 静态资源（图片、字体）
├── components/        # 公共组件（PascalCase.vue）
├── composables/       # 组合式函数（useXxx.ts）
├── constants/         # 前端常量
├── i18n/              # 国际化配置（zh.ts / en.ts）
├── layouts/           # 布局组件（MainLayout / AuthLayout）
├── router/            # 路由定义 + 权限守卫
├── stores/            # Pinia 状态管理
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
├── views/             # 页面组件（PascalCase.vue）
├── App.vue            # 根组件
└── index.ts           # 入口
```

---

## 三、命名规范

> 完整规范参见 `docs/dev/10-编码规范.md`，以下为核心摘要。

| 类别 | 风格 | 示例 |
|------|------|------|
| 局部变量 | `_lower_snake` | `_result`, `_viewer` |
| 常量 | `ALL_UPPER_SNAKE` | `ROLE_LEVEL`, `MAX_IMPORT` |
| 函数 | `verbNoun` (camelCase) | `loadUser()`, `saveField()` |
| Vue 组件文件 | `PascalCase.vue` | `Search.vue`, `TeamStats.vue` |
| 响应式状态 | `lower_snake` | `form_data`, `is_loading` |
| CSS 类名 | `kebab-case` | `.page-header`, `.data-table` |
| emit 事件 | `camelCase` | `fieldSaved`, `pageChanged` |
| i18n key | `dot.separated` | `error.100`, `user.login.title` |

### 铁律
- 除 CSS 类名和 CSS 变量外，**任何命名一律禁止短横线 (`-`)**
- 所有局部变量以 `_` 前缀
- 禁止自创缩写（`usr`→`user`、`btn`→`button`、`msg`→`message`）
- 函数体 ≤ 30 行，嵌套 ≤ 2 层

---

## 四、Vue 组件规范

### `<script setup>` 代码组织（固定顺序）

```vue
<script lang="ts" setup>
// ═══ 1. 导入 ═══
// ═══ 2. Props / Emit ═══
// ═══ 3. 响应式状态 ═══
// ═══ 4. 计算属性 ═══
// ═══ 5. 方法（动词+名词）═══
// ═══ 6. 生命周期 ═══
// ═══ 7. 监听器 ═══
</script>
```

### 卫语句优先
```typescript
// ❌ 箭头地狱
if (user) { if (user.role === 'admin') { ... } }

// ✅ 先排除异常
if (!user) return
if (user.role !== 'admin') return
// 最后才是正事
```

---

## 五、API 层规范

### Axios 拦截器
- **请求拦截器**：自动注入 `Authorization: Bearer <token>`
- **响应拦截器**：统一处理 `code < 0` 的业务错误（弹出 i18n 翻译后的错误消息）
- **401 处理**：自动清除 token 并跳转登录页

### API 响应格式（与后端共享 `shared/codes.ts`）
```typescript
interface ApiResponse<T> {
  code: number    // > 0 正常, < 0 错误
  msg:  string    // 英文提示
  data: T | null  // 错误时为 null
}
```

### API 调用命名
```typescript
// api/contact.ts
export function fetchContacts(params) { }    // GET 列表
export function fetchContact(id) { }         // GET 详情
export function claimContact(phone) { }      // POST 认领
export function revokeContact(id, word) { }  // PUT 撤销
```

---

## 六、路由与权限

### 权限守卫
```typescript
// 路由 meta 中声明最低角色
{ path: '/users', meta: { role: 'manager' } }
{ path: '/overview', meta: { role: 'superadmin' } }
```

### 角色层级
```typescript
const ROLE_LEVEL = { staff: 1, manager: 2, superadmin: 3 }
```

---

## 七、状态管理（Pinia）

- `useUserStore` — 用户信息、JWT token（持久化）、登录/登出
- `useAppStore` — 全局 UI 状态（侧边栏折叠、语言、主题）

### 持久化配置
```typescript
defineStore('user', () => { ... }, {
  persist: { key: 'crm_user', pick: ['token', 'user_info'] }
})
```

---

## 八、国际化

- 错误码翻译：通过 `shared/codes.ts` 的 `ErrorCode` 映射 i18n key
- 动态业务数据不翻译，仅翻译 UI 文案
- 切换后即时生效，无需刷新

---

## 九、安全设计

- **脱敏展示**：后端返回的 `_is_masked: true` 时，前端禁用编辑按钮并展示掩码数据
- **强确认弹窗**：所有高危操作（认领、撤销、导入、删除）必须弹出红色警告 + 安全词输入
- **Token 管理**：JWT 存储在 Pinia 持久化 store，退出登录时彻底清除

---

## 十、代码工具

### Biome（格式化 + Lint）
```bash
bun run check      # 自动格式化 + lint
bun run format     # 仅格式化
```

### 参考文档
- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- Ant Design Vue: https://antdv.com/
- 编码规范: `docs/dev/10-编码规范.md`
