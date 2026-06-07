#!/usr/bin/env node
// Upload src/data/realPrograms.json + realCases.json INTO Supabase.
// Usage: npm run db:push
import { readFile } from "node:fs/promises";
import {
  getClient,
  ENV_HINT,
  programToRow,
  caseToRow,
  upsertChunked,
} from "./supabase-client.mjs";

async function readJson(path) {
  try {
    const data = JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const sb = getClient();
if (!sb) {
  console.error(`✗ ${ENV_HINT}`);
  process.exit(1);
}

const programs = await readJson("src/data/realPrograms.json");
const cases = await readJson("src/data/realCases.json");

if (programs.length === 0 && cases.length === 0) {
  console.error(
    "✗ src/data/realPrograms.json 和 realCases.json 都为空。\n" +
      "  先用 `npm run import:programs` / `npm run import:cases` 准备数据，再推送。",
  );
  process.exit(1);
}

console.log("GlobalView → Supabase 推送");
console.log("─".repeat(44));

// Programs first (cases reference them via FK).
if (programs.length) {
  await upsertChunked(sb, "programs", programs.map(programToRow));
  console.log(`✓ programs 已写入 ${programs.length} 条`);
}
if (cases.length) {
  await upsertChunked(sb, "cases", cases.map(caseToRow));
  console.log(`✓ cases 已写入 ${cases.length} 条`);
}

console.log("─".repeat(44));
console.log("完成。下一步：`npm run db:export` 把数据库导回前端，再 `npm run build`。");
