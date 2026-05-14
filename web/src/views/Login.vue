<!--
  @file   views/Login.vue — 登录页
  @desc   登录卡片，支持跳转注册，标题居中语言切换（国旗）
-->
<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="handleLogin">
      <button class="lang-button" type="button" @click="toggleLang">
        {{ _current_lang === 'zh-CN' ? '🇨🇳 中文' : '🇺🇸 English' }}
      </button>

      <label class="field">
        <span>{{ t('用户名') }}</span>
        <input v-model.trim="form_data.username" autocomplete="username" :placeholder="t('用户名')" />
      </label>

      <label class="field">
        <span>{{ t('密码') }}</span>
        <input
          v-model.trim="form_data.password"
          autocomplete="current-password"
          :placeholder="t('密码')"
          type="password"
        />
      </label>

      <p v-if="error_text" class="error-text">{{ error_text }}</p>

      <button class="submit-button" type="submit" :disabled="!can_submit || is_loading">
        {{ is_loading ? t('登录') + '...' : t('登录') }}
      </button>

      <button class="link-button" type="button" @click="router.push('/register')">
        {{ t('注册') }}
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { loadLang, t } from '@i18n'
import { app, user } from '@pinia'
import { runIdle } from '@/utils/idle'

const router = useRouter()
const route = useRoute()

const form_data = reactive({ username: '', password: '' })
const is_loading = ref(false)
const error_text = ref('')
const _current_lang = ref(app().language || 'zh-CN')
const can_submit = computed(() => !!form_data.username && !!form_data.password)

onMounted(() => {
  runIdle(() => {
    void import('@/components/PrivateShell.vue')
    void import('@/views/Search.vue')
  })
})

async function toggleLang() {
  const _next = _current_lang.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  await loadLang(_next)
  _current_lang.value = _next
}

async function handleLogin() {
  if (!can_submit.value || is_loading.value) return
  is_loading.value = true
  error_text.value = ''
  try {
    await user().login(form_data.username, form_data.password)
    const _redirect = (route.query.redirect as string) || '/search'
    router.push(_redirect)
  } catch (err: any) {
    error_text.value = t(err?.msg || '服务器内部错误')
  } finally {
    is_loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
}

.auth-card {
  width: min(400px, 95vw);
  display: grid;
  gap: 18px;
  padding: 30px 32px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 30px rgb(15 23 42 / 6%);
}

.lang-button,
.link-button {
  justify-self: center;
  border: 0;
  background: transparent;
  color: #2f855a;
  font: inherit;
}

.field {
  display: grid;
  gap: 8px;
  color: #475569;
  font-size: 14px;
}

.field input {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border: 1px solid #d8dee6;
  border-radius: 3px;
  color: #111827;
  font: inherit;
  outline: none;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.field input:focus {
  border-color: #4caf73;
  box-shadow: 0 0 0 3px rgb(76 175 115 / 14%);
}

.submit-button {
  height: 40px;
  border: 0;
  border-radius: 3px;
  background: #4caf73;
  color: #fff;
  font: inherit;
  transition: background 0.16s ease, opacity 0.16s ease;
}

.submit-button:hover:not(:disabled) {
  background: #429765;
}

.submit-button:disabled {
  opacity: 0.5;
}

.error-text {
  margin: -4px 0;
  color: #dc2626;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}
</style>
