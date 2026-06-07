#!/usr/bin/env node
// Convert a programs CSV/JSON file into src/data/realPrograms.json
// Usage: npm run import:programs -- <input.csv|input.json> [output.json]
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , inputPath, outputPath = "src/data/realPrograms.json"] = process.argv;

if (!inputPath) {
  console.error(
    "Usage: npm run import:programs -- <input.csv|input.json> [output.json]",
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
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);

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

function toBool(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "是" || v === "y";
}

function normalize(rows) {
  return rows.map((row) => {
    const program = {
      id: String(row.id || "").trim(),
      country: String(row.country || "").trim(),
      countryName: row.countryName || row.country || "",
      city: row.city || "",
      university: row.university || "",
      universityCn: row.universityCn || row.university || "",
      program: row.program || "",
      degree: row.degree || "",
      discipline: row.discipline || "",
      duration: row.duration || "",
      intake: row.intake || "",
      selectivity: row.selectivity || "",
      officialUrl: row.officialUrl || "",
      sourceNote: row.sourceNote || "项目信息以官方页面为准。",
      tags: splitList(row.tags),
    };
    if (row.qsRank) program.qsRank = Number(row.qsRank);
    if (row.tuition) program.tuition = row.tuition;
    if (row.deadlineNote) program.deadlineNote = row.deadlineNote;
    if (row.stemDesignated !== undefined && row.stemDesignated !== "") {
      program.stemDesignated = toBool(row.stemDesignated);
    }
    return program;
  });
}

const raw = await readFile(inputPath, "utf8");
const rows = inputPath.endsWith(".json") ? JSON.parse(raw) : parseCsv(raw);
const normalized = normalize(rows);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);

console.log(`Imported ${normalized.length} programs -> ${outputPath}`);
console.log("Next: run `npm run validate:data` then `npm run build`.");
