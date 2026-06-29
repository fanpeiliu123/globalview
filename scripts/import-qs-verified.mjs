#!/usr/bin/env node
// Convert the verified QS Top80 programme database into GlobalView ProgramSource.
// Usage:
//   node scripts/import-qs-verified.mjs <outputs_verified_dir> [output.json]
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [
  ,
  ,
  inputDir,
  outputPath = "src/data/realPrograms.json",
  statsOutputPath = "src/data/programCatalogueStats.json",
] = process.argv;

if (!inputDir) {
  console.error(
    "Usage: node scripts/import-qs-verified.mjs <outputs_verified_dir> [output.json]",
  );
  process.exit(1);
}

const countryCodeByName = {
  "United States": "US",
  "United Kingdom": "UK",
  Canada: "CA",
  Australia: "AU",
  Singapore: "SG",
  "Hong Kong SAR": "HK",
  Switzerland: "CH",
  Germany: "DE",
  Netherlands: "NL",
  Japan: "JP",
  China: "CN",
  France: "FR",
  "South Korea": "KR",
  Malaysia: "MY",
  Taiwan: "TW",
  Sweden: "SE",
  "Saudi Arabia": "SA",
  Belgium: "BE",
  Ireland: "IE",
  "New Zealand": "NZ",
};

const disciplineByCategory = {
  "Engineering & Technology": "工程与技术",
  "Medicine & Health": "医学与健康",
  Humanities: "人文学科",
  "Business & Management": "商业与管理",
  "Social Sciences": "社会科学",
  "Arts, Design & Architecture": "艺术设计与建筑",
  Education: "教育",
  "Computer Science & IT": "计算机与信息技术",
  "Life Sciences & Biology": "生命科学与生物",
  "Economics & Finance": "经济与金融",
  "Data Science & AI": "数据科学与人工智能",
  "Environment & Sustainability": "环境与可持续发展",
  "Natural Sciences": "自然科学",
  Law: "法学",
  "Public Policy & Administration": "公共政策与管理",
  "Mathematics & Statistics": "数学与统计",
  "Media & Communication": "媒体与传播",
};

const stemLikeCategories = new Set([
  "Engineering & Technology",
  "Computer Science & IT",
  "Data Science & AI",
  "Natural Sciences",
  "Mathematics & Statistics",
  "Life Sciences & Biology",
  "Medicine & Health",
  "Environment & Sustainability",
]);

function text(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function optionalText(value) {
  const valueText = text(value);
  return valueText ? valueText : undefined;
}

function asArray(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  const valueText = text(value);
  if (!valueText) return [];
  return valueText
    .split(/[|；;]/)
    .map(text)
    .filter(Boolean);
}

function selectivityFromRank(rank) {
  if (rank > 0 && rank <= 30) return "高竞争";
  if (rank > 0 && rank <= 70) return "中高竞争";
  return "稳健匹配";
}

function completeness(program) {
  const fields = [
    "name_en",
    "degree_type",
    "faculty",
    "discipline_category",
    "program_url",
    "duration",
    "study_mode",
    "annual_tuition",
    "language_requirements",
    "gre_required",
    "entry_requirements",
    "application_deadline",
    "intake",
    "scholarships",
    "curriculum_highlights",
    "career_outcomes",
    "description",
  ];
  const filled = fields.filter((field) => text(program[field])).length;
  return Math.round((filled / fields.length) * 100);
}

function tagsFor(program, university) {
  return [
    program.degree_type,
    program.discipline_category,
    program.faculty,
    university.country_zh,
    university.city,
    university.abbr,
    university.qs_rank_2026 ? `QS #${university.qs_rank_2026}` : "",
    text(program.gre_required) ? `GRE: ${program.gre_required}` : "",
  ]
    .map(text)
    .filter(Boolean)
    .slice(0, 10);
}

const programsPath = path.join(inputDir, "programs.json");
const universitiesPath = path.join(inputDir, "universities.json");

const rawPrograms = JSON.parse(await readFile(programsPath, "utf8"));
const rawUniversities = JSON.parse(await readFile(universitiesPath, "utf8"));
const universities = new Map(rawUniversities.map((item) => [item.id, item]));

const converted = rawPrograms.map((program, index) => {
  const university = universities.get(program.university_id);
  if (!university) {
    throw new Error(`Missing university ${program.university_id} for program ${program.id}`);
  }
  const country = countryCodeByName[university.country];
  if (!country) {
    throw new Error(`Unsupported country "${university.country}" for ${university.name_en}`);
  }
  const discipline = disciplineByCategory[program.discipline_category];
  if (!discipline) {
    throw new Error(`Unsupported discipline "${program.discipline_category}"`);
  }

  const sourceUrls = [...new Set([program.program_url, ...asArray(program.source_urls)])];
  const rank = Number(university.qs_rank_2026 || 0);

  return {
    id: text(program.id) || `qs-program-${index + 1}`,
    universityId: text(university.id),
    country,
    countryName: text(university.country_zh) || text(university.country),
    city: text(university.city),
    university: text(university.name_en),
    universityCn: text(university.name_zh) || text(university.name_en),
    program: text(program.name_en),
    programZh: optionalText(program.name_zh),
    degree: text(program.degree_type) || "Master",
    discipline,
    duration: optionalText(program.duration) ?? "官网未注明",
    intake: optionalText(program.intake) ?? "官网未注明",
    selectivity: selectivityFromRank(rank),
    officialUrl: text(program.program_url),
    sourceNote:
      "QS Top80 官方核验项目库：项目名称、学院、学科与官方链接来自各校官网索引页；学费、截止日、语言等动态字段按抓取可得性展示。",
    tags: tagsFor(program, university),
    ...(rank ? { qsRank: rank } : {}),
    ...(optionalText(university.type) ? { universityType: optionalText(university.type) } : {}),
    ...(optionalText(university.region) ? { region: optionalText(university.region) } : {}),
    ...(optionalText(program.faculty) ? { faculty: optionalText(program.faculty) } : {}),
    ...(optionalText(program.department) ? { department: optionalText(program.department) } : {}),
    rawDiscipline: text(program.discipline_category),
    ...(optionalText(program.annual_tuition) ? { tuition: optionalText(program.annual_tuition) } : {}),
    ...(optionalText(program.application_deadline)
      ? { deadlineNote: optionalText(program.application_deadline) }
      : {}),
    ...(optionalText(program.language_requirements)
      ? { languageRequirements: optionalText(program.language_requirements) }
      : {}),
    ...(optionalText(program.gre_required) ? { greRequired: optionalText(program.gre_required) } : {}),
    ...(optionalText(program.entry_requirements)
      ? { entryRequirements: optionalText(program.entry_requirements) }
      : {}),
    sourceUrls,
    dataCompleteness: completeness(program),
    ...(optionalText(program.last_updated) ? { lastUpdated: optionalText(program.last_updated) } : {}),
    stemDesignated: country === "US" && stemLikeCategories.has(program.discipline_category),
  };
});

converted.sort(
  (a, b) =>
    (a.qsRank ?? 999) - (b.qsRank ?? 999) ||
    a.university.localeCompare(b.university) ||
    a.program.localeCompare(b.program),
);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(converted, null, 2)}\n`);

const countries = new Set(converted.map((program) => program.country)).size;
const universitiesCount = new Set(converted.map((program) => program.universityId)).size;
const disciplines = new Set(converted.map((program) => program.discipline)).size;
const latestUpdate = converted
  .map((program) => program.lastUpdated)
  .filter(Boolean)
  .sort()
  .at(-1);

function countBy(items, keyFn) {
  return [...items.reduce((map, item) => {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map()).entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
}

const stats = {
  source: "QS Top80 verified programme database",
  programs: converted.length,
  universities: universitiesCount,
  countries,
  disciplines,
  withTuition: converted.filter((program) => program.tuition).length,
  withDeadline: converted.filter((program) => program.deadlineNote).length,
  withLanguage: converted.filter((program) => program.languageRequirements).length,
  withGre: converted.filter((program) => program.greRequired).length,
  avgCompleteness: converted.length
    ? Math.round(converted.reduce((sum, program) => sum + (program.dataCompleteness ?? 0), 0) / converted.length)
    : 0,
  lastUpdated: latestUpdate,
  countryCounts: countBy(converted, (program) => program.country),
  disciplineCounts: countBy(converted, (program) => program.discipline),
  featuredUniversities: [
    ...new Set(
      converted
        .filter((program) => (program.qsRank ?? 999) <= 20)
        .sort((a, b) => (a.qsRank ?? 999) - (b.qsRank ?? 999))
        .map((program) => program.university),
    ),
  ].slice(0, 24),
};

console.log(`Imported ${converted.length} verified QS Top80 programs -> ${outputPath}`);
console.log(`Coverage: ${universitiesCount} universities · ${countries} countries/regions · ${disciplines} disciplines`);

await mkdir(path.dirname(statsOutputPath), { recursive: true });
await writeFile(statsOutputPath, `${JSON.stringify(stats, null, 2)}\n`);
console.log(`Stats -> ${statsOutputPath}`);
