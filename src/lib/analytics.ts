import { allCases } from "../data/allCases";
import catalogueStats from "../data/programCatalogueStats.json";
import { programSources } from "../data/programSources";
import { countryMeta } from "./geo";
import type {
  AdmissionResult,
  CaseRecord,
  CountryCode,
  Discipline,
  UndergraduateTier,
} from "./types";

const RESULTS: AdmissionResult[] = ["admit", "conditional", "waitlist", "reject"];
const TIERS: UndergraduateTier[] = [
  "C9/985",
  "211",
  "双非一本",
  "中外合作",
  "海外本科",
];

function pct(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

function isPositive(result: AdmissionResult) {
  return result === "admit" || result === "conditional";
}

export function outcomeBreakdown(cases: CaseRecord[] = allCases) {
  const total = cases.length;
  return RESULTS.map((result) => {
    const count = cases.filter((item) => item.result === result).length;
    return { result, count, pct: pct(count, total) };
  });
}

export function countryDistribution(cases: CaseRecord[] = allCases) {
  return countryMeta
    .map((meta) => {
      const records = cases.filter((item) => item.country === meta.code);
      const admits = records.filter((item) => isPositive(item.result)).length;
      return {
        code: meta.code as CountryCode,
        meta,
        count: records.length,
        admits,
        admitRate: pct(admits, records.length),
      };
    })
    .filter((bucket) => bucket.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function disciplineDistribution(cases: CaseRecord[] = allCases) {
  const disciplines = [...new Set(cases.map((item) => item.discipline))] as Discipline[];
  return disciplines
    .map((discipline) => {
      const records = cases.filter((item) => item.discipline === discipline);
      const admits = records.filter((item) => isPositive(item.result)).length;
      return {
        discipline,
        count: records.length,
        admits,
        admitRate: pct(admits, records.length),
      };
    })
    .sort((a, b) => b.count - a.count);
}

export interface TierOutcomeRow {
  tier: UndergraduateTier;
  total: number;
  admitRate: number;
  counts: Record<AdmissionResult, number>;
}

export function tierOutcome(cases: CaseRecord[] = allCases): TierOutcomeRow[] {
  return TIERS.map((tier) => {
    const records = cases.filter((item) => item.profile.undergradTier === tier);
    const counts = RESULTS.reduce(
      (acc, result) => {
        acc[result] = records.filter((item) => item.result === result).length;
        return acc;
      },
      {} as Record<AdmissionResult, number>,
    );
    const admits = records.filter((item) => isPositive(item.result)).length;
    return { tier, total: records.length, admitRate: pct(admits, records.length), counts };
  }).filter((row) => row.total > 0);
}

export interface GpaBin {
  label: string;
  min: number;
  max: number;
  count: number;
  admits: number;
}

export function gpaDistribution(cases: CaseRecord[] = allCases): GpaBin[] {
  const bins: GpaBin[] = [
    { label: "<3.2", min: 0, max: 3.2, count: 0, admits: 0 },
    { label: "3.2–3.4", min: 3.2, max: 3.4, count: 0, admits: 0 },
    { label: "3.4–3.6", min: 3.4, max: 3.6, count: 0, admits: 0 },
    { label: "3.6–3.8", min: 3.6, max: 3.8, count: 0, admits: 0 },
    { label: "≥3.8", min: 3.8, max: 5, count: 0, admits: 0 },
  ];
  for (const item of cases) {
    const gpa = item.profile.gpa;
    const bin = bins.find((b) => gpa >= b.min && gpa < b.max) ?? bins[bins.length - 1];
    bin.count += 1;
    if (isPositive(item.result)) bin.admits += 1;
  }
  return bins;
}

export interface SeasonPoint {
  key: string;
  label: string;
  count: number;
  admits: number;
}

/** Decision cadence across the cycle, bucketed by offer-decision month. */
export function seasonCadence(cases: CaseRecord[] = allCases): SeasonPoint[] {
  const order = [
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
    "2026-04",
    "2026-05",
  ];
  const labels: Record<string, string> = {
    "2025-10": "10月",
    "2025-11": "11月",
    "2025-12": "12月",
    "2026-01": "1月",
    "2026-02": "2月",
    "2026-03": "3月",
    "2026-04": "4月",
    "2026-05": "5月",
  };
  return order.map((key) => {
    const records = cases.filter((item) => item.offerDate.startsWith(key));
    return {
      key,
      label: labels[key] ?? key,
      count: records.length,
      admits: records.filter((item) => isPositive(item.result)).length,
    };
  });
}

export function topPrograms(cases: CaseRecord[] = allCases, limit = 8) {
  const map = new Map<string, { count: number; admits: number }>();
  for (const item of cases) {
    const entry = map.get(item.programId) ?? { count: 0, admits: 0 };
    entry.count += 1;
    if (isPositive(item.result)) entry.admits += 1;
    map.set(item.programId, entry);
  }
  return [...map.entries()]
    .map(([programId, value]) => {
      const program = programSources.find((p) => p.id === programId);
      return {
        programId,
        program,
        count: value.count,
        admits: value.admits,
        admitRate: pct(value.admits, value.count),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function gpaStats(cases: CaseRecord[] = allCases) {
  if (!cases.length) return { avg: 0, min: 0, max: 0 };
  const gpas = cases.map((item) => item.profile.gpa);
  const avg = gpas.reduce((sum, g) => sum + g, 0) / gpas.length;
  return {
    avg: Math.round(avg * 100) / 100,
    min: Math.min(...gpas),
    max: Math.max(...gpas),
  };
}

export function summaryStats(cases: CaseRecord[] = allCases) {
  const admits = cases.filter((item) => isPositive(item.result)).length;
  const catalogProgramCount = Number(catalogueStats.programs || 0);
  const programCountries =
    Number(catalogueStats.countries || 0) ||
    new Set(programSources.map((item) => item.country)).size;
  const programUniversities =
    Number(catalogueStats.universities || 0) ||
    new Set(programSources.map((item) => item.universityId ?? item.university)).size;
  return {
    total: cases.length,
    // "头部硕士项目" reflects the official program catalogue coverage.
    programs: catalogProgramCount || programSources.length,
    casedPrograms: new Set(cases.map((item) => item.programId)).size,
    countries: programCountries || new Set(cases.map((item) => item.country)).size,
    universities: programUniversities || new Set(cases.map((item) => item.universityCn)).size,
    admitRate: pct(admits, cases.length),
    gpa: gpaStats(cases),
  };
}
