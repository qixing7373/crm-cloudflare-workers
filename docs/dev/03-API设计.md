# API 设计

## 通用约定

- 服务前缀：公开接口使用 `/auth/*`，业务接口使用 `/api/*`。
- 认证方式：`Authorization: Bearer <JWT>`。
- HTTP 状态：业务接口统一返回 `200`，通过 `code` 区分成功与失败。
- 成功响应：

```json
{ "code": 1, "msg": "success", "data": {} }
```

- 失败响应：

```json
{ "code": -401, "msg": "Unauthorized", "data": null }
```

- 分页响应：

```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "list": [],
    "total_count": 0,
    "page_index": 1,
    "page_size": 20
  }
}
```

## 角色

| 角色 | 权限 |
| --- | --- |
| `staff` | 搜索、认领、查看本人客户、个人统计 |
| `manager` | staff 权限 + 导入、导出、用户列表、日志、团队统计 |
| `superadmin` | manager 权限 + 组织、字段、删除、撤销、全局概览 |

## 认证

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | 公开 | 登录 |
| `POST` | `/auth/register` | 公开 | 使用邀请码注册 |
| `GET` | `/auth/check` | 登录 | 校验 token |
| `PUT` | `/auth/password` | 登录 | 修改当前账号密码 |
| `GET` | `/api/invite/code` | manager+ | 获取当日邀请码 |

## 联系人

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/contact` | manager+ | 总库分页，支持 `page`、`size`、`status`、`q`、`tail_only` |
| `GET` | `/api/contact/search` | staff+ | 全局查重搜索 |
| `GET` | `/api/contact/:id` | staff+ | 联系人详情 |
| `POST` | `/api/contact/claim` | staff+ | 新建或认领未开发联系人 |
| `PUT` | `/api/contact/:id` | staff+ | 更新联系人 |
| `PUT` | `/api/contact/:id/revoke` | superadmin | 撤销已开发状态 |
| `PUT` | `/api/contact/transfer` | manager+ | 批量转移归属 |
| `DELETE` | `/api/contact/:id` | superadmin | 软删除 |

搜索接口会根据业务规则返回脱敏结果，防止撞单时泄露他人私域资料。

## 批量导入

当前导入只保留同步架构，不再使用旧版 `/import/upload` 和 `/import/confirm`。

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/import/verify-hash?hash=...` | manager+ | 校验文件是否已导入 |
| `POST` | `/api/import/sync` | manager+ | 上传一个清洗后的分片并直接入库 |
| `GET` | `/api/import/history` | manager+ | 分页查看所有导入历史，支持 `q` |
| `GET` | `/api/import/:id` | manager+ | 查看单批次导入明细 |

`POST /api/import/sync` 请求体：

```json
{
  "file_name": "customers.xlsx",
  "file_hash": "sha256...",
  "import_id": 12,
  "clean_list": [
    {
      "phone": "+8613800000000",
      "status": "developed",
      "data": { "name": "张三", "source": "douyin" }
    }
  ]
}
```

字段说明：

- `status` 可选，支持 `undeveloped` 和 `developed`。
- 未传 `status` 时按 `undeveloped` 处理。
- `developed` 会自动归属到当前导入用户。
- `import_id` 只在继续同步同一个文件后续分片时传入。

返回：

```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "import_id": 12,
    "chunk_size": 200,
    "results": [
      { "phone": "+8613800000000", "type": "added" }
    ]
  }
}
```

`type` 取值：

- `added`：新增。
- `updated`：更新未开发数据或升级为已开发。
- `skipped`：重复且无变化。
- `frozen`：已有已开发数据，触发防写保护。

## 字段、组织、用户

| 模块 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| 字段 | `/api/field` | superadmin | 动态字段配置 |
| 组织 | `/api/group` | superadmin | 组织管理 |
| 用户 | `/api/user` | manager+ | 用户列表、新建、状态、密码、角色、组织调整 |

## 统计与日志

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/stat/me?month=YYYY-MM` | staff+ | 当前用户个人已开发统计 |
| `GET` | `/api/stat/group` | manager+ | 按归属用户聚合团队已开发数量 |
| `GET` | `/api/stat/overview` | superadmin | 总量、已开发、未开发、开发率 |
| `GET` | `/api/log?page=1&size=20&action=import` | manager+ | 系统用户日志 |
| `GET` | `/api/log/contact/:id` | staff+ | 单个联系人生命周期日志 |

## 错误码

错误码定义以 `api/src/codes.ts` 为准。常用错误：

| code | 含义 |
| --- | --- |
| `-100` | 用户名已存在 |
| `-101` | 账号或密码错误 |
| `-103` | 账号已禁用 |
| `-104` | Token 过期 |
| `-201` | 撞单 |
| `-300` | 导入格式不支持 |
| `-301` | 文件过大 |
| `-400` | 权限不足 |
| `-401` | 未登录或签名无效 |
| `-402` | 请求过于频繁 |
| `-403` | 请求参数错误 |
| `-500` | 服务器内部错误 |
