<!--
  @file   views/Groups.vue
  @desc   部门/分组管理（超管可用）
-->
<template>
  <div>
    <n-card :bordered="false" class="!shadow !rounded-xl" hoverable>
      <n-flex justify="space-between" align="center" class="!mb-4">
        <n-flex vertical :size="4">
          <n-text class="!text-[22px] !font-semibold">{{ t('组织管理') }}</n-text>
          <n-text depth="3" class="!text-[13px]">{{ t('管理组织架构，为人员分配层级和数据隔离基础') }}</n-text>
        </n-flex>
        <n-button type="primary" @click="openCreateModal">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          {{ t('新建组织') }}
        </n-button>
      </n-flex>
      <n-data-table
        :columns="columns"
        :data="group_list"
        :loading="loading"
        :pagination="{ pageSize: 15 }"
        :row-key="row => row.id"
      />
    </n-card>

    <!-- 新建/编辑组织抽屉 -->
    <n-drawer v-model:show="show_modal" :width="500" placement="right">
      <n-drawer-content :title="modal_type === 'create' ? t('新建组织') : t('编辑组织')" closable>
        <n-form
          ref="form_ref"
          :model="form_data"
          :rules="rules"
          label-placement="top"
          require-mark-placement="right-hanging"
        >
          <n-form-item :label="t('名称')" path="name">
            <n-input v-model:value.trim="form_data.name" :placeholder="t('请输入组织名称...')" />
          </n-form-item>
          
          <n-flex justify="end" :size="12" class="!mt-8">
            <n-button @click="show_modal = false">{{ t('取消') }}</n-button>
            <n-button type="primary" :loading="saving" @click="handleSave">{{ t('保存') }}</n-button>
          </n-flex>
        </n-form>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script lang="ts" setup>
import { t } from '@i18n'
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { NButton, NIcon, NPopconfirm, NText } from 'naive-ui'
import { h } from 'vue'
import type { UserGroup } from '@/api/group'
import { GroupApi } from '@/api/group'

const message = useMessage()

// 数据状态
const loading = ref(false)
const group_list = ref<UserGroup[]>([])

// 获取列表
async function fetchData() {
  loading.value = true
  try {
    const res = await GroupApi.list()
    if (res.code === 200 || res.code === 1) {
      group_list.value = res.data
    }
  } catch (err) {
    message.error(t('获取组织列表失败'))
  } finally {
    loading.value = false
  }
}

// 表格列定义
const columns: DataTableColumns<UserGroup> = [
  { title: 'ID', key: 'id', width: 50 },
  { title: () => t('组织名称'), key: 'name' },
  {
    title: () => t('成员人数'),
    key: 'member_count',
    render(row) {
      return h(
        NText,
        { type: row.member_count > 0 ? 'info' : 'default', strong: true },
        { default: () => `${row.member_count} ${t('人员')}` }
      )
    }
  },
  {
    title: () => t('创建时间'),
    key: 'created_at',
    render(row) {
      return new Date(row.created_at).toLocaleString()
    }
  },
  {
    title: () => t('操作'),
    key: 'actions',
    minWidth: 160,
    render(row) {
      return h('div', { class: 'flex gap-3' }, [
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'primary',
            onClick: () => openEditModal(row)
          },
          {
            default: () => t('编辑'),
            icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
          }
        ),
        h(
          NPopconfirm,
          {
            onNegativeClick: () => handleDelete(row),
            positiveText: t('取消'),
            negativeText: t('确认'),
            negativeButtonProps: { type: 'error' }
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  quaternary: true,
                  type: 'error',
                  disabled: row.member_count > 0 // 有成员时不可删除
                },
                {
                  default: () => t('删除'),
                  icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
                }
              ),
            default: () => t('确定要删除该组织吗？删除后不可恢复。')
          }
        )
      ])
    }
  }
]

// 弹窗状态
const show_modal = ref(false)
const modal_type = ref<'create' | 'edit'>('create')
const saving = ref(false)
const form_ref = ref<FormInst | null>(null)
const form_data = ref({ id: 0, name: '' })

const rules: FormRules = {
  name: [{ required: true, message: t('请输入组织名称'), trigger: 'blur' }]
}

function openCreateModal() {
  modal_type.value = 'create'
  form_data.value = { id: 0, name: '' }
  show_modal.value = true
}

function openEditModal(row: UserGroup) {
  modal_type.value = 'edit'
  form_data.value = { id: row.id, name: row.name }
  show_modal.value = true
}

async function handleSave() {
  form_ref.value?.validate(async (errors) => {
    if (!errors) {
      saving.value = true
      try {
        if (modal_type.value === 'create') {
          const res = await GroupApi.create(form_data.value.name)
          if (res.code === 201 || res.code === 200 || res.code === 1) message.success(t('新建成功'))
        } else {
          const res = await GroupApi.update(form_data.value.id, form_data.value.name)
          if (res.code === 200 || res.code === 1) message.success(t('修改成功'))
        }
        show_modal.value = false
        fetchData()
      } catch (err: any) {
        // http.ts 拦截器已经全局弹出了错误翻译，这里无需额外处理，除非需要特殊拦截。
      } finally {
        saving.value = false
      }
    }
  })
}

async function handleDelete(row: UserGroup) {
  if (row.member_count > 0) {
    message.warning(t('该组织下还有人员，不允许删除'))
    return
  }
  try {
    const res = await GroupApi.delete(row.id)
    if (res.code === 200 || res.code === 1) {
      message.success(t('删除成功'))
      fetchData()
    }
  } catch (err: any) {
    // 拦截器处理错误
  }
}

onMounted(() => {
  fetchData()
})
</script>
