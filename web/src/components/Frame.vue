<!--
  @file   MainLayout.vue — 主布局
  @desc   侧边栏导航 + 顶部栏 + 内容区，根据角色动态渲染菜单
-->
<template>
  <n-layout class="!min-h-screen" has-sider>
    <!-- 侧边栏 -->
    <n-layout-sider :width="160" class="!z-10" bordered>
      <n-flex align="center" justify="center" class="!h-14 !border-b !border-[var(--n-border-color)]">
        <n-button quaternary size="small" @click="toggleLang" class="!font-medium">
          {{ _current_lang === 'zh-CN' ? '🇨🇳 中文' : '🇺🇸 English' }}
        </n-button>
      </n-flex>

      <n-menu v-model:value="selected_key" :options="menu_options" @update:value="handleMenuClick" />
    </n-layout-sider>

    <n-layout class="!min-w-[1024px] !overflow-x-auto">
      <!-- 顶部栏 -->
      <n-layout-header bordered class="!h-14 !px-6 !flex !items-center !justify-between !sticky !top-0 !z-5">
        <n-flex align="center" :size="16">
          <n-text class="!text-base !font-medium">{{ current_title }}</n-text>
        </n-flex>

        <n-flex align="center" :size="16">
          <n-flex align="center" :size="8" class="!px-2">
            <n-button dashed size="small" v-if="user().role_level >= 2" @click="copyInviteCode" :loading="!invite_code">
              {{ t('邀请码：') }}{{ invite_code || t('获取中') }}
            </n-button>
            <n-avatar round size="small" color="var(--n-primary-color)">
              {{ user().user_info?.username?.charAt(0)?.toUpperCase() || 'U' }}
            </n-avatar>
            <n-text class="!text-sm !font-medium">{{ user().user_info?.username }}</n-text>

            <n-divider vertical />

            <n-button ghost size="small" @click="show_pwd_modal = true">
              <template #icon>
                <n-icon>
                  <KeyOutline />
                </n-icon>
              </template>
              {{ t('修改密码') }}
            </n-button>

            <n-button ghost size="small" @click="handleLogout">
              <template #icon>
                <n-icon>
                  <LogOutOutline />
                </n-icon>
              </template>
              {{ t('退出登录') }}
            </n-button>
          </n-flex>
        </n-flex>
      </n-layout-header>

      <!-- 内容区 -->
      <n-layout-content class="!p-6 !min-h-screen !bg-gray-100">
        <router-view v-slot="{ Component }">
          <transition enter-active-class="!transition-opacity !duration-200 !ease-in-out"
            leave-active-class="!transition-opacity !duration-200 !ease-in-out" enter-from-class="!opacity-0"
            leave-to-class="!opacity-0" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>

    <!-- 修改密码弹窗 -->
    <n-modal v-model:show="show_pwd_modal" preset="card" :title="t('修改密码')" class="!max-w-[400px]">
      <n-form ref="pwd_form_ref" :model="pwd_form" :rules="pwd_rules" label-placement="left" label-width="100">
        <n-form-item :label="t('原密码')" path="old_password">
          <n-input v-model:value.trim="pwd_form.old_password" type="password" show-password-on="click" />
        </n-form-item>
        <n-form-item :label="t('新密码')" path="new_password">
          <n-input v-model:value.trim="pwd_form.new_password" type="password" show-password-on="click"
            :placeholder="t('至少8位，包含大小写和数字')" />
        </n-form-item>
        <n-form-item class="!flex !justify-end !pt-2">
          <n-button type="primary" :loading="pwd_saving" @click="handlePwdChange">{{ t('确认修改') }}</n-button>
        </n-form-item>
      </n-form>
    </n-modal>
  </n-layout>
</template>

<script lang="ts" setup>
import { loadLang, t } from '@i18n'
import { user } from '@pinia'
import {
  BarChartOutline,
  BusinessOutline,
  CloudUploadOutline,
  DocumentTextOutline,
  HomeOutline,
  LogOutOutline,
  PersonOutline,
  PieChartOutline,
  SearchOutline,
  ServerOutline,
  SettingsOutline,
  KeyOutline
} from '@vicons/ionicons5'
import type { MenuOption, FormInst, FormRules } from 'naive-ui'
import { NIcon, useMessage } from 'naive-ui'
import { getInviteCode, changePassword } from '@/api/auth'

const router = useRouter()
const route = useRoute()
// ═══ 状态 ═══
const selected_key = ref<string>('')
const _current_lang = ref(document.documentElement.lang || 'zh-CN')

async function toggleLang() {
  const _next = _current_lang.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  await loadLang(_next)
  _current_lang.value = _next
}

// ═══ 动态菜单配置 ═══
type AppMenu = {
  label?: string
  key: string
  icon?: any
  type?: 'divider'
  level?: number // 0/1=staff, 2=manager, 3=superadmin
}

const raw_menus: AppMenu[] = [
  { label: '工作台', key: 'overview', icon: HomeOutline },
  { label: '我的报表', key: 'stats', icon: BarChartOutline },
  { label: '团队统计', key: 'teamstats', icon: PieChartOutline, level: 2 },
  { type: 'divider', key: 'd0' },
  { label: '客户搜索', key: 'search', icon: SearchOutline },
  { label: '客户跟进', key: 'database', icon: ServerOutline },
  { label: '数据导入', key: 'import', icon: CloudUploadOutline, level: 2 },
  { type: 'divider', key: 'd1', level: 2 },
  { label: '用户列表', key: 'users', icon: PersonOutline, level: 2 },
  { label: '组织管理', key: 'groups', icon: BusinessOutline, level: 3 },
  { label: '字段配置', key: 'fields', icon: SettingsOutline, level: 3 },
  { label: '系统日志', key: 'logs', icon: DocumentTextOutline, level: 2 }
]

const menu_options = computed<MenuOption[]>(() =>
  raw_menus
    .filter((m) => (m.level || 0) <= user().role_level)
    .map((m) =>
      m.type === 'divider'
        ? { type: 'divider', key: m.key }
        : ({
            label: () => t(m.label!),
            key: m.key,
            icon: () => h(NIcon, null, { default: () => h(m.icon) })
          } as MenuOption)
    )
)

// ═══ 计算属性 ═══
const current_title = computed(() => {
  const metaTitle = route.meta.title as string
  return metaTitle ? t(metaTitle) : '-'
})

const invite_code = ref('')
const message = useMessage()

// ═══ 方法 ═══
function copyInviteCode() {
  if (!invite_code.value) return
  navigator.clipboard.writeText(invite_code.value)
  message.success(t('邀请码已复制到剪贴板！'))
}

function handleMenuClick(key: string) {
  router.push('/' + key)
}

function handleLogout() {
  user().logout()
  router.push('/login')
}

// ═══ 修改密码逻辑 ═══
const show_pwd_modal = ref(false)
const pwd_saving = ref(false)
const pwd_form_ref = ref<FormInst | null>(null)
const pwd_form = ref({
  old_password: '',
  new_password: ''
})
const pwd_rules: FormRules = {
  old_password: [{ required: true, message: '请填写原密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请填写新密码', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/,
      message: '新密码必须包含大小写字母和数字，且至少8位',
      trigger: 'blur'
    }
  ]
}

function handlePwdChange() {
  pwd_form_ref.value?.validate(async (errors) => {
    if (!errors) {
      pwd_saving.value = true
      try {
        const res = await changePassword(pwd_form.value.old_password, pwd_form.value.new_password)
        if (res.code === 200 || res.code === 1) {
          message.success('修改密码成功，请重新登录！')
          show_pwd_modal.value = false
          handleLogout()
        }
      } catch (e: any) {
        // AppError handled implicitly by axios interceptor usually, or message handled
      } finally {
        pwd_saving.value = false
      }
    }
  })
}

// ═══ 监听路由变化同步菜单 ═══
watch(
  () => route.path,
  (_path) => {
    // e.g. /search -> search
    const key = _path.replace(/^\//, '')
    if (key) {
      selected_key.value = key
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (user().role_level >= 2) {
    try {
      const res = await getInviteCode()
      if (res.code === 200 || res.code === 1) invite_code.value = res.data.code
    } catch (e) {}
  }
})
</script>
