import { admissionCases } from "../data/cases";
import { programSources } from "../data/programSources";
import type {
  AdmissionResult,
  AiRetrievalRequest,
  AiRetrievalResponse,
  CaseRecord,
  CaseSearchFilters,
  CountryCode,
  Discipline,
  SearchResult,
} from "./types";

export const defaultFilters: CaseSearchFilters = {
  keyword: "",
  country: "all",
  university: "all",
  programId: "all",
  discipline: "all",
  result: "all",
  tier: "all",
  minGpa: 0,
  minLanguage: 0,
  withGreGmat: "all",
};

export const resultLabels: Record<AdmissionResult, string> = {
  admit: "录取",
  conditional: "条件录取",
  waitlist: "等待名单",
  reject: "拒信",
};

export const resultTone: Record<AdmissionResult, string> = {
  admit: "success",
  conditional: "warning",
  waitlist: "neutral",
  reject: "danger",
};

export const countryLabels: Record<CountryCode, string> = {
  US: "美国",
  UK: "英国",
  CA: "加拿大",
  AU: "澳大利亚",
  SG: "新加坡",
  HK: "中国香港",
  CH: "瑞士",
};

export function getLanguageScore(caseRecord: CaseRecord) {
  const { ielts, toefl } = caseRecord.profile.language;
  if (typeof toefl === "number") {
    return toefl;
  }
  if (typeof ielts === "number") {
    return Math.round(ielts * 14);
  }
  return 0;
}

export function formatLanguage(caseRecord: CaseRecord) {
  const { ielts, toefl } = caseRecord.profile.language;
  if (typeof toefl === "number") {
    return `TOEFL ${toefl}`;
  }
  if (typeof ielts === "number") {
    return `IELTS ${ielts}`;
  }
  return "免语言/未提交";
}

export function formatTests(caseRecord: CaseRecord) {
  const { gre, gmat } = caseRecord.profile.tests;
  if (typeof gre === "number") {
    return `GRE ${gre}`;
  }
  if (typeof gmat === "number") {
    return `GMAT ${gmat}`;
  }
  return "未提交";
}

export function getFilterOptions() {
  const countries = [...new Set(programSources.map((program) => program.country))];
  const universities = [
    ...new Set(admissionCases.map((caseRecord) => caseRecord.universityCn)),
  ].sort((a, b) => a.localeCompare(b, "zh-CN"));
  const disciplines = [
    ...new Set(programSources.map((program) => program.discipline)),
  ] as Discipline[];

  return {
    countries,
    universities,
    disciplines,
    programs: programSources,
  };
}

export function searchCases(
  filters: CaseSearchFilters,
  cases: CaseRecord[] = admissionCases,
): SearchResult[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return cases
    .map((caseRecord) => {
      const searchable = [
        caseRecord.id,
        caseRecord.applicantAlias,
        caseRecord.countryName,
        caseRecord.university,
        caseRecord.universityCn,
        caseRecord.program,
        caseRecord.discipline,
        caseRecord.profile.undergradSchool,
        caseRecord.profile.undergradTier,
        caseRecord.profile.major,
        caseRecord.strategy,
        ...caseRecord.tags,
        ...caseRecord.profile.highlights,
        ...caseRecord.profile.internships,
        ...caseRecord.profile.research,
      ]
        .join(" ")
        .toLowerCase();

      const hasGreGmat =
        typeof caseRecord.profile.tests.gre === "number" ||
        typeof caseRecord.profile.tests.gmat === "number";
      const languageScore = getLanguageScore(caseRecord);

      const passes =
        (!keyword || searchable.includes(keyword)) &&
        (filters.country === "all" || caseRecord.country === filters.country) &&
        (filters.university === "all" ||
          caseRecord.universityCn === filters.university) &&
        (filters.programId === "all" ||
          caseRecord.programId === filters.programId) &&
        (filters.discipline === "all" ||
          caseRecord.discipline === filters.discipline) &&
        (filters.result === "all" || caseRecord.result === filters.result) &&
        (filters.tier === "all" || caseRecord.profile.undergradTier === filters.tier) &&
        caseRecord.profile.gpa >= filters.minGpa &&
        languageScore >= filters.minLanguage &&
        (filters.withGreGmat === "all" ||
          (filters.withGreGmat === "yes" && hasGreGmat) ||
          (filters.withGreGmat === "no" && !hasGreGmat));

      if (!passes) {
        return null;
      }

      const reasons: string[] = [];
      let score = 40;

      if (keyword && searchable.includes(keyword)) {
        score += 18;
        reasons.push("关键词匹配");
      }
      if (filters.country !== "all") {
        score += 10;
        reasons.push("国家一致");
      }
      if (filters.discipline !== "all") {
        score += 12;
        reasons.push("方向一致");
      }
      if (filters.tier !== "all") {
        score += 8;
        reasons.push("本科层级相近");
      }
      if (caseRecord.result === "admit") {
        score += 9;
      }
      if (caseRecord.result === "conditional") {
        score += 5;
      }
      if (caseRecord.profile.gpa >= 3.7) {
        score += 7;
      }
      if (hasGreGmat) {
        score += 4;
      }
      if (caseRecord.profile.internships.length > 1) {
        score += 4;
      }
      if (caseRecord.profile.research.some((item) => item !== "无")) {
        score += 4;
      }

      if (reasons.length === 0) {
        reasons.push("基础条件可参考");
      }

      return {
        caseRecord,
        score: Math.min(score, 99),
        reasons,
      };
    })
    .filter((result): result is SearchResult => Boolean(result))
    .sort((a, b) => b.score - a.score || a.caseRecord.id.localeCompare(b.caseRecord.id));
}

export function getCaseById(caseId: string) {
  return admissionCases.find((caseRecord) => caseRecord.id === caseId);
}

export function getProgramById(programId: string) {
  return programSources.find((program) => program.id === programId);
}

export function getStats(cases: CaseRecord[] = admissionCases) {
  const admits = cases.filter((caseRecord) => caseRecord.result === "admit").length;
  const conditional = cases.filter(
    (caseRecord) => caseRecord.result === "conditional",
  ).length;
  const countries = new Set(cases.map((caseRecord) => caseRecord.country)).size;
  const programs = new Set(cases.map((caseRecord) => caseRecord.programId)).size;

  return {
    total: cases.length,
    admits,
    conditional,
    countries,
    programs,
    admitRate: Math.round(((admits + conditional) / cases.length) * 100),
  };
}

export function getCountryBuckets(cases: CaseRecord[] = admissionCases) {
  return Object.entries(countryLabels)
    .map(([code, label]) => {
      const records = cases.filter((caseRecord) => caseRecord.country === code);
      return {
        code: code as CountryCode,
        label,
        count: records.length,
        admits: records.filter(
          (caseRecord) =>
            caseRecord.result === "admit" || caseRecord.result === "conditional",
        ).length,
      };
    })
    .filter((bucket) => bucket.count > 0);
}

export function getTaxonomy() {
  return programSources.map((program) => ({
    ...program,
    cases: admissionCases.filter((caseRecord) => caseRecord.programId === program.id),
  }));
}

export function findSimilarCases(caseRecord: CaseRecord, limit = 4) {
  return admissionCases
    .filter((candidate) => candidate.id !== caseRecord.id)
    .map((candidate) => {
      let score = 0;
      if (candidate.country === caseRecord.country) score += 12;
      if (candidate.discipline === caseRecord.discipline) score += 16;
      if (candidate.profile.undergradTier === caseRecord.profile.undergradTier) {
        score += 10;
      }
      if (Math.abs(candidate.profile.gpa - caseRecord.profile.gpa) <= 0.15) {
        score += 8;
      }
      if (candidate.result === caseRecord.result) score += 4;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function buildAiRetrievalContext(
  request: AiRetrievalRequest,
): AiRetrievalResponse {
  const query = request.query.toLowerCase();
  const recommendedFilters: Partial<CaseSearchFilters> = {};

  const countryEntry = Object.entries(countryLabels).find(
    ([code, label]) => query.includes(code.toLowerCase()) || query.includes(label),
  );
  if (countryEntry) {
    recommendedFilters.country = countryEntry[0] as CountryCode;
  }

  const discipline = getFilterOptions().disciplines.find((item) =>
    query.includes(item.slice(0, 2)),
  );
  if (discipline) {
    recommendedFilters.discipline = discipline;
  }

  if (query.includes("双非")) {
    recommendedFilters.tier = "双非一本";
  } else if (query.includes("211")) {
    recommendedFilters.tier = "211";
  } else if (query.includes("985") || query.includes("c9")) {
    recommendedFilters.tier = "C9/985";
  }

  const targetDisciplines = request.targetDisciplines;
  const targetCountries = request.targetCountries;
  const filters: CaseSearchFilters = {
    ...defaultFilters,
    keyword: request.query,
    country: targetCountries?.[0] ?? recommendedFilters.country ?? "all",
    discipline: targetDisciplines?.[0] ?? recommendedFilters.discipline ?? "all",
    tier: recommendedFilters.tier ?? "all",
  };

  const results = searchCases(filters).slice(0, request.topK ?? 5);
  const fallbackResults =
    results.length > 0
      ? results
      : searchCases({ ...defaultFilters, keyword: "" }).slice(0, request.topK ?? 5);

  return {
    query: request.query,
    matchedCaseIds: fallbackResults.map((result) => result.caseRecord.id),
    contextBlocks: fallbackResults.map(({ caseRecord, score }) =>
      [
        `${caseRecord.id} | ${caseRecord.universityCn} ${caseRecord.program}`,
        `结果: ${resultLabels[caseRecord.result]} | 匹配分: ${score}`,
        `背景: ${caseRecord.profile.undergradTier} ${caseRecord.profile.major}, ${caseRecord.profile.gpaText}, ${formatLanguage(caseRecord)}, ${formatTests(caseRecord)}`,
        `策略: ${caseRecord.strategy}`,
      ].join("\n"),
    ),
    recommendedFilters,
  };
}
