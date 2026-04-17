/**
 * @file   vue-router.ts — 路由初始化（自动注册 + 别名加密 + 权限守卫）
 * @desc   自动扫描 router/ 目录，语义路径重定向到数字别名，权限检查
 * @ref    docs/dev/09-前端方案.md
 */

import { _t } from '@i18n'
import { user } from '@pinia'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routeList: RouteRecordRaw[] = [
  {
    path: '/database',
    meta: { title: _t('客户跟进'), role: 'staff' },
    component: () => import('@/views/Database/index.vue')
  },
  {
    path: '/fields',
    meta: { title: _t('字段配置'), role: 'superadmin' },
    component: () => import('@/views/Fields/index.vue')
  },
  {
    path: '/groups',
    meta: { title: _t('组织管理'), role: 'superadmin' },
    component: () => import('@/views/Groups.vue')
  },
  {
    path: '/import',
    meta: { title: _t('数据导入'), role: 'manager' },
    component: () => import('@/views/Import/index.vue')
  },
  {
    path: '/login',
    meta: { title: _t('登录'), public: true },
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/logs',
    meta: { title: _t('系统日志'), role: 'manager' },
    component: () => import('@/views/Logs.vue')
  },
  {
    path: '/overview',
    meta: { title: _t('概览'), role: 'superadmin' },
    component: () => import('@/views/Overview.vue')
  },
  {
    path: '/register',
    meta: { title: _t('注册'), public: true },
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/search',
    meta: { title: _t('查找与去重'), role: 'staff' },
    component: () => import('@/views/Search.vue')
  },
  {
    path: '/stats',
    meta: { title: _t('个人线索情况'), role: 'staff' },
    component: () => import('@/views/Stats.vue')
  },
  {
    path: '/teamstats',
    meta: { title: _t('团队统计'), role: 'manager' },
    component: () => import('@/views/TeamStats.vue')
  },
  {
    path: '/users',
    meta: { title: _t('用户列表'), role: 'manager' },
    component: () => import('@/views/Users.vue')
  }
]

const modules: RouteRecordRaw[] = []

// 路径加密映射表
const pathAliasMap = new Map<string, string>()
export function aliasOf(path: string) {
  return pathAliasMap.get(path)
}
function aliasCode(num: number) {
  return (num * 37 + 11) % 1000
}

routeList.forEach((route, i) => {
  const alias = '/' + aliasCode(i)
  route.alias = alias
  pathAliasMap.set(route.path as string, alias)
  modules.push(route)
})

const routes: RouteRecordRaw[] = [{ path: '/', redirect: '/search' }, ...modules]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  }
})

// ── 权限守卫 + 路径重定向 ──
const ROLE_LEVEL: Record<string, number> = {
  staff: 1,
  manager: 2,
  superadmin: 3
}

router.beforeEach((to) => {
  // 数字路径检测：已是别名则放行
  if (/^\/\d+$/.test(to.path)) {
    return router.resolve(to.fullPath).matched.length > 0 ? true : { path: '/' }
  }

  // 公开路由直接放行
  if (to.meta.public) return true

  // 权限检查
  const _store = user()
  if (!_store.token) return '/login'

  const _required = ROLE_LEVEL[to.meta.role as string] || 1
  const _current = ROLE_LEVEL[_store.user_info?.role || ''] || 0
  if (_current < _required) return '/'

  // 语义路径重定向到数字别名（设为 false 临时关闭）
  const ENABLE_PATH_ALIAS = false
  if (ENABLE_PATH_ALIAS) {
    const _found = modules.find((_r) => _r.path === to.path)
    if (_found) {
      const _alias = Array.isArray(_found.alias) ? _found.alias[0] : _found.alias
      if (_alias) return { path: _alias as string, query: to.query, hash: to.hash }
    }
  }

  return true
})

router.afterEach(() => window.scrollTo(0, 0))

export default router
