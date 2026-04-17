<!--
  @file   views/Login.vue — 登录页
  @desc   登录卡片，支持跳转注册，标题居中语言切换（国旗）
-->
<template>
  <div class="!min-h-screen !flex !items-center !justify-center !relative">
    <n-card class="!w-[400px] !max-w-[95vw] !shadow-sm !rounded-xl" hoverable size="large">
      <template #header>
        <n-flex justify="center">
          <n-button quaternary size="small" @click="toggleLang">
            {{ _current_lang === 'zh-CN' ? '🇨🇳 中文' : '🇺🇸 English' }}
          </n-button>
        </n-flex>
      </template>

      <n-form :model="form_data" @submit.prevent="handleLogin">
        <n-form-item path="username"
          :rule="{ required: true, message: t('用户名') + '!', trigger: 'blur' }">
          <n-input v-model:value.trim="form_data.username" size="large" :placeholder="t('用户名')">
            <template #prefix>
              <n-icon>
                <PersonOutline />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password"
          :rule="{ required: true, message: t('密码') + '!', trigger: 'blur' }">
          <n-input type="password" show-password-on="click" v-model:value.trim="form_data.password" size="large"
            :placeholder="t('密码')">
            <template #prefix>
              <n-icon>
                <LockClosedOutline />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item>
          <n-button type="primary" attr-type="submit" size="large" block
            :disabled="!form_data.username || !form_data.password" :loading="is_loading">
            {{ t('登录') }}
          </n-button>
        </n-form-item>

        <n-flex justify="center">
          <n-button text type="primary" @click="router.push('/register')">
            {{ t('注册') }}
          </n-button>
        </n-flex>
      </n-form>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { loadLang, t } from '@i18n'
import { app, user } from '@pinia'
import { LockClosedOutline, PersonOutline } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const message = useMessage()

const form_data = reactive({ username: '', password: '' })
const is_loading = ref(false)
const _current_lang = ref(app().language || 'zh-CN')

async function toggleLang() {
  const _next = _current_lang.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  await loadLang(_next)
  _current_lang.value = _next
}

async function handleLogin() {
  is_loading.value = true
  try {
    await user().login(form_data.username, form_data.password)
    message.success(t('成功'))
    const _redirect = (route.query.redirect as string) || '/search'
    router.push(_redirect)
  } catch (_err: any) {
    // 错误已由 Axios 拦截器处理
  } finally {
    is_loading.value = false
  }
}
</script>
