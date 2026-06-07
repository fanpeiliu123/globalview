#!/usr/bin/env node
// Pull data FROM Supabase into src/data/realPrograms.json + realCases.json.
// Runs in `prebuild`, so it must NEVER break the build: if Supabase env is not
// configured it skips gracefully and leaves the committed JSON in place.
// Usage: npm run db:export
import { writeFile } from "node:fs/promises";
import {
  getClient,
  rowToProgram,
  rowToCase,
  selectAll,
} from "./supabase-client.mjs";

const sb = getClient();
if (!sb) {
  console.log(
    "ℹ Supabase 未配置（缺 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY），跳过导出，沿用现有 JSON。",
  );
  process.exit(0);
}

const out = (p) => new URL(`../${p}`, import.meta.url);

console.log("Supabase → GlobalView 导出");
console.log("─".repeat(44));

const programRows = await selectAll(sb, "programs");
const caseRows = await selectAll(sb, "cases");

const programs = programRows.map(rowToProgram);
const cases = caseRows.map(rowToCase);

await writeFile(out("src/data/realPrograms.json"), `${JSON.stringify(programs, null, 2)}\n`);
await writeFile(out("src/data/realCases.json"), `${JSON.stringify(cases, null, 2)}\n`);

console.log(`✓ programs 导出 ${programs.length} 条 → src/data/realPrograms.json`);
console.log(`✓ cases    导出 ${cases.length} 条 → src/data/realCases.json`);
console.log("─".repeat(44));
if (programs.length === 0 && cases.length === 0) {
  console.log("数据库为空，前端将回退到内置种子数据。先 `npm run db:push` 载入数据。");
}
