// Shared Supabase client + row <-> app-model mappers for the data scripts.
import { createClient } from "@supabase/supabase-js";

// Load .env.local for local CLI runs (no-op on Vercel, which injects env vars).
try {
  process.loadEnvFile?.(".env.local");
} catch {
  /* file may not exist */
}

export function getClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const ENV_HINT =
  "缺少 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY。请在 .env.local 设置（见 docs/supabase-setup.md）。";

const arr = (v) => (Array.isArray(v) ? v : []);

// ---- programs ----
export function programToRow(p) {
  return {
    id: p.id,
    country: p.country,
    country_name: p.countryName,
    city: p.city ?? null,
    university: p.university,
    university_cn: p.universityCn,
    program: p.program,
    program_zh: p.programZh ?? null,
    degree: p.degree ?? null,
    discipline: p.discipline,
    duration: p.duration ?? null,
    intake: p.intake ?? null,
    selectivity: p.selectivity ?? null,
    official_url: p.officialUrl ?? null,
    source_note: p.sourceNote ?? null,
    tags: arr(p.tags),
    qs_rank: p.qsRank ?? null,
    university_id: p.universityId ?? null,
    university_type: p.universityType ?? null,
    region: p.region ?? null,
    faculty: p.faculty ?? null,
    department: p.department ?? null,
    raw_discipline: p.rawDiscipline ?? null,
    tuition: p.tuition ?? null,
    deadline_note: p.deadlineNote ?? null,
    language_requirements: p.languageRequirements ?? null,
    gre_required: p.greRequired ?? null,
    entry_requirements: p.entryRequirements ?? null,
    source_urls: arr(p.sourceUrls),
    data_completeness: p.dataCompleteness ?? null,
    last_updated: p.lastUpdated ?? null,
    stem_designated: p.stemDesignated ?? null,
  };
}

export function rowToProgram(r) {
  return {
    id: r.id,
    country: r.country,
    countryName: r.country_name,
    city: r.city ?? "",
    university: r.university,
    universityCn: r.university_cn,
    program: r.program,
    ...(r.program_zh && { programZh: r.program_zh }),
    degree: r.degree ?? "",
    discipline: r.discipline,
    duration: r.duration ?? "",
    intake: r.intake ?? "",
    selectivity: r.selectivity ?? "稳健匹配",
    officialUrl: r.official_url ?? "",
    sourceNote: r.source_note ?? "",
    tags: arr(r.tags),
    ...(r.qs_rank != null && { qsRank: r.qs_rank }),
    ...(r.university_id && { universityId: r.university_id }),
    ...(r.university_type && { universityType: r.university_type }),
    ...(r.region && { region: r.region }),
    ...(r.faculty && { faculty: r.faculty }),
    ...(r.department && { department: r.department }),
    ...(r.raw_discipline && { rawDiscipline: r.raw_discipline }),
    ...(r.tuition && { tuition: r.tuition }),
    ...(r.deadline_note && { deadlineNote: r.deadline_note }),
    ...(r.language_requirements && { languageRequirements: r.language_requirements }),
    ...(r.gre_required && { greRequired: r.gre_required }),
    ...(r.entry_requirements && { entryRequirements: r.entry_requirements }),
    ...(arr(r.source_urls).length && { sourceUrls: arr(r.source_urls) }),
    ...(r.data_completeness != null && { dataCompleteness: r.data_completeness }),
    ...(r.last_updated && { lastUpdated: r.last_updated }),
    ...(r.stem_designated != null && { stemDesignated: r.stem_designated }),
  };
}

// ---- cases ----
export function caseToRow(c) {
  const p = c.profile ?? {};
  return {
    id: c.id,
    applicant_alias: c.applicantAlias ?? null,
    degree_level: "master",
    program_id: c.programId,
    country: c.country,
    country_name: c.countryName,
    university: c.university,
    university_cn: c.universityCn,
    program: c.program,
    discipline: c.discipline,
    result: c.result,
    season: c.season,
    round: c.round ?? null,
    offer_date: c.offerDate ? c.offerDate : null,
    scholarship: c.scholarship ?? "无",
    undergrad_school: p.undergradSchool ?? null,
    undergrad_tier: p.undergradTier,
    major: p.major,
    gpa: p.gpa,
    gpa_scale: p.gpaScale ?? 4,
    gpa_text: p.gpaText,
    ielts: p.language?.ielts ?? null,
    toefl: p.language?.toefl ?? null,
    gre: p.tests?.gre ?? null,
    gmat: p.tests?.gmat ?? null,
    work_experience_months: p.workExperienceMonths ?? 0,
    internships: arr(p.internships),
    research: arr(p.research),
    highlights: arr(p.highlights),
    strategy: c.strategy,
    timeline: arr(c.timeline),
    tags: arr(c.tags),
    source_type: c.sourceType ?? "partner-verified",
    privacy_level: "anonymous",
  };
}

export function rowToCase(r) {
  return {
    id: r.id,
    applicantAlias: r.applicant_alias ?? "",
    degreeLevel: "master",
    programId: r.program_id,
    country: r.country,
    countryName: r.country_name,
    university: r.university,
    universityCn: r.university_cn,
    program: r.program,
    discipline: r.discipline,
    result: r.result,
    season: r.season,
    round: r.round ?? "",
    offerDate: typeof r.offer_date === "string" ? r.offer_date.slice(0, 10) : "",
    scholarship: r.scholarship ?? "无",
    profile: {
      undergradSchool: r.undergrad_school ?? "",
      undergradTier: r.undergrad_tier,
      major: r.major,
      gpa: Number(r.gpa),
      gpaScale: Number(r.gpa_scale ?? 4),
      gpaText: r.gpa_text,
      language: {
        ...(r.ielts != null && { ielts: Number(r.ielts) }),
        ...(r.toefl != null && { toefl: Number(r.toefl) }),
      },
      tests: {
        ...(r.gre != null && { gre: Number(r.gre) }),
        ...(r.gmat != null && { gmat: Number(r.gmat) }),
      },
      internships: arr(r.internships),
      research: arr(r.research),
      workExperienceMonths: r.work_experience_months ?? 0,
      highlights: arr(r.highlights),
    },
    strategy: r.strategy,
    timeline: arr(r.timeline),
    tags: arr(r.tags),
    sourceType: r.source_type ?? "partner-verified",
    privacyLevel: "anonymous",
  };
}

export async function selectAll(sb, table) {
  const pageSize = 1000;
  let from = 0;
  const all = [];
  for (;;) {
    const { data, error } = await sb
      .from(table)
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`读取 ${table} 失败：${error.message}`);
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

export async function upsertChunked(sb, table, rows, chunk = 500) {
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { error } = await sb.from(table).upsert(slice, { onConflict: "id" });
    if (error) throw new Error(`写入 ${table} 失败：${error.message}`);
  }
}
