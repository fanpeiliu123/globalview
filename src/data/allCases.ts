import type { CaseRecord } from "../lib/types";
import { admissionCases } from "./cases";
import { additionalCases } from "./casesExtra";
import realCasesRaw from "./realCases.json";

/**
 * Single source of truth for the case dataset consumed by the app.
 *
 * DESIGNATED DROP-IN LOCATION: put your real, anonymized cases into
 * `src/data/realCases.json` (an array of CaseRecord objects). As soon as that
 * file is a non-empty array it REPLACES the synthetic seed data below.
 *
 * Generate it from a CSV/JSON with:
 *   npm run import:cases -- <your-file.csv> src/data/realCases.json
 * Then validate it with:
 *   npm run validate:data
 *
 * See docs/database-setup.md for the full workflow.
 */
const seedCases: CaseRecord[] = [...admissionCases, ...additionalCases];
const realCases = realCasesRaw as unknown as CaseRecord[];

export const usingRealCaseData = realCases.length > 0;
export const allCases: CaseRecord[] = usingRealCaseData ? realCases : seedCases;
