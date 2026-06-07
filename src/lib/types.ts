export type DegreeLevel = "master";

export type CountryCode =
  | "US"
  | "UK"
  | "CA"
  | "AU"
  | "SG"
  | "HK"
  | "CH"
  | "DE"
  | "NL"
  | "JP";

export type AdmissionResult =
  | "admit"
  | "conditional"
  | "waitlist"
  | "reject";

export type Discipline =
  | "计算机与数据"
  | "商业分析"
  | "管理与市场"
  | "信息系统"
  | "金融商科";

export type UndergraduateTier =
  | "C9/985"
  | "211"
  | "双非一本"
  | "中外合作"
  | "海外本科";

export type ProgramSelectivity = "高竞争" | "中高竞争" | "稳健匹配";

export interface ProgramSource {
  id: string;
  country: CountryCode;
  countryName: string;
  city: string;
  university: string;
  universityCn: string;
  program: string;
  degree: string;
  discipline: Discipline;
  duration: string;
  intake: string;
  selectivity: ProgramSelectivity;
  officialUrl: string;
  sourceNote: string;
  tags: string[];
  /** Optional enrichment used by the Programs catalogue. Safe to omit for imports. */
  qsRank?: number;
  tuition?: string;
  deadlineNote?: string;
  stemDesignated?: boolean;
}

export interface ApplicantProfile {
  undergradSchool: string;
  undergradTier: UndergraduateTier;
  major: string;
  gpa: number;
  gpaScale: number;
  gpaText: string;
  language: {
    ielts?: number;
    toefl?: number;
  };
  tests: {
    gre?: number;
    gmat?: number;
  };
  internships: string[];
  research: string[];
  workExperienceMonths: number;
  highlights: string[];
}

export interface CaseRecord {
  id: string;
  applicantAlias: string;
  degreeLevel: DegreeLevel;
  programId: string;
  country: CountryCode;
  countryName: string;
  university: string;
  universityCn: string;
  program: string;
  discipline: Discipline;
  result: AdmissionResult;
  season: string;
  round: string;
  offerDate: string;
  scholarship: string;
  profile: ApplicantProfile;
  strategy: string;
  timeline: string[];
  tags: string[];
  sourceType: "seed-synthetic" | "user-imported" | "partner-verified";
  privacyLevel: "anonymous";
}

export interface CaseSearchFilters {
  keyword: string;
  country: "all" | CountryCode;
  university: "all" | string;
  programId: "all" | string;
  discipline: "all" | Discipline;
  result: "all" | AdmissionResult;
  tier: "all" | UndergraduateTier;
  minGpa: number;
  minLanguage: number;
  withGreGmat: "all" | "yes" | "no";
}

export type CaseSortKey = "match" | "gpaDesc" | "gpaAsc" | "recent";

export interface SearchResult {
  caseRecord: CaseRecord;
  score: number;
  reasons: string[];
}

export interface AiRetrievalRequest {
  query: string;
  targetCountries?: CountryCode[];
  targetDisciplines?: Discipline[];
  applicantProfile?: Partial<ApplicantProfile>;
  topK?: number;
}

export interface AiRetrievalResponse {
  query: string;
  matchedCaseIds: string[];
  contextBlocks: string[];
  recommendedFilters: Partial<CaseSearchFilters>;
}

export interface CaseImportRow {
  country: string;
  university: string;
  program: string;
  discipline: string;
  result: string;
  season: string;
  undergradTier: string;
  major: string;
  gpa: string;
  language: string;
  tests: string;
  internships: string;
  research: string;
  strategy: string;
}
