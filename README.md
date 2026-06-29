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
- **头部项目库 Programs** — 6,715 个 QS Top80 核验硕士项目的结构化官方信息：院校、学院、学科、官方链接、语言/截止/学费可得字段与数据完整度。
- **数据与交付 Delivery** — 标准化导入脚本、字段规范、API 合约与隐私脱敏说明。
- **国际化与主题** — 中文 / English 双语，浅色 / 深色主题，均持久化到本地存储。

## 数据规模（种子数据）

- 50 个结构化匿名案例
- 6,715 个 QS Top80 官方核验硕士项目
- 80 所全球头部大学
- 20 个国家与地区
- 17 个学科方向

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

导入脚本支持 `.csv` 和 `.json`。真实案例进入系统前应先完成匿名化：姓名、邮箱、手机号、微信号、申请账号、精确住址和可反查身份的奖项编号不要进入前端库。

## 接入真实数据库

- **QS Top80 核验项目库（已导入）**：`npm run import:qs-verified -- <outputs_verified_dir> src/data/realPrograms.json src/data/programCatalogueStats.json`。
- **Supabase（已实现）**：见 `docs/supabase-setup.md`。`npm run db:push` 把数据写入 Supabase，`npm run db:export` 在构建前自动导回前端。
- **数据规范与校验**：见 `docs/database-setup.md`（字段字典、隐私脱敏、`npm run validate:data` 校验）。
- 项目真实数据放入 `src/data/realPrograms.json`，由 `/programs` 页面按需加载；案例真实数据放入 `src/data/realCases.json`（非空即替换种子案例）。

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
    programSources.ts    # 轻量项目索引（用于案例和首页兼容）
    programCatalogue.ts  # 懒加载 QS Top80 全量项目库
    programCatalogueStats.json # 轻量覆盖统计
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

当前案例为匿名合成种子数据，用于搭建产品形态和检索逻辑；项目库已接入 QS Top80 官方核验数据。项目名称、学院、学科与官方链接来自各校官网索引页；学费、截止日、语言等动态字段只在核验文件中存在时展示。后续接入真实案例文件后，可使用 `scripts/import-cases.mjs` 转换，再接入 `src/data/realCases.json` 或 Supabase 与向量检索（见 `docs/architecture.md`）。

## 路由

| 路径 | 页面 |
| --- | --- |
| `/` | 营销首页 Landing |
| `/explorer` | 案例检索（支持 `?q=关键词`） |
| `/case/:id` | 案例详情 |
| `/insights` | 数据洞察 |
| `/programs` | 头部项目库 |
| `/delivery` | 数据与交付 |
