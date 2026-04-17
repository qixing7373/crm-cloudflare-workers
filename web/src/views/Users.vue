<!--
  @file   views/Users.vue
  @desc   人员/用户管理
-->
<template>
  <div>
    <n-card :bordered="false" class="!shadow !rounded-xl" hoverable>
      <n-flex justify="end" align="center" class="!mb-4">
        <n-button type="primary" @click="openCreateDrawer">
          <template #icon><n-icon>
              <AddOutline />
            </n-icon></template>
          {{ t('新建用户') }}
        </n-button>
      </n-flex>
      <n-data-table :columns="columns" :data="user_list" :loading="loading" :pagination="{ pageSize: 15 }"
        :row-key="row => row.id" scroll-x="1000" />
    </n-card>

    <!-- 新建人员抽屉 -->
    <n-drawer v-model:show="show_drawer" :width="500" placement="right">
      <n-drawer-content :title="t('新建用户')" closable>
        <n-form ref="form_ref" :model="form_data" :rules="rules" label-placement="top"
          require-mark-placement="right-hanging">
          <n-form-item :label="t('用户名')" path="username">
            <n-input v-model:value.trim="form_data.username" :placeholder="t('3-20位英文、数字、下划线')" />
          </n-form-item>



          <n-form-item :label="t('角色')" path="role">
            <n-radio-group v-model:value="form_data.role">
              <n-radio value="staff">{{ t('业务员') }}</n-radio>
              <n-radio value="manager" :disabled="!isSuper">{{ t('管理员') }}</n-radio>
            </n-radio-group>
          </n-form-item>

          <n-form-item :label="t('组织')" path="group_id">
            <n-select v-model:value="form_data.group_id" :options="group_options" placeholder="请选择人员归属组织" clearable />
          </n-form-item>


        </n-form>

        <template #footer>
          <n-flex justify="end" :size="12" class="!w-full">
            <n-button @click="show_drawer = false">取消</n-button>
            <n-button type="primary" :loading="saving" @click="handleCreate">确定创建</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 角色/组织快速调整弹框 (仅超管) -->
    <n-modal v-model:show="show_edit_modal" preset="card" title="高级权限调整" class="!max-w-[400px]">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="调整角色">
          <n-select v-model:value="edit_temp.role" :options="role_options" />
        </n-form-item>
        <n-form-item label="变更组织">
          <n-select v-model:value="edit_temp.group_id" :options="group_options" />
        </n-form-item>
        <n-form-item class="!flex !justify-end !pt-2">
          <n-button type="primary" :loading="saving" @click="submitEditAdvanced">保存设置</n-button>
        </n-form-item>
      </n-form>
    </n-modal>

  </div>
</template>

<script lang="ts" setup>
import { t } from '@i18n'
import { user } from '@pinia'
import {
  AddOutline,
  BanOutline,
  Business,
  CheckmarkCircleOutline,
  CreateOutline,
  InformationCircle,
  KeyOutline,
  Person,
  Settings,
  ShieldCheckmark
} from '@vicons/ionicons5'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { NButton, NFlex, NIcon, NPopconfirm, NTag, NText } from 'naive-ui'
import { h } from 'vue'
import { GroupApi } from '@/api/group'
import { UserApi, type UserItem } from '@/api/user'

const message = useMessage()
const dialog = useDialog()

const isSuper = computed(() => user().is_superadmin)

// 字典数据缓存
const groups_map = ref<Record<number, string>>({})
const group_options = ref<{ label: string; value: number }[]>([])
async function loadGroups() {
  try {
    const res = await GroupApi.list()
    if (res.code === 200 || res.code === 1) {
      const g = res.data
      group_options.value = g.map((x) => ({ label: x.name, value: x.id }))
      groups_map.value = g.reduce(
        (acc, curr) => {
          acc[curr.id] = curr.name
          return acc
        },
        {} as Record<number, string>
      )
    }
  } catch (e) {}
}

const role_options = [
  { label: '业务员', value: 'staff' },
  { label: '管理员', value: 'manager' },
  { label: '超管', value: 'superadmin' }
]

// 列表查询
const loading = ref(false)
const user_list = ref<UserItem[]>([])

async function fetchData() {
  loading.value = true
  try {
    const res = await UserApi.list()
    if (res.code === 200 || res.code === 1) {
      user_list.value = res.data
    }
  } catch (err) {
    message.error('获取账号列表失败')
  } finally {
    loading.value = false
  }
}

// 审核/封禁状态修改
async function handleStatusChange(row: UserItem, status: 'active' | 'disabled') {
  if (status === 'disabled') {
    dialog.warning({
      title: '封禁确认',
      content: `确定要封禁人员 [${row.username}] 吗？封禁后其名下已开发的私海客户将被释放！`,
      positiveText: '取消',
      negativeText: '确定封禁',
      onNegativeClick: async () => {
        try {
          await UserApi.updateStatus(row.id, 'disabled')
          message.success('该人员已封禁隔离')
          fetchData()
        } catch (e) {}
      }
    })
  } else {
    try {
      await UserApi.updateStatus(row.id, 'active')
      message.success('账号已恢复激活')
      fetchData()
    } catch (e) {}
  }
}

// 高级调整 (仅超管)
const show_edit_modal = ref(false)
const edit_temp = ref({ id: 0, role: '', group_id: 0 as number | null })

function openAdvancedEdit(row: UserItem) {
  edit_temp.value = { id: row.id, role: row.role, group_id: row.group_id }
  show_edit_modal.value = true
}

async function submitEditAdvanced() {
  saving.value = true
  try {
    const promises = []
    const _row = user_list.value.find((u) => u.id === edit_temp.value.id)
    if (!_row) return
    if (edit_temp.value.role !== _row.role) {
      promises.push(UserApi.updateRole(_row.id, edit_temp.value.role as any))
    }
    if (edit_temp.value.group_id !== _row.group_id && edit_temp.value.group_id) {
      promises.push(UserApi.updateGroup(_row.id, edit_temp.value.group_id))
    }

    if (promises.length > 0) {
      await Promise.all(promises)
      message.success('高级权限与组织更新成功')
      fetchData()
    }
    show_edit_modal.value = false
  } catch (e) {
  } finally {
    saving.value = false
  }
}

// 表头带图标渲染辅助函数
function renderHeader(icon: any, title: string) {
  return () =>
    h('div', { class: 'flex items-center justify-center gap-1.5' }, [
      h(NIcon, { size: 16 }, { default: () => h(icon) }),
      h('span', title)
    ])
}

// 表格列定义
const columns = computed<DataTableColumns<UserItem>>(() => {
  const cols: DataTableColumns<UserItem> = [
    { title: 'ID', key: 'id', width: 50, align: 'center' },
    {
      title: renderHeader(Person, '用户'),
      key: 'username',
      align: 'center',
      render(row) {
        return h(NText, { strong: true }, { default: () => row.username })
      }
    },
    {
      title: renderHeader(Business, '组织'),
      key: 'group_id',
      align: 'center',
      render(row) {
        return (row as any).group_name || '-'
      }
    },
    {
      title: renderHeader(ShieldCheckmark, '角色'),
      key: 'role',
      align: 'center',
      render(row) {
        const typeMap = {
          staff: 'default',
          manager: 'info',
          superadmin: 'error'
        } as const
        const labelMap: Record<string, string> = {
          superadmin: '超管',
          manager: '管理员',
          staff: '业务员'
        }
        return h(
          NTag,
          { type: typeMap[row.role] || 'default', bordered: false },
          { default: () => labelMap[row.role] || row.role.toUpperCase() }
        )
      }
    },
    {
      title: renderHeader(InformationCircle, '状态'),
      key: 'status',
      align: 'center',
      render(row) {
        const tagMap = {
          active: { label: '正常', type: 'success' },
          disabled: { label: '封禁', type: 'error' }
        } as const
        const conf = tagMap[row.status] || { label: row.status, type: 'default' }
        return h(
          NTag,
          { type: conf.type, bordered: false, round: true },
          { default: () => conf.label }
        )
      }
    },

    {
      title: renderHeader(Settings, '操作'),
      key: 'actions',
      minWidth: 200,
      align: 'center',
      render(row) {
        // 构建操作按钮
        const acts: any[] = []

        if (row.status === 'disabled') {
          acts.push(
            h(
              NButton,
              {
                size: 'small',
                type: 'success',
                quaternary: true,
                onClick: () => handleStatusChange(row, 'active')
              },
              {
                default: () => '恢复激活',
                icon: () => h(NIcon, null, { default: () => h(CheckmarkCircleOutline) })
              }
            )
          )
        } else if (row.id !== user().id) {
          // Cannot ban oneself
          acts.push(
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleStatusChange(row, 'disabled'),
                negativeText: '取消',
                positiveText: '确认封禁'
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                      quaternary: true
                    },
                    {
                      default: () => '封禁',
                      icon: () => h(NIcon, null, { default: () => h(BanOutline) })
                    }
                  ),
                default: () => '确定要违规封禁该用户吗？封禁后其公海资源将被立即释放。'
              }
            )
          )
        }

        if (isSuper.value) {
          acts.push(
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                quaternary: true,
                onClick: () => openAdvancedEdit(row)
              },
              {
                default: () => '编辑',
                icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
              }
            )
          )
          acts.push(
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleResetPassword(row),
                negativeText: '取消',
                positiveText: '确认重置'
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'warning',
                      quaternary: true
                    },
                    {
                      default: () => '重置密码',
                      icon: () => h(NIcon, null, { default: () => h(KeyOutline) })
                    }
                  ),
                default: () => `确定要为用户 [${row.username}] 重置密码吗？旧密码将立刻失效。`
              }
            )
          )
        }

        return h(NFlex, { size: 12, justify: 'center' }, () => acts)
      }
    }
  ]
  return cols
})

// === 新建表单 ===
const show_drawer = ref(false)
const saving = ref(false)
const form_ref = ref<FormInst | null>(null)
const form_data = ref({
  username: '',
  role: 'staff',
  group_id: null as number | null
})
const rules: FormRules = {
  username: [
    { required: true, message: '请填写用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{3,20}$/,
      message: '只能由3-20位英文字母、数字、下划线组成',
      trigger: ['input', 'blur']
    }
  ]
}

function openCreateDrawer() {
  form_data.value = {
    username: '',
    role: 'staff',
    group_id: null
  }
  show_drawer.value = true
}

function generateRandomPassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let pwd = ''
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pwd
}

function handleCreate() {
  form_ref.value?.validate(async (errors) => {
    if (!errors) {
      saving.value = true
      try {
        const randomPwd = generateRandomPassword()
        const payload = { ...form_data.value, password: randomPwd }
        const res = await UserApi.create(payload as any)
        if (res.code === 201 || res.code === 1 || res.code === 200) {
          dialog.success({
            title: '新建账号成功',
            content: `初始登录密码已自动生成：${randomPwd}\n请复制并提供给用户。此密码仅显示一次！`,
            positiveText: '复制密码并关闭',
            onPositiveClick: () => navigator.clipboard.writeText(randomPwd)
          })
          show_drawer.value = false
          fetchData()
        }
      } catch (e) {
      } finally {
        saving.value = false
      }
    }
  })
}

async function handleResetPassword(row: UserItem) {
  const randomPwd = generateRandomPassword()
  try {
    const res = await UserApi.resetPassword(row.id, randomPwd)
    if (res.code === 200 || res.code === 1) {
      dialog.success({
        title: '重置密码成功',
        content: `用户 [${row.username}] 的新密码已生成：${randomPwd}\n请复制并提供给用户。此密码仅显示一次！`,
        positiveText: '复制并关闭',
        onPositiveClick: () => navigator.clipboard.writeText(randomPwd)
      })
    }
  } catch (e) {}
}

onMounted(async () => {
  await loadGroups() // 预先加载组织字典
  fetchData()
})
</script>
