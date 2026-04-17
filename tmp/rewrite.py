import sys

translations = {
    "feat/optimization: High performance import engine & UX polish": "功能/优化: 高性能导入引擎和用户体验提升",
    "chore: add tmp folder to gitignore": "配置: 添加 tmp 文件夹到忽略列表",
    "style(import): infuse CloudUploadOutline icon into the terminal loop restarter component": "样式(导入): 将 CloudUploadOutline 图标融入组件",
    "style(import): inject matched ionic SVG semantics and typographic weighting into precheck metric headers to achieve design consistency across workflow boundaries": "样式(导入): 预检指标表头注入语义化的 SVG 图标及字重调整",
    "refactor(api): eradicate hardcoded filename placeholder fallback in favor of strict payload presence enforcement": "重构(API): 移除硬编码的文件名占位符，强制要求请求必须携带真实文件名",
    "fix(import): correct table cell alignments, enforce explicit username cascading upon ID fallback, and propagate authentic filenames spanning multipart frontend upload buffers yielding to final database log commits": "修复(导入): 修正表格单元格对齐并穿透前端真实文件名到最终日志数据表里",
    "style(import): eliminate superfluous descriptive language from the completion state to maximize visual austerity": "样式(导入): 删除完成态中多余的引导文字，实现绝对的极简视觉",
    "style(import): eliminate legacy cautionary alert banner from step 3 to pursue absolute interface minimalism": "样式(导入): 去除步骤3老旧的警告横幅",
    "feat(import): elevate maximal import capacity threshold to 100,000 records accommodating moderately aggressive bulk operations alongside 20MB file buffer expansions": "功能(导入): 将最大导入阈值提升至 10w 条并支持20MB体积",
    "fix(import): eradicate overlapping error toast collisions originating from dual-layered catch block handling against the global axios interceptor payload": "修复(导入): 消除双重拦截器引发的重复弹窗重叠问题",
    "test(api): fortify test matrices with rigorous boundary validation verifying deterministic rejection of expired import tokens exceeding the 15-minute operational window": "测试(API): 严格核实超过 15 分钟失效的上传 Token 的拦截机制",
    "refactor(api): excise hard-coded text validation assertions from the import confirmation endpoint syncing with frontline orchestration overhaul": "重构(API): 清除多余的断言以适配前线的深度重构",
    "style(import): augment regression controls with primary spectral highlighting mapped to brand semantic core": "样式(导入): 为后退控制钮重打全局主色高亮映射",
    "style(import): normalize regression keys into native semantic standard context rendering": "样式(导入): 归一化回退按钮原色",
    "style(import): applying anti-design pattern to regress primary interaction nodes into grayscale to thwart impulsive engagements": "样式(导入): 将次要交互节点归置为灰色按钮",
    "refactor(import): eradicate input-based confirmation mechanics and streamline backwards propagation while synchronizing architectural documentation": "重构(导入): 全面精简系统回退流程抛弃基于输入打字的确认",
    "style(import): eliminate step-3 floating header and enforce geometric centralization across pre-validation metrics while anchoring regression controls symmetrically to the bottom validation pane": "样式(导入): 实现预检数据点的全局居中与回归大按钮沉底",
    "feat(import): decompose report metrics into 5 explicit horizontal dimensions precisely mirroring historical table ontology": "功能(导入): 拓展分析报告度量至5维大盘全景",
    "build(import): decouple monolithic import orchestrator bifurcating wizard logic into a deeply specialized standalone component": "架构(导入): 将向导组件模块化分流",
    "style(import): superimpose backwards arrow geometry onto the rollback fallback establishing congruent visual telemetry": "样式(导入): 退后操作按钮加上骨骼箭头",
    "style(import): relocate navigation fallback control to bottom pane aligning with natural step progression ergonomics": "样式(导入): 撤销按钮移到页面下方防冲撞",
    "docs(import): translate internal template comments and system script annotations to native chinese context": "文档(导入): 中文化重构内部模板注释体系",
    "style(import): inject descriptive semantic icons into primary action buttons bridging the entry step conversion": "样式(导入): 将语义化图标注入操作按钮",
    "style(import): demolish passive empty-state placeholder in favor of a vibrant interactive hero component for the entry stage": "样式(导入): 删除并替换白板空窗页面为可交互组件",
    "style(import): minimalize state progression button label per operator request": "样式(导入): 缩减主操作进展按键字数",
    "style(import): eliminate wizard step description text nodes allowing for a stark minimalist horizontal alignment track": "样式(导入): 抹除向导多余解说文字铺设全流线极简框架",
    "style(import): prefix strict tailwind important markers to component containment directives conforming to internal UI architecture": "样式(导入): 追加 Tailwind CSS 修饰符以收敛框架边界",
    "fix(import): restore missing wizard progress indicator after accidental ablation": "修复(导入): 修复丢失的向导步骤条",
    "feat(import): bridge bidirectional state navigation implementing native fallback mechanism within upload stage": "功能(导入): 在传输装载层对接上下退避的机制",
    "feat(import): introduce secure step-back regression capabilities across the UI wizard preventing pipeline dead-ends": "功能(导入): 向界面贯通式引入退步溯源流",
    "style(import): obliterate visual step progress indicator per manual business override": "样式(导入): 物理删除界面多余的可视步骤刻度尺",
    "style(import): rewrite wizard positioning wrapper fixing flex shrink constraints to ensure true mathematical alignment across step nodes": "样式(导入): 修正进度对不齐现象",
    "style(import): soften wizard typography replacing overly aggressive database terminology with natural conversational six-character descriptions": "样式(导入): 对向导步的词汇表述作口语化平滑修饰",
    "style(import): professionalize wizard step vernacular enforcing strict 8-character structural alignment and enterprise wording": "样式(导入): 统一规范大字化企业级文本语源",
    "style(import): center align wizard progression tracker and fully segregate template drafting from data upload sub-states ensuring robust 4-way step flow": "样式(导入): 建立横穿四步平铺的数据导入全链路UI层",
    "feat(import): redesign import workflow introducing native n-steps wizard bridging file ingestion, structural pre-cleansing, and secure submittal": "功能(导入): 支持 N-Steps 数据向导流",
    "fix(import): replace abstract english algorithmic error trace with native chinese localized default text": "修复(导入): 置换成全套中文化报错指引文本",
    "fix(import): align success response codes with HotGo standards instead of standard proxy bounds": "修复(导入): 数据总纲接口成功响应态协议化",
    "fix(import): unlock strict stateless list arrays to allow UI queue ingestion and patch localized translation hooks": "修复(导入): 解锁硬编码字典以引入翻译组件",
    "fix(import): prefix missing /api base namespace onto history fetching endpoint to properly egress proxy routing": "修复(导入): 补充丢失的 /api 基准端号以完成接口定位",
    "refactor(data-table): unify columns component architectures dynamically aliasing files to generic columns.ts convention": "重构(表格): 统一多列管理映射为 columns.ts 体系",
    "refactor(import): extract massive ExcelJS synthesis payload into modular utility to mitigate Component density and decouple pure functional boundaries": "重构(导入): 将巨大的 Excel 模板拼装器分离为一个解耦外延函数",
    "fix(import): enforce literal text typing logic across template columns to secure robust data pipelines against excel numeric casting vulnerabilities": "修复(导入): 防御文本计算溢出转换",
    "style(import): enforce CJK monospaced compatibility by switching global template fonts to standard SimSun family": "样式(导入): 强制全屏新宋体等宽展示",
    "style(import): enforce high-contrast standard absolute black border lines per business stylistic override": "样式(导入): 调教下载导出的模板为全素黑纯色格线",
    "style(import): visually anchor template layout by scoping input bounds via thin-borders and centering table headers symmetrically": "样式(导入): 框出模板可输范围以增强视觉向导",
    "feat(import): rebuild excel template layout natively locking headers and autotracking formats, and localize filename generation pattern": "功能(导入): 锁定顶冻并重设客户端生成机制",
    "style(import): minimalize header taking out textual titles and re-align single standalone template download button to left border": "样式(导入): 样板下载靠左呈现",
    "style(import): eliminate legacy .xls format support": "样式(导入): 禁绝旧版 .xls 类型输入漏洞",
    "style(import): eliminate .txt support from upload formats per business rules": "样式(导入): 清缴 .txt 上传后门支持",
    "feat(import): implement dynamic frontend csv template generation": "功能(导入): 落地前端动态CSV模板表能力",
    "refactor: move http.ts to plugins/axios.ts": "重构: 收束 http 请求基类进入 axios 控制站",
    "refactor(i18n): unify Fields table headers to use Chinese fallback strings": "重构(I18N): 校整源字段纯中文化降级词语",
    "refactor(i18n): unify Import table headers to use Chinese fallback strings": "重构(I18N): 收编底层语库用汉字表",
    "chore(db): add latest drizzle migration files": "配置(库): 落盘最近期数据库架构文件",
    "refactor(i18n): migrate localization paradigm to Chinese-Base": "重构(I18N): 将底层语系主推中文",
    "refactor(web): tailwind styles & i18n cleanup": "重构(前端): Tailwind 样式调优与多语言瘦身",
    "style(web): standardize input width configuration using tailwind CSS": "样式(前端): 统一全局搜索域尺度规制",
    "style(web): prevent full-width stretching of search input group": "样式(前端): 杜绝搜索框过度散乱扩增",
    "feat(web): add i18n support for import history search UI": "功能(前端): 为历史查库搜检提供双语言支持",
    "style(web): use n-input-group for unified search input aesthetic": "样式(前端): 改用组合槽紧凑搜索带",
    "style(web): set min-width for import search input using tailwind": "样式(前端): 强化输入框极端尺寸抗性",
    "style(web): simplify placeholder and remove fixed search input width": "样式(前端): 放开搜索框宽度定死限制",
    "style(web): refine search input placeholder and width for clarity": "样式(前端): 润化空缺态暗字改善视觉",
    "style(web): move search input outside of card header slots to ensure visibility": "样式(前端): 下放搜索框避开遮挡",
    "fix(web): use n-flex instead of n-input-group to ensure search button is visible": "修复(前端): 淘汰紧凑组装件解开尾部按键挤兑",
    "feat(import): display operant username instead of UID in history": "功能(导入): 历史名册挂真实名字",
    "style(web): refine table column batch no and fix backend import": "样式(前端): 修正版块行记以及暗合后管输送通道",
    "refactor(web): remove obsolete Batch Import key and use Import exclusively": "重构(前端): 铲平旧号全部归约唯一导库菜单",
    "fix(web): unify i18n translation for import terminology": "修复(前端): 统一专业术语译用约束",
    "feat(import): add fuzzy search functionality to import history": "功能(导入): 全面放开导录快检器",
    "style(web): remove history section heading and rename UID column": "样式(前端): 洗去多余标题并更换列名",
    "feat(web, api): remove explanatory text and support .txt file parsing": "功能(前后端): 支持加载原始 .txt 文书",
    "feat(web): update Import.vue to use drag-and-drop and responsive table": "功能(前端): 导入功能拥抱流式阵列兼重塑推拉力体验"
}

msg = sys.stdin.read().strip()
lines = msg.split('\n')
if not lines:
    print(msg)
else:
    head = lines[0].strip()
    translated = translations.get(head, head)
    if translated != head:
        lines[0] = translated
        # Must output UTF-8 encoding successfully without print errors
        sys.stdout.buffer.write(('\n'.join(lines)).encode('utf-8'))
    else:
        sys.stdout.buffer.write(msg.encode('utf-8'))
