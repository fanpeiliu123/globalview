import type { CaseRecord } from "../lib/types";
import { admissionCases } from "./cases";
import { additionalCases } from "./casesExtra";

/**
 * The single source of truth for the case dataset consumed by the app.
 * Seed cases (cases.ts) + the expanded synthetic set (casesExtra.ts).
 * When real data is imported, append it here or swap for an API-backed list.
 */
export const allCases: CaseRecord[] = [...admissionCases, ...additionalCases];
