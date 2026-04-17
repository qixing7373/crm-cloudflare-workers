<!--
  @file   views/Search.vue — 搜索查重首页
  @desc   全角色可用，输入手机号/姓名搜索，展示脱敏结果，支持认领与全新录入
-->
<template>
  <div class="!max-w-[900px] !mx-auto !pt-4">
    <!-- 搜索区 Hero -->
    <n-card :bordered="false" class="!mb-8 !shadow-sm !rounded-2xl !bg-gradient-to-br !from-blue-50/50 !to-white" hoverable>
      <n-flex vertical :size="24" class="!py-6 !px-4">
        <n-flex vertical :size="8" align="center" class="!text-center">
          <n-text class="!text-[28px] !font-bold !text-gray-800">全球客户查重中心</n-text>
          <n-text depth="3" class="!text-[14px]">输入手机号、公司名称或联系人姓名，全局检索以防撞单冲突</n-text>
        </n-flex>
        
        <n-flex justify="center" class="!w-full">
          <div class="!w-full !max-w-[600px]">
            <MySearch
              v-model:value="search_text"
              size="large"
              placeholder="在此输入检索关键词..."
              input-class="!flex-1 !shadow-sm"
              btn-class="!shadow-md"
              btn-text="立即检索"
              :status="has_searched && result_list.length === 0 ? 'error' : undefined"
              :loading="is_searching"
              @search="handleSearch"
            />
            <n-flex justify="end" class="!w-full !mt-3">
              <n-checkbox v-model:checked="search_tail_only" @update:checked="handleSearch">
                精确匹配手机尾号
              </n-checkbox>
            </n-flex>
          </div>
        </n-flex>
      </n-flex>
    </n-card>

    <!-- 结果区 -->
    <n-flex v-if="has_searched" vertical :size="16">
      <!-- 状态区 / 新建入口 -->
      <n-flex justify="space-between" align="center" class="!px-2">
        <n-text depth="3">检索到 <n-text type="primary" class="!font-bold">{{ result_list.length }}</n-text> 条可能相关的记录</n-text>
        
        <n-button v-if="result_list.length === 0" type="primary" @click="handleClaimNew">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          无冲突，立即新建并认领
        </n-button>
      </n-flex>

      <!-- 无结果情况特写 -->
      <n-card v-if="result_list.length === 0" :bordered="false" class="!text-center !py-16 !bg-gray-50/50 !rounded-xl !border !border-dashed !border-gray-200">
        <n-empty description="系统内未查询到相关线索，这是一片未开发的处女地！" size="huge">
          <template #extra>
            <n-button type="primary" size="large" @click="handleClaimNew" class="!mt-4 !shadow">
              <template #icon><n-icon><AddOutline /></n-icon></template>
              点击新建并独占此客户
            </n-button>
          </template>
        </n-empty>
      </n-card>

      <!-- 结果列表 -->
      <n-card
        v-for="_contact in result_list"
        :key="_contact.id"
        :bordered="false"
        hoverable
        class="!rounded-xl !shadow-sm !transition-all"
        :class="{ '!border-l-4 !border-l-red-500': _contact._is_masked, '!border-l-4 !border-l-green-500': !_contact._is_masked }"
      >
        <n-flex justify="space-between" align="start" :wrap="false">
          <n-flex vertical :size="12" class="!flex-1 !pr-4">
            
            <n-flex align="center" :size="12">
              <n-text class="!text-[18px] !font-bold !flex !items-center !gap-2">
                <n-icon class="!text-gray-400"><CallOutline /></n-icon>
                {{ _contact.phone || '无手机号' }}
              </n-text>
              <n-tag :type="_contact.status === 'developed' ? 'error' : 'success'" size="small" class="!font-bold">
                {{ _contact.status === 'developed' ? '已开发 (锁定)' : '未开发 (游离)' }}
              </n-tag>
            </n-flex>
            
            <n-alert v-if="_contact._is_masked" type="warning" :show-icon="true" class="!py-2 !mt-1">
               该线索存在于公海或已被他人占据。为保护资产，核心扩展资料已进行强敏处理。
            </n-alert>
            
            <div v-if="!_contact._is_masked && Object.keys(parseData(_contact.data)).length > 0" class="!bg-gray-50 !p-4 !rounded-lg !mt-2">
              <n-descriptions size="small" label-placement="left" :column="2" bordered>
                <n-descriptions-item v-for="(_val, _key) in parseData(_contact.data)" :key="_key" :label="_key">
                  {{ _val }}
                </n-descriptions-item>
              </n-descriptions>
            </div>

          </n-flex>

          <n-flex :size="8" :wrap="false" vertical align="end">
             <n-popconfirm
              v-if="_contact.status === 'undeveloped'"
              @positive-click="submitClaimDirectly(_contact.phone!)"
              positive-text="确认认领"
              negative-text="手滑了"
            >
              <template #trigger>
                 <n-button type="primary" class="!w-24">
                   <template #icon><n-icon><AddOutline /></n-icon></template>
                   认领
                 </n-button>
              </template>
              确认将该客户纳入您的私域领地？系统将下发90天保护期。
            </n-popconfirm>

            <n-button
              v-if="!_contact._is_masked"
              @click="showDetail(_contact.id)"
              class="!w-24"
            >
              查看详情
            </n-button>
          </n-flex>
        </n-flex>
      </n-card>
    </n-flex>

    <!-- 侧边栏：新建并认领 (动态字段表单) -->
    <n-drawer v-model:show="show_create_drawer" :width="500" placement="right">
      <n-drawer-content title="新建并认领线索" closable>
         <n-alert type="info" :show-icon="true" class="!mb-6">
           新建下发的客户将自动归属至您的名下，并计算业绩保护期。
         </n-alert>

        <div v-if="loading_fields" class="!flex !justify-center !py-10">
          <n-spin />
        </div>
        
        <n-form v-else ref="df_form_ref" :model="dynamic_form" :rules="dynamic_rules" label-placement="top" require-mark-placement="right-hanging">
          <n-form-item v-for="field in dynamic_fields" :key="field.id" :label="field.label" :path="field.key">
            
            <n-input v-if="field.type === 'phone' || field.type === 'text'" v-model:value.trim="dynamic_form[field.key]" :placeholder="'请输入' + field.label" />
            
            <n-input-number v-else-if="field.type === 'number'" v-model:value="dynamic_form[field.key]" class="!w-full" :placeholder="'请输入' + field.label" />
            
            <n-switch v-else-if="field.type === 'boolean'" v-model:value="dynamic_form[field.key]" />
            
            <n-select v-else-if="field.type === 'select'" v-model:value="dynamic_form[field.key]" :options="parseOptions(field.options)" :placeholder="'请选择' + field.label" />
            
            <n-date-picker v-else-if="field.type === 'date'" v-model:value="dynamic_form[field.key]" type="date" class="!w-full" clearable />

            <n-input v-else v-model:value.trim="dynamic_form[field.key]" />

          </n-form-item>
        </n-form>

        <template #footer>
          <n-flex justify="end" :size="12" class="!w-full">
            <n-button @click="show_create_drawer = false">取消</n-button>
            <n-button type="primary" :loading="is_claiming || loading_fields" @click="submitCreateAndClaim">确认新建入库</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 详情模态窗 -->
    <n-modal v-model:show="show_detail_modal" preset="card" class="!max-w-[500px]" title="客户详细档案" segmented>
      <n-flex vertical :size="16" v-if="detail_target">
        <n-flex align="center" :size="12">
          <n-text class="!text-[20px] !font-bold !flex !items-center !gap-2">
            <n-icon class="!text-blue-500"><CallOutline /></n-icon>
            {{ detail_target.phone }}
          </n-text>
          <n-tag :type="detail_target.status === 'developed' ? 'error' : 'success'">
            {{ detail_target.status === 'developed' ? '已锁定业务' : '空闲游离' }}
          </n-tag>
        </n-flex>
        
        <n-divider class="!my-0" />
        
        <n-descriptions label-placement="left" :column="1" bordered size="small" class="!bg-gray-50 !rounded-lg">
          <n-descriptions-item label="入库 / 认领时间">
            {{ detail_target.claimed_at ? new Date(detail_target.claimed_at).toLocaleString() : '暂无系统记录' }}
          </n-descriptions-item>
          <n-descriptions-item v-for="(_val, _key) in parseData(detail_target.data)" :key="_key" :label="_key">
            {{ _val }}
          </n-descriptions-item>
        </n-descriptions>

        <n-alert v-if="detail_target.status === 'developed'" type="error" :show-icon="true" class="!mt-2">
          此客户已被其他业务员锁定或已经进入开发流程，全局保护中。
        </n-alert>
      </n-flex>
      <template #footer>
        <n-flex justify="end">
          <n-button @click="show_detail_modal = false">关闭档案</n-button>
        </n-flex>
      </template>
    </n-modal>

  </div>
</template>

<script lang="ts" setup>
import { CallOutline, AddOutline } from '@vicons/ionicons5'
import { claimContact, searchContacts } from '@/api/contact'
import { FieldApi, type ContactField } from '@/api/field'
import type { ContactRow } from '@/types/api'
import type { FormInst, FormRules } from 'naive-ui'
import { app } from '@pinia'

// ═══ 状态 ═══
const message = useMessage()
const search_text = ref('')
const search_tail_only = ref(false)
const result_list = ref<ContactRow[]>([])
const has_searched = ref(false)
const is_searching = ref(false)

// ── 详情弹窗 ──
const show_detail_modal = ref(false)
const detail_target = ref<ContactRow | null>(null)

// ── 认领/新建相关 ──
const is_claiming = ref(false)
const show_create_drawer = ref(false)
const df_form_ref = ref<FormInst | null>(null)

// 动态字段相关
const loading_fields = ref(false)
const dynamic_fields = ref<ContactField[]>([])
const dynamic_form = ref<Record<string, any>>({})
const dynamic_rules = ref<FormRules>({})

// ═══ 方法 ═══
async function handleSearch() {
  search_text.value = search_text.value.trim()
  const _q = search_text.value
  if (_q.length < 3) {
    message.warning('鉴于撞单几率，请输入至少3个字符的鉴别信息')
    return
  }
  is_searching.value = true
  has_searched.value = true
  try {
    const _res = await searchContacts(_q, search_tail_only.value ? '1' : undefined)
    result_list.value = _res.data || []
  } catch {
    result_list.value = []
  } finally {
    is_searching.value = false
  }
}

function parseData(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

function parseOptions(raw: string | null) {
  if (!raw) return []
  try {
    return JSON.parse(raw).map((o: any) => ({
      label: app().language === 'en-US' ? o.en || o.val : o.zh || o.val,
      value: o.val
    }))
  } catch {
    return []
  }
}

async function submitClaimDirectly(phone: string) {
  is_claiming.value = true
  try {
    await claimContact(phone)
    message.success('独家保护已生效！成功纳入您的客户版图阵列。')
    handleSearch() // 刷新结果
  } catch {
    // 拦截器自动处理错误
  } finally {
    is_claiming.value = false
  }
}

async function loadFieldsAndInitForm() {
  loading_fields.value = true
  try {
    const res = await FieldApi.list()
    if (res.code === 1) {
      // 过滤只用启用的字段
      dynamic_fields.value = res.data.filter((f) => f.enabled)

      const _form: Record<string, any> = {}
      const _rules: FormRules = {}
      const _isPotentialPhone = /^\d+$/.test(search_text.value.trim())

      dynamic_fields.value.forEach((f) => {
        // 设置初始值
        if (f.type === 'phone' && _isPotentialPhone) {
          _form[f.key] = search_text.value.trim()
        } else if (f.key === 'name' && !_isPotentialPhone) {
          _form[f.key] = search_text.value.trim()
        } else {
          _form[f.key] = f.type === 'boolean' ? false : null
        }

        // 设置动态强校验
        if (f.required) {
          _rules[f.key] = [
            { required: true, message: `必须提供 ${f.label}`, trigger: ['blur', 'change'] }
          ]
        }
      })
      dynamic_form.value = _form
      dynamic_rules.value = _rules
    }
  } catch {
    message.error('无法拉取系统字段配置')
  } finally {
    loading_fields.value = false
  }
}

function handleClaimNew() {
  loadFieldsAndInitForm()
  show_create_drawer.value = true
}

function submitCreateAndClaim() {
  df_form_ref.value?.validate(async (errors) => {
    if (!errors) {
      is_claiming.value = true
      try {
        const payload: Record<string, unknown> = {}
        let corePhone = ''

        dynamic_fields.value.forEach((f) => {
          let val = dynamic_form.value[f.key]
          if (f.type === 'phone' && !corePhone) {
            // 我们从字段里提炼出手机号作为主识别键
            corePhone = val
          } else {
            if (val !== null && val !== undefined && val !== '') {
              // 前端给后端的拓展字段存的是 field.label 作为 Key，以方便查询显示
              payload[f.label] = val
            }
          }
        })

        if (!corePhone) {
          message.error('系统配置异常：表单内未找到属于电话类型的主键。')
          return
        }

        await claimContact(corePhone, payload)
        message.success('开疆拓土！新客户已创建并无缝为您锁定保护。')
        show_create_drawer.value = false
        // 用新建的手机号重新触发一次搜索以展示其成功驻留
        search_text.value = corePhone
        handleSearch()
      } catch (e: any) {
        // AppError handled
      } finally {
        is_claiming.value = false
      }
    }
  })
}

function showDetail(id: number) {
  const _contact = result_list.value.find((c) => c.id === id)
  if (_contact) {
    detail_target.value = _contact
    show_detail_modal.value = true
  }
}
</script>
