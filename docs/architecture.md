# GlobalView Architecture

## Product Scope

当前版本只覆盖硕士研究生申请案例库。核心路径是：

1. 学生按国家/地区、大学、项目、专业方向、申请结果和自身背景筛选案例。
2. 系统展示录取、条件录取、等待名单和拒信案例。
3. 单个案例展示申请人背景、语言/标化、实习科研、材料策略和时间线。
4. AI 检索模块把自然语言问题转换为案例召回上下文。
5. 导入脚本把后续用户提供的案例文件转换为统一结构。

## Current Stack

- React 19
- Vite 8
- TypeScript
- Local TypeScript seed data
- Node import script

## Data Boundary

- `src/data/programSources.ts`: 官方项目源，用于国家、大学、项目分类。
- `src/data/cases.ts`: 匿名合成种子案例，用于跑通检索体验。
- `src/lib/types.ts`: 稳定数据模型。
- `src/lib/search.ts`: 本地筛选、评分、相似案例、AI 上下文构造。
- `src/lib/repository.ts`: 仓库接口，后续可替换为真实 API。

## Future Backend

建议迁移路径：

1. PostgreSQL 或 SQLite 存储项目、案例、申请人匿名画像、标签和导入批次。
2. 对 `strategy`、`highlights`、`timeline`、`internships`、`research` 建 embedding。
3. `/api/ai/retrieve-cases` 使用结构化筛选 + 向量召回 + rerank。
4. 后台导入流程加入隐私脱敏、重复检测、字段置信度和人工审核。
5. 扩展本科、博士、转学、奖学金、签证和学习系统模块。
