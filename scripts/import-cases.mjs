#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , inputPath, outputPath = "data/generated-cases.json"] = process.argv;

if (!inputPath) {
  console.error(
    "Usage: npm run import:cases -- <input.csv|input.json> [output.json]",
  );
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  const [headers, ...body] = rows;
  return body.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

function splitList(value) {
  return String(value ?? "")
    .split(/[;；|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLanguage(value) {
  const text = String(value ?? "").toLowerCase();
  const toefl = text.match(/toefl\s*([0-9]+)/i) ?? text.match(/托福\s*([0-9]+)/);
  const ielts = text.match(/ielts\s*([0-9.]+)/i) ?? text.match(/雅思\s*([0-9.]+)/);
  if (toefl) return { toefl: Number(toefl[1]) };
  if (ielts) return { ielts: Number(ielts[1]) };
  return {};
}

function parseTests(value) {
  const text = String(value ?? "").toLowerCase();
  const gre = text.match(/gre\s*([0-9]+)/i);
  const gmat = text.match(/gmat\s*([0-9]+)/i);
  return {
    ...(gre ? { gre: Number(gre[1]) } : {}),
    ...(gmat ? { gmat: Number(gmat[1]) } : {}),
  };
}

function normalizeRows(rows) {
  return rows.map((row, index) => ({
    id: row.id || `IMPORT-MS-${String(index + 1).padStart(4, "0")}`,
    applicantAlias: row.applicantAlias || `导入案例${index + 1}`,
    degreeLevel: "master",
    programId: row.programId || "",
    country: row.country || "",
    countryName: row.countryName || row.country || "",
    university: row.university || "",
    universityCn: row.universityCn || row.university || "",
    program: row.program || "",
    discipline: row.discipline || "",
    result: row.result || "",
    season: row.season || "",
    round: row.round || "",
    offerDate: row.offerDate || "",
    scholarship: row.scholarship || "无",
    profile: {
      undergradSchool: row.undergradSchool || "",
      undergradTier: row.undergradTier || "",
      major: row.major || "",
      gpa: Number(row.gpa || 0),
      gpaScale: Number(row.gpaScale || 4),
      gpaText: row.gpaText || row.gpa || "",
      language: parseLanguage(row.language),
      tests: parseTests(row.tests),
      internships: splitList(row.internships),
      research: splitList(row.research),
      workExperienceMonths: Number(row.workExperienceMonths || 0),
      highlights: splitList(row.highlights),
    },
    strategy: row.strategy || "",
    timeline: splitList(row.timeline),
    tags: splitList(row.tags),
    sourceType: "user-imported",
    privacyLevel: "anonymous",
  }));
}

const raw = await readFile(inputPath, "utf8");
const rows = inputPath.endsWith(".json") ? JSON.parse(raw) : parseCsv(raw);
const normalized = normalizeRows(rows);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);

console.log(`Imported ${normalized.length} cases -> ${outputPath}`);
