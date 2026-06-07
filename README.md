# GlobalView · 硕士研究生申请案例情报库与交付平台

GlobalView 是面向中国留学生的**世界一流硕士研究生申请案例库与交付平台**。它把分散的历史申请案例沉淀为可检索、可洞察、可交付的结构化情报，覆盖全球头部院校的硕士项目。

> Master's admissions case intelligence — searchable precedents, admissions insights, AI matching and a clean data-delivery layer.

## 线上地址

- Public site: https://globalview-kappa.vercel.app
- GitHub: https://github.com/fanpeiliu123/globalview

## 核心能力

- **案例检索 Explorer** — 按国家/地区、大学、项目、专业方向、本科层级、GPA、语言/标化多维筛选；匹配度 / GPA / 时间排序；活跃筛选标签；并排对比；右侧即时详情。
- **数据洞察 Insights** — 结果结构、国家分布、专业方向、本科层级录取结构、GPA 区间、申请季节奏、案例最多的项目，全部以自绘 SVG/CSS 图表呈现。
- **AI 智能匹配** — 自然语言描述背景与目标，召回最相关案例并生成检索上下文，可一键应用推荐筛选。
- **头部项目库 Programs** — 36 个头部硕士项目的结构化官方信息：QS 参考排名、学制、入学、截止、学费与 STEM 属性。
- **数据与交付 Delivery** — 标准化导入脚本、字段规范、API 合约与隐私脱敏说明。
- **国际化与主题** — 中文 / English 双语，浅色 / 深色主题，均持久化到本地存储。

## 数据规模（种子数据）

- 50 个结构化匿名案例
- 36 个头部硕士项目
- 10 个国家与地区（美国 / 加拿大 / 英国 / 瑞士 / 德国 / 荷兰 / 新加坡 / 中国香港 / 日本 / 澳大利亚）

## 技术栈

- React 19 + React Router 7
- Vite 8 + TypeScript（严格模式）
- 纯 CSS 设计系统（设计令牌、深色模式、动效）
- 零运行时图表（自绘 SVG / CSS）
- 本地 TypeScript 种子数据 + 仓库抽象层（便于替换为真实 API / 数据库）

## 运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 导入案例

```bash
npm run import:cases -- docs/case-import-template.csv data/generated-cases.json
```

导入脚本支持 `.csv` 和 `.json`。真实案例进入系统前应先完成匿名化：姓名、邮箱、手机号、微信号、申请账号、精确住址和可反查身份的奖项编号不要进入前端库。导入后将结果合并进 `src/data/allCases.ts` 或对接服务端数据库。

## 目录结构

```
src/
  main.tsx               # 入口：Theme / i18n / Router providers + 全局样式
  App.tsx                # 路由与页面骨架（Header / Footer / Routes）
  i18n/                  # 中英文字典与 I18nProvider
  theme/                 # 浅色/深色 ThemeProvider
  lib/
    types.ts             # 稳定数据模型
    geo.ts               # 国家/地区元数据（中英文、旗帜、区域）
    search.ts            # 检索、评分、排序、相似案例、AI 上下文
    analytics.ts         # 洞察页的派生统计
    repository.ts        # 仓库接口（后续替换为真实 API）
    useDocumentMeta.ts   # 每个路由的标题/描述
  data/
    programSources.ts    # 官方项目源（36 个）
    cases.ts             # 种子案例（24）
    casesExtra.ts        # 扩展合成案例（26）
    allCases.ts          # 合并后的数据集（单一数据源）
  components/
    layout/              # SiteHeader / SiteFooter / 主题与语言切换
    ui/common.tsx        # BrandMark / ResultPill / CountryTag / Reveal
    charts/Charts.tsx    # Donut / BarList / Column / StackedBar / AreaLine
    AiAssist.tsx         # AI 智能匹配面板
  pages/                 # Landing / Explorer / CaseDetail / Insights / Programs / Delivery / 404
  styles/                # tokens / base / layout / pages
docs/                    # 架构、API 合约、导入模板
```

## 数据说明

当前案例均为匿名合成种子数据，用于搭建产品形态和检索逻辑；项目名称、排名与分类来自官方项目页面（以官方页面为准）。后续接入真实案例文件后，可使用 `scripts/import-cases.mjs` 转换，再合并进 `src/data/allCases.ts` 或接入服务端数据库与向量检索（见 `docs/architecture.md`）。

## 路由

| 路径 | 页面 |
| --- | --- |
| `/` | 营销首页 Landing |
| `/explorer` | 案例检索（支持 `?q=关键词`） |
| `/case/:id` | 案例详情 |
| `/insights` | 数据洞察 |
| `/programs` | 头部项目库 |
| `/delivery` | 数据与交付 |
