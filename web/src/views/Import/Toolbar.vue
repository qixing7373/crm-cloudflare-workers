<template>
  <n-space>
    <n-button secondary type="primary" @click="downloadTpl(t, msg)">
      <template #icon><n-icon :component="CloudDownload" /></template>
      {{ t('下载标准模板') }}
    </n-button>
    <n-upload
      accept=".xlsx,.csv"
      class="!inline-block"
      :show-file-list="false"
      :custom-request="onUpload"
      :disabled="isParsing"
    >
      <n-button type="primary" :loading="isParsing">
        <template #icon><n-icon :component="PushOutline" /></template>
        {{ t('导入客户数据') }}
      </n-button>
    </n-upload>
  </n-space>
</template>

<script lang="ts" setup>
import { CloudDownload, PushOutline } from '@vicons/ionicons5'
import { downloadTpl } from './useExport'
import { parseAndClean } from './useParse'
import { FieldApi } from '@/api/field'
import { ImportApi } from '@/api/import'
import { generateBatchId, insertImportData, checkBatchByHash } from '@/plugins/localDb'
import { startSyncEngine } from '@/plugins/syncEngine'

const emit = defineEmits(['success'])
const t = inject('import-t') as any
const msg = useMessage()
const dialog = useDialog()
const isParsing = ref(false)

const ERROR_MESSAGE_MAP = computed<Record<string, string>>(() => ({
  EMPTY_FILE: t('空文件'),
  NO_PHONE_COLUMN: t('未找到『手机』列'),
  NO_VALID_ROWS: t('空数据')
}))

async function verifyUniqueOrReject(fileHash: string, onError: Function) {
  const isLocalExist = await checkBatchByHash(fileHash)
  const serverCheckRes = !isLocalExist ? await ImportApi.verifyHash(fileHash) : null

  if (isLocalExist || serverCheckRes?.data?.exists) {
    dialog.error({
      closeFocusable: true,
      maskClosable: false,
      closable: false,
      title: t('拒绝导入'),
      content: t('请勿重复导入相同的数据文件'),
      positiveText: t('我知道了')
    })
    isParsing.value = false
    onError()
    return true
  }
  return false
}

async function onUpload({ file: { file }, onFinish, onError }: any) {
  if (!file) return
  isParsing.value = true

  try {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    if (await verifyUniqueOrReject(fileHash, onError)) return

    const { data: fields = [] } = await FieldApi.list()
    const { clean_list, file_name, headers } = await parseAndClean(
      file,
      fields.filter((f: any) => f.enabled !== false)
    )

    const batchId = generateBatchId()
    await insertImportData(batchId, file_name, fileHash, clean_list.length, clean_list, headers)

    msg.success(t('已加入同步队列'))
    startSyncEngine()
    emit('success', batchId)
    onFinish() // Notification hook to Naive UI
  } catch (err: any) {
    msg.error(ERROR_MESSAGE_MAP.value[err.message] || t(`解析失败: ${err.message}`))
    onError() // Notification hook to Naive UI
  } finally {
    isParsing.value = false
  }
}
</script>
