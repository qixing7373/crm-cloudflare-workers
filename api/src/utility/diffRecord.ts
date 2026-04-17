/**
 * @file   diffRecord.ts — 对象差异比较工具
 * @desc   比较两个 Record 的所有 key，返回值不同的字段及其 old/new 值
 *         用于生成导入更新时的 changes 变更日志
 */
export const diffRecord = (o: Record<string, unknown>, n: Record<string, unknown>) =>
  [...new Set([...Object.keys(o), ...Object.keys(n)])].reduce((acc, k) => {
    const oldStr = String(o[k] ?? '').trim()
    const newStr = String(n[k] ?? '').trim()
    if (oldStr !== newStr) {
      acc[k] = { old: oldStr || null, new: newStr || null }
    }
    return acc
  }, {} as Record<string, { old: unknown; new: unknown }>)

