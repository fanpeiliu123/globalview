#!/usr/bin/env node
// Validate the real data drop-in files against the GlobalView data model.
// Usage: npm run validate:data
import { readFile } from "node:fs/promises";

const ROOT = new URL("..", import.meta.url);
const rel = (p) => new URL(p, ROOT);

const COUNTRIES = [
  "US",
  "UK",
  "CA",
  "AU",
  "SG",
  "HK",
  "CH",
  "DE",
  "NL",
  "JP",
  "CN",
  "FR",
  "KR",
  "MY",
  "TW",
  "SE",
  "SA",
  "BE",
  "IE",
  "NZ",
];
const RESULTS = ["admit", "conditional", "waitlist", "reject"];
const DISCIPLINES = [
  "计算机与数据",
  "商业分析",
  "管理与市场",
  "信息系统",
  "金融商科",
  "工程与技术",
  "医学与健康",
  "人文学科",
  "商业与管理",
  "社会科学",
  "艺术设计与建筑",
  "教育",
  "计算机与信息技术",
  "生命科学与生物",
  "经济与金融",
  "数据科学与人工智能",
  "环境与可持续发展",
  "自然科学",
  "法学",
  "公共政策与管理",
  "数学与统计",
  "媒体与传播",
];
const TIERS = ["C9/985", "211", "双非一本", "中外合作", "海外本科"];
const SELECTIVITY = ["高竞争", "中高竞争", "稳健匹配"];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

async function readJson(path) {
  try {
    const txt = await readFile(rel(path), "utf8");
    const data = JSON.parse(txt);
    if (!Array.isArray(data)) {
      err(`${path} 不是 JSON 数组`);
      return [];
    }
    return data;
  } catch (e) {
    if (e.code === "ENOENT") return [];
    err(`${path} 解析失败：${e.message}`);
    return [];
  }
}

async function seedProgramIds() {
  try {
    const txt = await readFile(rel("src/data/programSources.ts"), "utf8");
    const ids = new Set();
    for (const m of txt.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)) ids.add(m[1]);
    return ids;
  } catch {
    return new Set();
  }
}

function req(obj, field, ctx) {
  const v = obj[field];
  if (v === undefined || v === null || v === "") err(`${ctx} 缺少必填字段 "${field}"`);
}

function inEnum(obj, field, set, ctx) {
  const v = obj[field];
  if (v !== undefined && v !== "" && !set.includes(v)) {
    err(`${ctx} 字段 "${field}" 值 "${v}" 不在允许集合内 [${set.join(", ")}]`);
  }
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE = /(?<!\d)1[3-9]\d{9}(?!\d)/;
const WECHAT = /(微信号?|wechat|vx)\s*[:：]?\s*[A-Za-z0-9_-]{4,}/i;

function privacyScan(record, ctx) {
  const blob = JSON.stringify(record);
  if (EMAIL.test(blob)) err(`${ctx} 疑似包含邮箱，禁止入库（请脱敏）`);
  if (PHONE.test(blob)) err(`${ctx} 疑似包含手机号，禁止入库（请脱敏）`);
  if (WECHAT.test(blob)) warn(`${ctx} 疑似包含微信号，请确认已脱敏`);
}

function validatePrograms(programs) {
  const ids = new Set();
  programs.forEach((p, i) => {
    const ctx = `项目[${i}] (${p.id || "无id"})`;
    ["id", "country", "university", "universityCn", "program", "degree", "discipline", "duration", "intake", "selectivity", "officialUrl"].forEach((f) => req(p, f, ctx));
    inEnum(p, "country", COUNTRIES, ctx);
    inEnum(p, "discipline", DISCIPLINES, ctx);
    inEnum(p, "selectivity", SELECTIVITY, ctx);
    if (p.qsRank !== undefined && (typeof p.qsRank !== "number" || p.qsRank <= 0)) {
      warn(`${ctx} qsRank 应为正数`);
    }
    if (p.tags !== undefined && !Array.isArray(p.tags)) err(`${ctx} tags 应为数组`);
    if (p.id) {
      if (ids.has(p.id)) err(`${ctx} 项目 id 重复："${p.id}"`);
      ids.add(p.id);
    }
  });
  return ids;
}

function validateCases(cases, validProgramIds) {
  const ids = new Set();
  cases.forEach((c, i) => {
    const ctx = `案例[${i}] (${c.id || "无id"})`;
    ["id", "programId", "country", "university", "universityCn", "program", "discipline", "result", "season", "strategy"].forEach((f) => req(c, f, ctx));
    inEnum(c, "country", COUNTRIES, ctx);
    inEnum(c, "discipline", DISCIPLINES, ctx);
    inEnum(c, "result", RESULTS, ctx);

    if (c.id) {
      if (ids.has(c.id)) err(`${ctx} 案例 id 重复："${c.id}"`);
      ids.add(c.id);
    }
    if (c.programId && !validProgramIds.has(c.programId)) {
      err(`${ctx} programId "${c.programId}" 在项目表中不存在（外键校验失败）`);
    }
    if (c.privacyLevel && c.privacyLevel !== "anonymous") {
      err(`${ctx} privacyLevel 必须为 "anonymous"`);
    }

    const p = c.profile || {};
    const pctx = `${ctx}.profile`;
    ["undergradTier", "major", "gpa", "gpaText"].forEach((f) => req(p, f, pctx));
    inEnum(p, "undergradTier", TIERS, pctx);
    if (p.gpa !== undefined && (typeof p.gpa !== "number" || p.gpa < 0 || p.gpa > 4.3)) {
      err(`${pctx} gpa "${p.gpa}" 应为 0–4.3 的数字（百分制请换算为 4 分制）`);
    }
    ["internships", "research", "highlights"].forEach((f) => {
      if (p[f] !== undefined && !Array.isArray(p[f])) err(`${pctx} ${f} 应为数组`);
    });
    if (c.timeline !== undefined && !Array.isArray(c.timeline)) err(`${ctx} timeline 应为数组`);
    if (c.tags !== undefined && !Array.isArray(c.tags)) err(`${ctx} tags 应为数组`);
    if (c.offerDate && !/^\d{4}-\d{2}-\d{2}$/.test(c.offerDate)) {
      warn(`${ctx} offerDate "${c.offerDate}" 建议使用 YYYY-MM-DD 格式`);
    }
    privacyScan(c, ctx);
  });
  return ids;
}

// ---- run ----
const realPrograms = await readJson("src/data/realPrograms.json");
const realCases = await readJson("src/data/realCases.json");

console.log("GlobalView 数据校验");
console.log("─".repeat(48));
console.log(`项目 (realPrograms.json): ${realPrograms.length}`);
console.log(`案例 (realCases.json):    ${realCases.length}`);

if (realPrograms.length === 0 && realCases.length === 0) {
  console.log("\n未发现真实数据，当前仍使用内置种子数据。");
  console.log("把数据放入 src/data/realPrograms.json / realCases.json 后再次运行本命令。");
  process.exit(errors.length ? 1 : 0);
}

const programIds = validatePrograms(realPrograms);
const effectiveProgramIds = realPrograms.length ? programIds : await seedProgramIds();
validateCases(realCases, effectiveProgramIds);

console.log("─".repeat(48));
if (warnings.length) {
  console.log(`\n⚠ 警告 (${warnings.length})：`);
  warnings.forEach((w) => console.log("  - " + w));
}
if (errors.length) {
  console.log(`\n✗ 错误 (${errors.length})：`);
  errors.forEach((e) => console.log("  - " + e));
  console.log("\n请修复以上错误后重新运行 `npm run validate:data`。");
  process.exit(1);
}
console.log("\n✓ 校验通过，数据可以构建与部署。");
process.exit(0);
