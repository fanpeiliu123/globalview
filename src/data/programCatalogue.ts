import type { ProgramSource } from "../lib/types";
import { programSources as seedProgramSources } from "./programSources";
import realProgramsUrl from "./realPrograms.json?url";

let cache: ProgramSource[] | null = null;

export async function loadProgramCatalogue(): Promise<ProgramSource[]> {
  if (cache) return cache;

  try {
    const response = await fetch(realProgramsUrl);
    if (!response.ok) throw new Error(`Failed to load ${realProgramsUrl}`);
    const data = (await response.json()) as ProgramSource[];
    cache = Array.isArray(data) && data.length > 0 ? data : seedProgramSources;
  } catch {
    cache = seedProgramSources;
  }

  return cache;
}
