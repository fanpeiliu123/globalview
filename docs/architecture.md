# GlobalView Architecture

## Product Scope

GlobalView 是一个面向中国留学生的硕士研究生申请案例情报库与交付平台。核心路径：

1. 学生/顾问按国家、大学、项目、专业方向、申请结果和背景层级检索案例（Explorer）。
2. 系统展示录取、条件录取、等待名单和拒信案例，并提供单个案例的完整画像（Case Detail）。
3. 数据洞察页把案例库聚合为可视化趋势，辅助定位、选校与材料策略（Insights）。
4. AI 检索模块把自然语言问题转换为案例召回上下文（AiAssist）。
5. 头部项目库提供结构化官方项目信息（Programs）。
6. 数据与交付页定义导入流程、字段规范与 API 合约（Delivery）。

## Stack

- React 19 + React Router 7（`BrowserRouter`，Vercel SPA rewrite）
- Vite 8 + TypeScript（strict）
- 纯 CSS 设计系统：`src/styles/{tokens,base,layout,pages}.css`
  - 设计令牌（颜色 / 字体 / 圆角 / 阴影 / 动效）+ `[data-theme="dark"]` 深色模式
- 零运行时图表：`src/components/charts/Charts.tsx`（SVG / CSS）
- i18n：`src/i18n`（中英文字典 + Provider + `t()` 插值）
- 主题：`src/theme/ThemeProvider`（持久化 + 防闪烁内联脚本见 `index.html`）

## Data Boundary

- `src/data/programSources.ts`: 官方项目源（国家、大学、项目分类与排名/学费/截止等元数据）。
- `src/data/cases.ts` + `src/data/casesExtra.ts`: 匿名合成种子案例。
- `src/data/allCases.ts`: 合并后的单一数据源，被 `search.ts` / `analytics.ts` / `repository.ts` 消费。
- `src/lib/types.ts`: 稳定数据模型。
- `src/lib/geo.ts`: 国家/地区元数据（中英文、旗帜、区域分组）。
- `src/lib/search.ts`: 本地筛选、评分、排序、相似案例、AI 上下文构造。
- `src/lib/analytics.ts`: 洞察页的派生统计（结果结构、分布、区间、节奏）。
- `src/lib/repository.ts`: 仓库接口，后续可替换为真实 API。

## Replacing Seed Data with Real Data

1. 用 `scripts/import-cases.mjs` 把 CSV/JSON 转换为 `CaseRecord[]`。
2. 完成匿名脱敏（见隐私字段清单）。
3. 把结果合并进 `src/data/allCases.ts`，或让 `repository.ts` 改为请求后端 API。
4. 前端无需改动检索/洞察逻辑——它们都基于 `allCases` 与稳定的 `types.ts`。

## Future Backend

建议迁移路径：

1. PostgreSQL 或 SQLite 存储项目、案例、申请人匿名画像、标签和导入批次。
2. 对 `strategy`、`highlights`、`timeline`、`internships`、`research` 建 embedding。
3. `/api/ai/retrieve-cases` 使用结构化筛选 + 向量召回 + rerank。
4. 后台导入流程加入隐私脱敏、重复检测、字段置信度和人工审核。
5. 扩展本科、博士、转学、奖学金、签证和选校系统模块。

## Deployment

- Vercel（`vercel.json`：Vite framework + SPA rewrite 到 `index.html`）。
- 构建命令 `npm run build`，输出 `dist`。
