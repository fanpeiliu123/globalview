# GlobalView × Supabase 接入指南

你已经在用 Supabase。本指南让 **Supabase 成为唯一的数据源**：你在 Supabase 里管理真实数据，构建时自动把数据导入前端。前端保持静态（快、便宜、零运行时数据库成本），每次部署都会反映 Supabase 的最新数据。

```
        ┌──────────────┐  npm run db:push   ┌────────────┐  npm run db:export  ┌──────────────────┐
你的数据 ─▶│ realCases.json│ ─────────────────▶ │  Supabase  │ ──────────────────▶ │ realCases.json   │ ─▶ 前端构建
 (CSV)    │realPrograms.. │  (一次性载入)       │ (事实来源) │   (prebuild 自动)   │ realPrograms.json│
        └──────────────┘                     └────────────┘                     └──────────────────┘
```

> 直接在 Supabase 后台改数据也可以——前端以 `db:export` 拉到的为准。

---

## 步骤 1 · 建表

Supabase 控制台 → **SQL Editor** → New query → 粘贴 `supabase/schema.sql` 全部内容 → **Run**。
会创建 `programs`、`cases` 两张表、索引、`updated_at` 触发器，并开启 RLS（公开只读、仅 service_role 可写）。可重复执行。

## 步骤 2 · 配置密钥

1. Supabase 控制台 → **Project Settings → API**，复制：
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret（不是 anon）→ `SUPABASE_SERVICE_ROLE_KEY`
2. 在项目根目录把 `.env.example` 复制为 `.env.local` 并填入：
   ```bash
   cp .env.example .env.local
   ```
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...（service_role）
   ```
   `.env.local` 已在 `.gitignore` 中，不会被提交。
   > ⚠ **service_role 是最高权限密钥**：只用于本地脚本与构建，绝不要放进前端代码或公开仓库。

## 步骤 3 · 把数据放进 Supabase

**方式 A（推荐，能处理实习/科研/时间线等嵌套字段）：**

1. 按模板填好表格并导出 CSV：
   - 项目：`docs/program-import-template.csv`
   - 案例：`docs/case-import-template.csv`（列说明见 `docs/database-setup.md` 第 4 节）
2. 转换为结构化 JSON：
   ```bash
   npm run import:programs -- 你的项目.csv src/data/realPrograms.json
   npm run import:cases    -- 你的案例.csv src/data/realCases.json
   ```
   QS Top80 核验项目库可直接使用：
   ```bash
   npm run import:qs-verified -- /path/to/outputs_verified src/data/realPrograms.json src/data/programCatalogueStats.json
   ```
3. 校验后推送到 Supabase：
   ```bash
   npm run validate:data
   npm run db:push
   ```
   （脚本会先写 `programs` 再写 `cases`，满足外键顺序。重复推送按 `id` 自动 upsert。）

**方式 B（在 Supabase 后台直接管理）：**
用 Table Editor 手动加行，或 SQL 编辑器 `insert`，或表格 CSV 导入。
注意：列名是 **snake_case**；`tags / internships / research / highlights / timeline` 是 **jsonb**，CSV 里要填 JSON 文本，如 `["数据分析实习","BI 实习"]`。

> 想先跑通整条链路？用自带模板各导 1 行验证：
> `npm run import:programs -- docs/program-import-template.csv src/data/realPrograms.json` 和
> `npm run import:cases -- docs/case-import-template.csv src/data/realCases.json`，再 `npm run db:push`（两个模板已配成一对，programId 都是 `hku-data-science`）。

## 步骤 4 · 把数据导回前端

```bash
npm run db:export
```

它会从 Supabase 拉全量数据，写回 `src/data/realPrograms.json` 与 `src/data/realCases.json`（覆盖）。这两个文件非空后，前端自动用真实数据替换种子数据。

## 步骤 5 · 校验、构建、上线

```bash
npm run validate:data     # 外键 / 枚举 / 隐私 等校验
npm run build             # prebuild 会自动再跑一次 db:export + validate
npm run dev               # 本地预览 http://localhost:5173
```

提交并部署：

```bash
git add src/data/realPrograms.json src/data/realCases.json
git commit -m "data: load real data from supabase"
git push origin <你的分支>:main
```

## 步骤 6 · 让线上构建也能拉 Supabase（关键）

`npm run build` 前会自动跑 `db:export`。要让 **Vercel 构建时**也能从 Supabase 拉数据，需在 Vercel 配置同样的环境变量：

- Vercel 控制台 → 项目 → **Settings → Environment Variables**，给 **Production**（和 Preview）添加：
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

或用 CLI：
```bash
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

配置后每次部署都会自动拉取 Supabase 最新数据。**若不配置**，线上构建会跳过导出、使用仓库里已提交的 JSON（不会报错）。

## （可选）步骤 7 · 数据一改就自动重新部署

让"在 Supabase 改了数据→网站自动更新"：
1. Vercel → 项目 → Settings → **Git → Deploy Hooks**，创建一个 Hook，得到一个 URL。
2. Supabase → **Database → Webhooks**，对 `cases` / `programs` 表的 insert/update/delete 事件，POST 到该 Deploy Hook URL。
这样数据变更会触发一次重新构建（自动 `db:export` 拉新数据）。

---

## 命令速查

| 命令 | 作用 |
|---|---|
| `npm run db:push` | 把 `src/data/real*.json` 写入 Supabase |
| `npm run db:export` | 从 Supabase 导出到 `src/data/real*.json` |
| `npm run validate:data` | 校验数据（枚举/外键/隐私等） |
| `npm run import:programs -- in.csv out.json` | 项目 CSV→JSON |
| `npm run import:qs-verified -- outputs_verified out.json stats.json` | QS Top80 核验库→项目 JSON + 统计 JSON |
| `npm run import:cases -- in.csv out.json` | 案例 CSV→JSON |
| `npm run build` | 构建（自动 prebuild：db:export + validate） |

## 安全须知

- `service_role` key = 完整读写权限，**只在本地 `.env.local` 与 Vercel 环境变量中使用**，不要提交、不要进前端。
- 前端是公开的，进入 `cases` 的数据都视为公开 → 严格按 `docs/database-setup.md` 第 2 节脱敏。RLS 已设为「公开只读、匿名/登录用户不可写」。

## 常见问题

**Q：`db:push` 报外键错误？** 案例的 `program_id` 在 `programs` 表里不存在。先确保对应项目已在 `realPrograms.json` 并已 push（脚本会先写 programs）。

**Q：线上没更新？** 确认 Vercel 配了 `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` 并重新部署；或本地 `db:export` 后提交 `real*.json` 再 push。

**Q：想要前端实时读 Supabase（不重新部署）？** 可改为运行时用 `@supabase/supabase-js` 的 anon key + RLS 直接查询（需要把页面改成异步取数）。当前为静态导出方案，数据更新频率不高时更省更稳；需要实时可再告诉我。

**Q：数据量很大？** 导出脚本已分页（每页 1000）。当前项目库已按静态 JSON 资产懒加载，6,715 条项目不会进入主包。若真实案例上万、前端交互开始变慢，再切运行时查询方案。
