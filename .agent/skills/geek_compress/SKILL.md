---
name: Geek Compression (极客代码极致压缩)
description: 剔除冗余，运用高阶语法糖与极限压缩思维，严控行数与缩进。
---

# Geek Compression 极客化编程核心法则

**核心目标**：逻辑高致密化。代码如齿轮般紧密咬合，能 1 行绝不 2 行，严禁防御性废话。

## 1. 命名极限压缩法则
**严禁单字母混淆，同等严禁冗长后缀。命名坚守 1-2 单词上限。**
- `i` -> `idx`, `index`
- `v` -> `val`, `item`
- `tableLoading` -> `loading`
- `detailModalVisible` -> `showModal`
- `fetchHistoryData` -> `loadList`

## 2. 绝对无分号 (No Semicolons)
**禁止行尾 `;`。**
仅在行首为 `[`, `(`, \` 时使用 `;` 防御。其余 99.9% 场景分号均视为视觉噪音，一律抹除。

## 3. 变量声明严格解耦
**严禁逗号连写变量声明。**
```typescript
// ❌ 灾难连写
const col = { ...c }, render = col.render, k = col.key;
// ✅ 逻辑分层或解构
const col = { ...c };
const { render: fn, key } = col;
```

## 4. 代码逻辑榨干法则 (语法糖极限施压)
1. **默认参数前置赋值**：用 `(raw, p = raw.replace...) => p` 取代函数体内的临时变量声明。
2. **极简卫语句 & Ternary Collapse**：无情消灭 `if-else`。使用短路 `&&` / `||` / `?.` 或连环三元 `a ? b : c ? d : e`。
3. **隐式返回 (单行定律)**：箭头函数仅一个表达式时，强拆 `{}` 和 `return`。
4. **数组流式处理**：一口气连写 `filter().map().reduce()`，拒绝临时遍历数组。
5. **内联分配**：强用 `Object.assign()`，禁止长篇属性逐项赋值。
6. **前置逻辑合并 (Inline Await Guard)**: 凡是作为防御卫语句的异步布尔型结果，严禁提炼独立常量，直接镶嵌进 `if`：严守 `if (await isValid()) return`，绞杀多余的 `isDuplicate` 等中转变量。

## 5. 架构护栏 (Guard Clauses)
**卫语句优先，异常即刻抛出，消灭嵌套缩进。**
```typescript
// ❌ 箭头地狱
if (user) { if (valid) { do() } }
// ✅ 逻辑保鲜
if (!user || !valid) return;
do();
```

## 6. CSS / 样式极客规范 (Tailwind 控制权)
1. **零内联 Style**：严禁 `:style="..."`，全盘切入 Tailwind `class`。
2. **The Exclamation Mark Rule**：功能性原子类强制加叹号夺权 (`!w-full`, `!bg-white`)，不依赖组件底层权重。

## 7. HTML 模板排版纪律 (v-text 孤立文本法则)
**严禁游离文本，全盘 v-text 接管。** 防御 Prettier 的空白格式化撕裂。
```html
<!-- ❌ 易折行产生碎片 -->
<n-button>下载『<span class="font-bold">{{ name }}</span>』</n-button>

<!-- ✅ 纯净闭合标签注入 -->
<n-button>
  <span class="font-bold" v-text="`下载『${name}』`" />
</n-button>
```
