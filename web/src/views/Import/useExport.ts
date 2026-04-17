import ExcelJS from 'exceljs'
import { FieldApi } from '@/api/field'

export async function downloadTpl(t: any, msg: any) {
  try {
    const { code, data } = await FieldApi.list()
    if (code !== 1 || !data?.length) return

    const headers = data
      .filter((f: any) => f.enabled !== false)
      .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))
      .map((f: any) => f.label)

    const wb = new ExcelJS.Workbook()
    const st = wb.addWorksheet(t('数据导入模板'), { views: [{ state: 'frozen', ySplit: 1 }] })
    const bd = { style: 'thin', color: { argb: 'FF000000' } } as any
    const br = { top: bd, left: bd, bottom: bd, right: bd }

    st.columns = headers.map((k: string) => ({
      header: k,
      key: k,
      width: Math.max(16, k.length * 3 + 4),
      style: {
        font: { name: '新宋体', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left' },
        protection: { locked: false },
        numFmt: '@'
      }
    }))

    Object.assign(st.getRow(1), { height: 24 }).eachCell((c) =>
      Object.assign(c, {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF5FA' } },
        font: { name: '宋体', bold: true, size: 11, color: { argb: 'FF333333' } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: br,
        protection: { locked: true }
      })
    )

    Array.from({ length: 499 }).forEach((_, i) =>
      headers.forEach((__, j) => (st.getRow(i + 2).getCell(j + 1).border = br as any))
    )

    const getCol = (n: number): string =>
      n ? getCol(~~((n - 1) / 26)) + String.fromCharCode(65 + ((n - 1) % 26)) : ''
    st.autoFilter = `A1:${getCol(headers.length)}1`

    await st.protect(Math.random().toString(), {
      selectUnlockedCells: true,
      selectLockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: true,
      deleteRows: true,
      autoFilter: true,
      sort: true
    })

    const url = URL.createObjectURL(new Blob([await wb.xlsx.writeBuffer()]))
    const stamp = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 12)

    Object.assign(document.createElement('a'), {
      href: url,
      download: `${t('数据导入模板')}_${stamp}.xlsx`
    }).click()

    URL.revokeObjectURL(url)
  } catch {
    msg.error(t('网络通信失败，请重试'))
  }
}
