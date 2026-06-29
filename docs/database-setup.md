# GlobalView 数据库构建与数据接入文档

本文档手把手教你把**真实数据**放入指定位置，替换当前的合成种子数据，让 GlobalView 成为一个完善、可信、可商用的硕士申请案例数据库。

> 一句话路线：先用 **方式 A（静态数据，10 分钟见效，零代码）** 让真实数据上线；当数据量大或需要多人写入时，再升级到 **方式 B（真实数据库 + 自动导出）**。

---

## 0. 两种落地方式怎么选

| | 方式 A · 静态数据 | 方式 B · 真实数据库 |
|---|---|---|
| 数据存放 | `src/data/realPrograms.json`、`src/data/programCatalogueStats.json`、`src/data/realCases.json` | PostgreSQL / Supabase |
| 是否需要服务器 | 否 | 是（仅构建期或运行期） |
| 适用规模 | 已验证 6,715 条项目；案例建议分批接入 | 不限 |
| 多人协作写入 | 不适合 | 适合 |
| 改动成本 | **零代码**，只放数据 | 建表 + 1 个导出脚本 |
| 上手时间 | 约 10 分钟 | 约 1–2 小时 |

> 案例检索、洞察、图表逻辑基于统一案例数据集 `src/data/allCases.ts`；全量项目库由 `src/data/programCatalogue.ts` 在 `/programs` 页面按需加载 `realPrograms.json`，首页和洞察页只读取轻量统计 `programCatalogueStats.json`。

---

## 1. 数据模型（字段字典）

> 唯一事实来源是 `src/lib/types.ts`。下面是给「填数据的人」看的对照表。

### 1.1 枚举值（必须严格使用以下取值）

| 枚举 | 允许值 |
|---|---|
| `country`（国家代码） | `US` `UK` `CA` `AU` `SG` `HK` `CH` `DE` `NL` `JP` `CN` `FR` `KR` `MY` `TW` `SE` `SA` `BE` `IE` `NZ` |
| `result`（申请结果） | `admit`（录取） `conditional`（条件录取） `waitlist`（等待名单） `reject`（拒信） |
| `discipline`（专业方向） | `计算机与数据` `商业分析` `管理与市场` `信息系统` `金融商科` `工程与技术` `医学与健康` `人文学科` `商业与管理` `社会科学` `艺术设计与建筑` `教育` `计算机与信息技术` `生命科学与生物` `经济与金融` `数据科学与人工智能` `环境与可持续发展` `自然科学` `法学` `公共政策与管理` `数学与统计` `媒体与传播` |
| `undergradTier`（本科层级） | `C9/985` `211` `双非一本` `中外合作` `海外本科` |
| `selectivity`（项目竞争度） | `高竞争` `中高竞争` `稳健匹配` |

> 需要新增国家或方向？先在 `src/lib/types.ts` 与 `src/lib/geo.ts`（国家）或字典 `src/i18n/dict.ts`（方向英文名）里登记，再使用。

### 1.2 项目表 ProgramSource（`realPrograms.json` 的每个元素）

| 字段 | 必填 | 类型 | 示例 | 说明 |
|---|---|---|---|---|
| `id` | ✅ | string | `hku-data-science` | 全局唯一，小写中划线；案例用它做外键 |
| `country` | ✅ | 枚举 | `HK` | 见 1.1 |
| `countryName` | ✅ | string | `中国香港` | 中文国家名 |
| `city` | ✅ | string | `Hong Kong` | |
| `university` | ✅ | string | `The University of Hong Kong` | 英文校名 |
| `universityCn` | ✅ | string | `香港大学` | 中文校名 |
| `program` | ✅ | string | `MSc in Data Science` | 英文项目名 |
| `programZh` | ⬜ | string | `數據科學理學碩士` | 中文项目名（如官网提供） |
| `degree` | ✅ | string | `MSc` | 学位简称 |
| `discipline` | ✅ | 枚举 | `计算机与数据` | 见 1.1 |
| `duration` | ✅ | string | `1-2 年` | 学制 |
| `intake` | ✅ | string | `September` | 入学季 |
| `selectivity` | ✅ | 枚举 | `中高竞争` | 见 1.1 |
| `officialUrl` | ✅ | string(url) | `https://...` | 官方项目页 |
| `sourceNote` | ⬜ | string | `项目信息以官方页面为准。` | 数据来源备注 |
| `tags` | ⬜ | string[] | `["data science","ml"]` | 标签 |
| `qsRank` | ⬜ | number | `17` | QS 参考排名 |
| `universityId` | ⬜ | string | `hku` | 院校稳定 ID |
| `faculty` / `department` | ⬜ | string | `Faculty of Engineering` | 学院 / 系 |
| `rawDiscipline` | ⬜ | string | `Computer Science & IT` | 原始英文学科分类 |
| `tuition` | ⬜ | string | `约 HK$240,000 / 项目` | 学费参考 |
| `deadlineNote` | ⬜ | string | `主轮 12 月至 3 月` | 截止参考 |
| `languageRequirements` | ⬜ | string | `TOEFL iBT 79 or IELTS 6.0` | 语言要求 |
| `greRequired` | ⬜ | string | `Optional` | GRE/GMAT 要求 |
| `entryRequirements` | ⬜ | string | `Bachelor's degree...` | 入学要求摘要 |
| `sourceUrls` | ⬜ | string[] | `["https://..."]` | 来源页 |
| `dataCompleteness` | ⬜ | number | `47` | 字段完整度百分比 |
| `lastUpdated` | ⬜ | string | `2026-06-29` | 核验更新时间 |
| `stemDesignated` | ⬜ | boolean | `true` | 是否 STEM |

### 1.3 案例表 CaseRecord（`realCases.json` 的每个元素）

| 字段 | 必填 | 类型 | 示例 | 说明 |
|---|---|---|---|---|
| `id` | ✅ | string | `GV-MS-2026-001` | 全局唯一案例编号 |
| `applicantAlias` | ⬜ | string | `A同学` | **匿名别名，禁止真实姓名** |
| `degreeLevel` | ✅ | `"master"` | `master` | 目前仅硕士 |
| `programId` | ✅ | string | `hku-data-science` | **外键 → 项目表 `id`** |
| `country` `countryName` `university` `universityCn` `program` `discipline` | ✅ | — | — | 建议与所选项目保持一致 |
| `result` | ✅ | 枚举 | `admit` | 见 1.1 |
| `season` | ✅ | string | `2026 Fall` | 申请季 |
| `round` | ⬜ | string | `Round 1` | 轮次 |
| `offerDate` | ⬜ | string | `2026-03-18` | 结果日期，`YYYY-MM-DD` |
| `scholarship` | ⬜ | string | `无` / `小额奖学金` | 奖学金 |
| `profile` | ✅ | object | 见下 | 申请人匿名画像 |
| `strategy` | ✅ | string | `文书主线聚焦…` | 申请策略 / 复盘 |
| `timeline` | ⬜ | string[] | `["8月选校","10月提交"]` | 时间线 |
| `tags` | ⬜ | string[] | `["高GPA","科研"]` | 标签 |
| `sourceType` | ⬜ | string | `partner-verified` | 取值：`seed-synthetic` / `user-imported` / `partner-verified` |
| `privacyLevel` | ✅ | `"anonymous"` | `anonymous` | 必须为 anonymous |

**`profile`（ApplicantProfile）字段：**

| 字段 | 必填 | 类型 | 示例 | 说明 |
|---|---|---|---|---|
| `undergradSchool` | ⬜ | string | `华东地区 985` | **只到地区+层级，禁止具体校名指向个人** |
| `undergradTier` | ✅ | 枚举 | `C9/985` | 见 1.1 |
| `major` | ✅ | string | `统计学` | 本科专业 |
| `gpa` | ✅ | number(0–4.3) | `3.88` | **统一换算为 4 分制**；百分制请折算 |
| `gpaScale` | ⬜ | number | `4` | 默认 4 |
| `gpaText` | ✅ | string | `3.88/4.0` 或 `88/100` | 原始展示文本 |
| `language` | ⬜ | object | `{ "toefl": 112 }` 或 `{ "ielts": 7.5 }` 或 `{}` | 二选一或留空 |
| `tests` | ⬜ | object | `{ "gre": 331 }` 或 `{ "gmat": 710 }` 或 `{}` | 二选一或留空 |
| `internships` | ⬜ | string[] | `["量化研究实习"]` | 实习 |
| `research` | ⬜ | string[] | `["一作论文"]`，无则 `["无"]` | 科研 |
| `workExperienceMonths` | ⬜ | number | `0` | 工作月数 |
| `highlights` | ⬜ | string[] | `["数学基础强"]` | 材料亮点 |

> **外键规则（重要）**：每条案例的 `programId` 必须能在项目表里找到同名 `id`，否则项目详情、相似案例会断链。`npm run validate:data` 会自动检查。

---

## 2. 隐私与脱敏（强制，先读这一节）

进入前端库的所有数据都视为「公开」。以下信息**绝对不能**出现在 `realCases.json` 任何字段里：

- 真实姓名、英文名、昵称
- 邮箱、手机号、微信号 / QQ、申请系统账号
- 精确住址、身份证 / 护照号、学号
- 可反查身份的奖项编号、唯一作品链接
- 能定位到唯一个人的具体本科校名 + 专业 + 届别组合（用「地区 + 层级」代替，如「华东地区 985」）

规则：`applicantAlias` 用别名（A同学 / 候选人001），`privacyLevel` 固定 `anonymous`。
`npm run validate:data` 会扫描邮箱、手机号、微信号并报错/告警，但**人工复核仍是第一责任**。

---

## 3. 方式 A：静态数据接入（推荐先做）

### 指定位置一览

| 放什么 | 放到哪里 | 怎么生成 |
|---|---|---|
| 项目数据 | `src/data/realPrograms.json` | 手填，`npm run import:programs`，或 `npm run import:qs-verified` |
| 项目统计 | `src/data/programCatalogueStats.json` | `npm run import:qs-verified` 自动生成 |
| 案例数据 | `src/data/realCases.json` | `npm run import:cases` |
| 校验 | — | `npm run validate:data` |

> `realCases.json` 初始是空数组 `[]`，此时网站显示内置种子案例；一旦非空就会替换种子案例。`realPrograms.json` 当前已填充 QS Top80 核验项目库，并由 `/programs` 页面按需加载，避免拖慢首页。

### 步骤 3.1 准备项目数据

**方式①（少量、最直接）**：直接编辑 `src/data/realPrograms.json`，按 1.2 的字段写成对象数组。例如：

```json
[
  {
    "id": "hku-data-science",
    "country": "HK",
    "countryName": "中国香港",
    "city": "Hong Kong",
    "university": "The University of Hong Kong",
    "universityCn": "香港大学",
    "program": "MSc in Data Science",
    "degree": "MSc",
    "discipline": "计算机与数据",
    "duration": "1-2 年",
    "intake": "September",
    "selectivity": "中高竞争",
    "officialUrl": "https://www.hku.hk/",
    "sourceNote": "项目信息以官方页面为准。",
    "tags": ["data science", "machine learning"],
    "qsRank": 17,
    "tuition": "约 HK$240,000 / 项目",
    "deadlineNote": "主轮 12 月至 3 月",
    "stemDesignated": true
  }
]
```

**方式②（批量，推荐）**：用 Excel/表格按模板 `docs/program-import-template.csv` 填好，导出 CSV，然后：

```bash
npm run import:programs -- 你的项目表.csv src/data/realPrograms.json
```

**方式③（QS Top80 核验库，当前采用）**：从核验输出目录生成全量项目库和轻量统计：

```bash
npm run import:qs-verified -- /path/to/outputs_verified src/data/realPrograms.json src/data/programCatalogueStats.json
```

该脚本读取 `programs.json` 与 `universities.json`，生成 6,715 个 `ProgramSource` 对象，并同时生成首页/洞察页使用的轻量覆盖统计。

### 步骤 3.2 准备案例数据

用模板 `docs/case-import-template.csv` 填好（列说明见第 4 节），导出 CSV，然后：

```bash
npm run import:cases -- 你的案例表.csv src/data/realCases.json
```

脚本会自动把 `语言`、`标化`、`实习/科研/标签/时间线` 等文本解析成结构化字段。

> 也支持 JSON 输入：`npm run import:cases -- 你的案例.json src/data/realCases.json`。

### 步骤 3.3 自动切换（无需改代码）

只要 `realPrograms.json` / `realCases.json` 是非空数组，构建时就会用真实数据替换种子数据。你不需要改任何 `.ts` 文件。

### 步骤 3.4 校验数据

```bash
npm run validate:data
```

它会检查：必填字段、枚举取值、**案例 `programId` 外键**、id 是否重复、GPA 是否在 0–4.3、日期格式，并扫描隐私泄露。看到 `✓ 校验通过` 才进入下一步；有 `✗ 错误` 请按提示修复。

### 步骤 3.5 本地预览与上线

```bash
npm run dev        # 本地看效果： http://localhost:5173
npm run build      # 生产构建（会跑 TypeScript 类型检查）
```

确认无误后提交并推送（GitHub → Vercel 自动部署）：

```bash
git add src/data/realPrograms.json src/data/realCases.json
git commit -m "data: load real programs & cases"
git push origin <你的分支>:main
```

> 当前全量项目库不会内联进主包：Vite 会把 `realPrograms.json` 输出为独立静态 JSON 资产，只有进入 `/programs` 时才下载。

---

## 4. CSV 字段对照与填写规范

### 4.1 案例 CSV 列（`docs/case-import-template.csv`）

`country, countryName, university, universityCn, program, programId, discipline, result, season, round, offerDate, scholarship, undergradSchool, undergradTier, major, gpa, gpaScale, gpaText, language, tests, internships, research, workExperienceMonths, highlights, strategy, timeline, tags`

填写要点：

- **列表字段**（`internships` `research` `highlights` `timeline` `tags`）用 `;` 或 `；` 分隔，例：`量化研究实习；数据科学实习`。
- **`language`** 写成可识别文本：`TOEFL 112` 或 `IELTS 7.5`；不参加填空。
- **`tests`** 写 `GRE 331` 或 `GMAT 710`；未提交填空。
- **`gpa`** 填 4 分制数字（如 `3.88`）；`gpaText` 填展示文本（`3.88/4.0` 或 `88/100`）。
- **`programId`** 必须等于项目表中的某个 `id`。
- 含逗号的内容要用英文双引号包裹整格，如 `"8月选校；10月提交；3月录取"`。

> 百分制 → 4 分制可用经验换算（常见做法）：90–100→3.8、85–89→3.6、80–84→3.3、75–79→3.0、70–74→2.7。以你机构口径为准，把结果写进 `gpa`，原始分写进 `gpaText`。

### 4.2 项目 CSV 列（`docs/program-import-template.csv`）

`id, country, countryName, city, university, universityCn, program, degree, discipline, duration, intake, selectivity, officialUrl, sourceNote, tags, qsRank, tuition, deadlineNote, stemDesignated`

- `tags` 用 `;` 分隔；`stemDesignated` 填 `true`/`false`。

---

## 5. 方式 B：真实数据库 + 自动导出（生产级）

> ✅ **已为 Supabase 实现完毕**。如果你用 Supabase，直接看 **`docs/supabase-setup.md`**（含建表 SQL、`db:push` / `db:export` 脚本、Vercel 环境变量与自动重部署）。下面是通用原理与其它数据库的参考。

思路：把 **PostgreSQL 作为唯一事实来源**，构建前用一个导出脚本把数据库导成 `realPrograms.json` / `realCases.json`，前端依旧静态、零运行时数据库成本。需要在线写入/检索时，再加 API 路由（5.5）。

### 5.1 开通数据库（Vercel Marketplace）

1. Vercel 控制台 → 你的项目 → **Storage / Integrations** → Marketplace 选 **Neon**（或 Supabase）创建 Postgres。
2. 它会把连接串写进环境变量（如 `DATABASE_URL`）。本地拉取：
   ```bash
   vercel env pull .env.local
   ```

### 5.2 建表（DDL）

在数据库里执行（psql 或控制台 SQL 编辑器）：

```sql
create table if not exists programs (
  id            text primary key,
  country       text not null,
  country_name  text not null,
  city          text,
  university    text not null,
  university_cn text not null,
  program       text not null,
  degree        text,
  discipline    text not null,
  duration      text,
  intake        text,
  selectivity   text,
  official_url  text,
  source_note   text,
  tags          jsonb default '[]',
  qs_rank       integer,
  tuition       text,
  deadline_note text,
  stem_designated boolean,
  updated_at    timestamptz default now()
);

create table if not exists cases (
  id            text primary key,
  applicant_alias text,
  degree_level  text default 'master',
  program_id    text not null references programs(id),
  country       text not null,
  country_name  text not null,
  university    text not null,
  university_cn text not null,
  program       text not null,
  discipline    text not null,
  result        text not null check (result in ('admit','conditional','waitlist','reject')),
  season        text not null,
  round         text,
  offer_date    date,
  scholarship   text,
  undergrad_school text,
  undergrad_tier   text not null,
  major         text not null,
  gpa           numeric(3,2) not null check (gpa >= 0 and gpa <= 4.3),
  gpa_scale     numeric default 4,
  gpa_text      text not null,
  ielts         numeric,
  toefl         integer,
  gre           integer,
  gmat          integer,
  work_experience_months integer default 0,
  internships   jsonb default '[]',
  research      jsonb default '[]',
  highlights    jsonb default '[]',
  strategy      text not null,
  timeline      jsonb default '[]',
  tags          jsonb default '[]',
  source_type   text default 'partner-verified',
  privacy_level text default 'anonymous',
  updated_at    timestamptz default now()
);

create index if not exists idx_cases_country    on cases(country);
create index if not exists idx_cases_discipline on cases(discipline);
create index if not exists idx_cases_result     on cases(result);
create index if not exists idx_cases_tier       on cases(undergrad_tier);
create index if not exists idx_cases_gpa        on cases(gpa);
create index if not exists idx_cases_program    on cases(program_id);
```

### 5.3 把数据导入数据库

最简单：先用方式 A 的导入脚本得到 `realPrograms.json` / `realCases.json`，再用下面的种子脚本写入（依赖 `npm i -D postgres`）。保存为 `scripts/seed-db.mjs`：

```js
import postgres from "postgres";
import { readFile } from "node:fs/promises";
const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
const programs = JSON.parse(await readFile("src/data/realPrograms.json", "utf8"));
const cases = JSON.parse(await readFile("src/data/realCases.json", "utf8"));

for (const p of programs) {
  await sql`insert into programs ${sql({
    id: p.id, country: p.country, country_name: p.countryName, city: p.city,
    university: p.university, university_cn: p.universityCn, program: p.program,
    degree: p.degree, discipline: p.discipline, duration: p.duration, intake: p.intake,
    selectivity: p.selectivity, official_url: p.officialUrl, source_note: p.sourceNote,
    tags: JSON.stringify(p.tags ?? []), qs_rank: p.qsRank ?? null, tuition: p.tuition ?? null,
    deadline_note: p.deadlineNote ?? null, stem_designated: p.stemDesignated ?? null,
  })} on conflict (id) do update set updated_at = now()`;
}
for (const c of cases) {
  const pr = c.profile ?? {};
  await sql`insert into cases ${sql({
    id: c.id, applicant_alias: c.applicantAlias, program_id: c.programId,
    country: c.country, country_name: c.countryName, university: c.university,
    university_cn: c.universityCn, program: c.program, discipline: c.discipline,
    result: c.result, season: c.season, round: c.round ?? null, offer_date: c.offerDate ?? null,
    scholarship: c.scholarship ?? "无", undergrad_school: pr.undergradSchool ?? null,
    undergrad_tier: pr.undergradTier, major: pr.major, gpa: pr.gpa, gpa_scale: pr.gpaScale ?? 4,
    gpa_text: pr.gpaText, ielts: pr.language?.ielts ?? null, toefl: pr.language?.toefl ?? null,
    gre: pr.tests?.gre ?? null, gmat: pr.tests?.gmat ?? null,
    work_experience_months: pr.workExperienceMonths ?? 0,
    internships: JSON.stringify(pr.internships ?? []), research: JSON.stringify(pr.research ?? []),
    highlights: JSON.stringify(pr.highlights ?? []), strategy: c.strategy,
    timeline: JSON.stringify(c.timeline ?? []), tags: JSON.stringify(c.tags ?? []),
    source_type: c.sourceType ?? "partner-verified", privacy_level: "anonymous",
  })} on conflict (id) do update set updated_at = now()`;
}
await sql.end();
console.log(`Seeded ${programs.length} programs, ${cases.length} cases`);
```

运行：`node scripts/seed-db.mjs`

### 5.4 构建前自动从数据库导出（保持前端静态）

新建 `scripts/export-db.mjs`，把数据库重新组装成前端需要的 `CaseRecord` / `ProgramSource` 形状，写回两个 JSON：

```js
import postgres from "postgres";
import { writeFile } from "node:fs/promises";
const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

const programs = (await sql`select * from programs order by qs_rank nulls last`).map((r) => ({
  id: r.id, country: r.country, countryName: r.country_name, city: r.city,
  university: r.university, universityCn: r.university_cn, program: r.program, degree: r.degree,
  discipline: r.discipline, duration: r.duration, intake: r.intake, selectivity: r.selectivity,
  officialUrl: r.official_url, sourceNote: r.source_note, tags: r.tags,
  ...(r.qs_rank != null && { qsRank: r.qs_rank }), ...(r.tuition && { tuition: r.tuition }),
  ...(r.deadline_note && { deadlineNote: r.deadline_note }),
  ...(r.stem_designated != null && { stemDesignated: r.stem_designated }),
}));

const cases = (await sql`select * from cases order by offer_date desc nulls last`).map((r) => ({
  id: r.id, applicantAlias: r.applicant_alias, degreeLevel: "master", programId: r.program_id,
  country: r.country, countryName: r.country_name, university: r.university,
  universityCn: r.university_cn, program: r.program, discipline: r.discipline, result: r.result,
  season: r.season, round: r.round, offerDate: r.offer_date?.toISOString().slice(0, 10) ?? "",
  scholarship: r.scholarship,
  profile: {
    undergradSchool: r.undergrad_school, undergradTier: r.undergrad_tier, major: r.major,
    gpa: Number(r.gpa), gpaScale: Number(r.gpa_scale), gpaText: r.gpa_text,
    language: { ...(r.ielts && { ielts: Number(r.ielts) }), ...(r.toefl && { toefl: r.toefl }) },
    tests: { ...(r.gre && { gre: r.gre }), ...(r.gmat && { gmat: r.gmat }) },
    internships: r.internships, research: r.research, workExperienceMonths: r.work_experience_months,
    highlights: r.highlights,
  },
  strategy: r.strategy, timeline: r.timeline, tags: r.tags,
  sourceType: r.source_type, privacyLevel: "anonymous",
}));

await writeFile("src/data/realPrograms.json", JSON.stringify(programs, null, 2) + "\n");
await writeFile("src/data/realCases.json", JSON.stringify(cases, null, 2) + "\n");
await sql.end();
console.log(`Exported ${programs.length} programs, ${cases.length} cases`);
```

把它接到构建前（`package.json`）：

```json
"scripts": {
  "prebuild": "node scripts/export-db.mjs && npm run validate:data",
  "build": "tsc -b && vite build"
}
```

这样每次 `npm run build`（含 Vercel 部署）都会先从数据库导出最新数据并校验。Vercel 上记得给项目配置 `DATABASE_URL` 环境变量。

### 5.5 （可选）在线 API 路由

需要运行期动态查询 / 在线录入时，可在项目根目录新建 `api/` 目录作为 Vercel Functions，实现 `docs/api-contract.md` 里的 5 个接口（`/api/master-cases` 等）。

⚠ 当前 `vercel.json` 把所有路径都重写到 `index.html`，会拦截 API。改成排除 `/api`：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

然后把 `src/lib/repository.ts` 从「返回本地数据」改为「fetch 这些 API」，并在页面里改用仓库层异步取数（这一步是较大的重构，按需进行；多数场景方式 B 的 5.1–5.4 已足够）。

### 5.6 （可选）AI 语义召回（pgvector）

1. `create extension if not exists vector;` 并给 `cases` 加 `embedding vector(1536)` 列。
2. 对 `strategy + highlights + timeline` 文本生成向量（通过 Vercel AI Gateway 调用嵌入模型）写入。
3. `/api/ai/retrieve-cases` 用「结构化筛选 + 向量近邻 + rerank」返回召回案例，前端 `AiAssist` 面板已预留接入点。

---

## 6. 数据质量与维护

- 每次改数据后必跑 `npm run validate:data`，再 `npm run build`。
- **去重**：案例 `id`、项目 `id` 全局唯一（脚本会查重）。
- **一致性**：案例的 `country/universityCn/program` 建议与其 `programId` 指向的项目一致。
- **批次与版本**：建议用 `sourceType` 标注来源；每次大批量导入单独一个 git commit，便于回溯。
- **变更记录**：可在 `docs/` 下维护一个 `CHANGELOG-data.md` 记录每批数据的时间、条数、来源。

---

## 7. 回滚与备份

- 改版前的旧站点已备份在分支 `backup/v1-initial-site`（GitHub 上）。
- 数据是纯文本 JSON + git 版本管理，任何一次导入都可回退：
  ```bash
  git checkout <上一个提交> -- src/data/realCases.json src/data/realPrograms.json
  ```
- 用了方式 B 时，数据库本身请开启自动备份（Neon/Supabase 默认提供 PITR）。

---

## 8. 常见问题（FAQ）

**Q：我只想先放案例，不想动项目表行不行？**
可以。`realPrograms.json` 留空 `[]` 时项目用内置 36 个种子项目，案例的 `programId` 只要引用这些种子项目的 id 即可（id 列表见 `src/data/programSources.ts`）。但更推荐项目也用你自己的真实数据。

**Q：放了数据但网站还是旧的？**
确认 JSON 是**非空数组**且已 `npm run build`；本地用 `npm run dev` 看；线上需 `git push` 触发 Vercel 部署。

**Q：百分制 GPA 怎么填？**
`gpa` 填换算后的 4 分制数字（≤4.3），`gpaText` 填原始 `88/100`。换算口径见 4.1。

**Q：校验报「外键校验失败」？**
案例的 `programId` 在项目表里找不到。检查拼写，或把对应项目补进 `realPrograms.json`。

**Q：能新增一个国家 / 专业方向吗？**
能。国家：在 `src/lib/types.ts` 的 `CountryCode` 和 `src/lib/geo.ts` 的 `countryMeta` 各加一项。方向：在 `src/lib/types.ts` 的 `Discipline` 和 `src/i18n/dict.ts` 的 `disciplineEn` 各加一项。然后即可在数据里使用。

---

需要我把方式 B 的 `seed-db.mjs` / `export-db.mjs` 直接落地为可运行脚本、或把 `/api` 路由与前端仓库层接通，告诉我你选用的数据库（Neon / Supabase / 其他）即可。
