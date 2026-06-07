import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useI18n } from "../i18n";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { ResultPill } from "../components/ui/common";
import { AiAssist } from "../components/AiAssist";
import { countryByCode, countryMeta } from "../lib/geo";
import { programSources } from "../data/programSources";
import {
  defaultFilters,
  formatLanguage,
  formatTests,
  getFilterOptions,
  getProgramById,
  searchCases,
  sortResults,
} from "../lib/search";
import type {
  AdmissionResult,
  CaseRecord,
  CaseSearchFilters,
  CaseSortKey,
  CountryCode,
  Discipline,
  UndergraduateTier,
} from "../lib/types";

const tierOptions: UndergraduateTier[] = [
  "C9/985",
  "211",
  "双非一本",
  "中外合作",
  "海外本科",
];

const resultOptions: AdmissionResult[] = ["admit", "conditional", "waitlist", "reject"];
const sortOptions: CaseSortKey[] = ["match", "gpaDesc", "gpaAsc", "recent"];

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function FilterPanel({
  filters,
  updateFilter,
  resetFilters,
}: {
  filters: CaseSearchFilters;
  updateFilter: <K extends keyof CaseSearchFilters>(key: K, value: CaseSearchFilters[K]) => void;
  resetFilters: () => void;
}) {
  const { t, discipline: dLabel, tier: tierLabel, locale } = useI18n();
  const options = getFilterOptions();
  const universities = unique(
    programSources
      .filter((program) => filters.country === "all" || program.country === filters.country)
      .map((program) => program.universityCn),
  ).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const programs = programSources.filter(
    (program) =>
      (filters.country === "all" || program.country === filters.country) &&
      (filters.university === "all" || program.universityCn === filters.university),
  );

  return (
    <aside className="filter-panel card">
      <div className="filter-head">
        <Filter size={17} />
        <span>{t("explorer.filters")}</span>
      </div>

      <div className="field">
        <span className="field-label">{t("explorer.keyword")}</span>
        <div className="input-shell">
          <Search size={16} />
          <input
            value={filters.keyword}
            onChange={(event) => updateFilter("keyword", event.target.value)}
            placeholder={t("explorer.keywordPh")}
          />
          {filters.keyword ? (
            <button className="clear-x" onClick={() => updateFilter("keyword", "")} aria-label="clear">
              <X size={14} />
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>

      <div className="field">
        <span className="field-label">{t("explorer.country")}</span>
        <select
          className="select"
          value={filters.country}
          onChange={(event) =>
            updateFilter("country", event.target.value as CaseSearchFilters["country"])
          }
        >
          <option value="all">{t("common.all")}</option>
          {countryMeta
            .filter((meta) => options.countries.includes(meta.code))
            .map((meta) => (
              <option key={meta.code} value={meta.code}>
                {meta.flag} {locale === "en" ? meta.en : meta.zh}
              </option>
            ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">{t("explorer.university")}</span>
        <select
          className="select"
          value={filters.university}
          onChange={(event) => updateFilter("university", event.target.value)}
        >
          <option value="all">{t("common.all")}</option>
          {universities.map((university) => (
            <option key={university} value={university}>
              {university}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">{t("explorer.program")}</span>
        <select
          className="select"
          value={filters.programId}
          onChange={(event) => updateFilter("programId", event.target.value)}
        >
          <option value="all">{t("common.all")}</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.program}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">{t("explorer.discipline")}</span>
        <select
          className="select"
          value={filters.discipline}
          onChange={(event) =>
            updateFilter("discipline", event.target.value as "all" | Discipline)
          }
        >
          <option value="all">{t("common.all")}</option>
          {options.disciplines.map((d) => (
            <option key={d} value={d}>
              {dLabel(d)}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">{t("explorer.result")}</span>
        <select
          className="select"
          value={filters.result}
          onChange={(event) =>
            updateFilter("result", event.target.value as "all" | AdmissionResult)
          }
        >
          <option value="all">{t("common.all")}</option>
          {resultOptions.map((key) => (
            <option key={key} value={key}>
              {t(`result.${key}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">{t("explorer.tier")}</span>
        <select
          className="select"
          value={filters.tier}
          onChange={(event) =>
            updateFilter("tier", event.target.value as "all" | UndergraduateTier)
          }
        >
          <option value="all">{t("common.all")}</option>
          {tierOptions.map((tier) => (
            <option key={tier} value={tier}>
              {tierLabel(tier)}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">
          {t("explorer.minGpa")} · <b>{filters.minGpa.toFixed(1)}</b>
        </span>
        <input
          className="range"
          type="range"
          min="0"
          max="4"
          step="0.1"
          value={filters.minGpa}
          onChange={(event) => updateFilter("minGpa", Number(event.target.value))}
        />
      </div>

      <div className="field">
        <span className="field-label">
          {t("explorer.minLang")} · <b>{filters.minLanguage}</b>
        </span>
        <input
          className="range"
          type="range"
          min="0"
          max="115"
          step="1"
          value={filters.minLanguage}
          onChange={(event) => updateFilter("minLanguage", Number(event.target.value))}
        />
      </div>

      <div className="field">
        <span className="field-label">{t("explorer.greGmat")}</span>
        <select
          className="select"
          value={filters.withGreGmat}
          onChange={(event) =>
            updateFilter("withGreGmat", event.target.value as CaseSearchFilters["withGreGmat"])
          }
        >
          <option value="all">{t("common.all")}</option>
          <option value="yes">{t("explorer.greGmat.yes")}</option>
          <option value="no">{t("explorer.greGmat.no")}</option>
        </select>
      </div>

      <button className="btn btn-ghost btn-block" onClick={resetFilters}>
        <RotateCcw size={15} />
        {t("explorer.resetAll")}
      </button>
    </aside>
  );
}

function CaseCard({
  result,
  isSelected,
  isCompared,
  onSelect,
  onCompare,
}: {
  result: ReturnType<typeof searchCases>[number];
  isSelected: boolean;
  isCompared: boolean;
  onSelect: () => void;
  onCompare: () => void;
}) {
  const { t, discipline: dLabel, tier: tierLabel } = useI18n();
  const c = result.caseRecord;
  const meta = countryByCode[c.country];

  return (
    <article className={`case-card${isSelected ? " selected" : ""}`}>
      <button className="case-main" onClick={onSelect}>
        <div className="case-card-top">
          <div className="case-card-id">
            <span className="flag">{meta?.flag}</span>
            <span className="mono">{c.id}</span>
          </div>
          <ResultPill result={c.result} />
        </div>
        <h3>{c.universityCn}</h3>
        <p className="case-program">{c.program}</p>

        <div className="case-meta-grid">
          <span>{dLabel(c.discipline)}</span>
          <span>{tierLabel(c.profile.undergradTier)}</span>
          <span>{c.profile.gpaText}</span>
          <span>{formatLanguage(c)}</span>
        </div>

        <p className="case-strategy">{c.strategy}</p>

        <div className="tag-row">
          {c.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="chip chip-brand">
              {tag}
            </span>
          ))}
        </div>
      </button>

      <div className="case-card-foot">
        <span className="match-score">
          {result.score} {t("common.match")}
        </span>
        <div className="case-card-foot-actions">
          <button
            className={`chip${isCompared ? " active" : ""}`}
            onClick={onCompare}
            title={t("common.compare")}
          >
            {isCompared ? <X size={14} /> : <CheckCircle2 size={14} />}
            {t("common.compare")}
          </button>
          <Link to={`/case/${c.id}`} className="chip case-detail-link">
            {t("common.viewDetail")}
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function QuickView({
  caseRecord,
  comparedCases,
}: {
  caseRecord: CaseRecord;
  comparedCases: CaseRecord[];
}) {
  const { t, discipline: dLabel, tier: tierLabel } = useI18n();
  const program = getProgramById(caseRecord.programId);

  return (
    <aside className="quickview card">
      <div className="quickview-head">
        <div>
          <span className="mono case-id">{caseRecord.id}</span>
          <h3>{caseRecord.universityCn}</h3>
          <p>{caseRecord.program}</p>
        </div>
        <ResultPill result={caseRecord.result} />
      </div>

      <div className="quickview-grid">
        <div>
          <span>{t("detail.season")}</span>
          <strong>{caseRecord.season}</strong>
        </div>
        <div>
          <span>{t("detail.offerDate")}</span>
          <strong>{caseRecord.offerDate}</strong>
        </div>
        <div>
          <span>{t("explorer.discipline")}</span>
          <strong>{dLabel(caseRecord.discipline)}</strong>
        </div>
        <div>
          <span>{t("detail.scholarship")}</span>
          <strong>{caseRecord.scholarship}</strong>
        </div>
      </div>

      <div className="quickview-section">
        <h4>{t("detail.background")}</h4>
        <dl className="profile-list">
          <div>
            <dt>{t("detail.undergrad")}</dt>
            <dd>{tierLabel(caseRecord.profile.undergradTier)} · {caseRecord.profile.undergradSchool}</dd>
          </div>
          <div>
            <dt>{t("detail.major")}</dt>
            <dd>{caseRecord.profile.major}</dd>
          </div>
          <div>
            <dt>{t("detail.gpa")}</dt>
            <dd>{caseRecord.profile.gpaText}</dd>
          </div>
          <div>
            <dt>{t("detail.tests")}</dt>
            <dd>{formatLanguage(caseRecord)} · {formatTests(caseRecord)}</dd>
          </div>
        </dl>
      </div>

      <div className="quickview-section">
        <h4>{t("detail.strategy")}</h4>
        <p className="quickview-strategy">{caseRecord.strategy}</p>
      </div>

      {program ? (
        <a className="quickview-source" href={program.officialUrl} target="_blank" rel="noreferrer">
          {program.universityCn} · {program.duration} · {t("common.official")}
          <ArrowRight size={14} />
        </a>
      ) : null}

      {comparedCases.length > 0 ? (
        <div className="quickview-section">
          <h4>{t("common.compare")} · {comparedCases.length}</h4>
          <div className="compare-mini">
            {comparedCases.map((item) => (
              <div key={item.id}>
                <strong>{item.universityCn}</strong>
                <span>{tierLabel(item.profile.undergradTier)} · {item.profile.gpaText}</span>
                <ResultPill result={item.result} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Link to={`/case/${caseRecord.id}`} className="btn btn-primary btn-block">
        {t("common.viewDetail")}
        <ArrowRight size={16} />
      </Link>
    </aside>
  );
}

export function ExplorerPage() {
  const { t, locale, discipline: dLabel, tier: tierLabel } = useI18n();
  useDocumentMeta(`${t("explorer.title")} · ${t("brand.name")}`);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<CaseSearchFilters>(() => ({
    ...defaultFilters,
    keyword: searchParams.get("q") ?? "",
  }));
  const [sortKey, setSortKey] = useState<CaseSortKey>("match");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const searchResults = useMemo(() => {
    const base = searchCases(filters);
    return sortResults(base, sortKey);
  }, [filters, sortKey]);

  const selectedCase =
    searchResults.find((result) => result.caseRecord.id === selectedCaseId)?.caseRecord ??
    searchResults[0]?.caseRecord;

  const comparedCases = compareIds
    .map((id) => searchCases(defaultFilters).find((r) => r.caseRecord.id === id)?.caseRecord)
    .filter((item): item is CaseRecord => Boolean(item));

  function updateFilter<K extends keyof CaseSearchFilters>(key: K, value: CaseSearchFilters[K]) {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key === "country") {
        next.university = "all";
        next.programId = "all";
      }
      if (key === "university") {
        next.programId = "all";
      }
      return next;
    });
    if (key === "keyword") {
      const next = new URLSearchParams(searchParams);
      if (value) next.set("q", String(value));
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }
  }

  function resetFilters() {
    setFilters(defaultFilters);
    setSearchParams({}, { replace: true });
  }

  function applyAiFilters(reco: Partial<CaseSearchFilters>) {
    setFilters((current) => ({
      ...current,
      ...reco,
      university: "all",
      programId: "all",
    }));
  }

  function toggleCompare(id: string) {
    setCompareIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id].slice(-3),
    );
  }

  // Active filter chips
  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filters.country !== "all") {
    const meta = countryByCode[filters.country as CountryCode];
    activeChips.push({
      key: "country",
      label: `${meta?.flag ?? ""} ${locale === "en" ? meta?.en : meta?.zh}`,
      clear: () => updateFilter("country", "all"),
    });
  }
  if (filters.university !== "all")
    activeChips.push({ key: "uni", label: filters.university, clear: () => updateFilter("university", "all") });
  if (filters.discipline !== "all")
    activeChips.push({ key: "disc", label: dLabel(filters.discipline), clear: () => updateFilter("discipline", "all") });
  if (filters.result !== "all")
    activeChips.push({ key: "res", label: t(`result.${filters.result}`), clear: () => updateFilter("result", "all") });
  if (filters.tier !== "all")
    activeChips.push({ key: "tier", label: tierLabel(filters.tier), clear: () => updateFilter("tier", "all") });
  if (filters.minGpa > 0)
    activeChips.push({ key: "gpa", label: `GPA ≥ ${filters.minGpa.toFixed(1)}`, clear: () => updateFilter("minGpa", 0) });
  if (filters.withGreGmat !== "all")
    activeChips.push({
      key: "gre",
      label: `GRE/GMAT · ${t(`explorer.greGmat.${filters.withGreGmat}`)}`,
      clear: () => updateFilter("withGreGmat", "all"),
    });

  const positiveCount = searchResults.filter(
    (r) => r.caseRecord.result === "admit" || r.caseRecord.result === "conditional",
  ).length;

  useEffect(() => {
    setSelectedCaseId(null);
  }, [filters, sortKey]);

  return (
    <div className="page page-explorer">
      <div className="page-head container-wide">
        <div>
          <h1 className="page-title serif">{t("explorer.title")}</h1>
          <p className="page-sub">{t("explorer.subtitle")}</p>
        </div>
        <button
          className="btn btn-ghost btn-sm filter-toggle-mobile"
          onClick={() => setShowFiltersMobile((v) => !v)}
        >
          <SlidersHorizontal size={15} />
          {t("explorer.filters")}
        </button>
      </div>

      <div className="container-wide explorer-ai">
        <AiAssist onApply={applyAiFilters} />
      </div>

      <div className="container-wide workspace">
        <div className={`workspace-filters${showFiltersMobile ? " is-open" : ""}`}>
          <FilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} />
        </div>

        <section className="workspace-results">
          <div className="results-bar">
            <div className="results-count">
              <strong>{searchResults.length}</strong>
              <span>{t("explorer.resultsCount")}</span>
              <em className="results-positive">
                {positiveCount} {t("explorer.successRef")}
              </em>
            </div>
            <label className="sort-control">
              <span>{t("explorer.sort")}</span>
              <select
                className="select select-sm"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as CaseSortKey)}
              >
                {sortOptions.map((key) => (
                  <option key={key} value={key}>
                    {t(`explorer.sort.${key}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {activeChips.length > 0 ? (
            <div className="active-chips">
              <span className="active-chips-label">{t("explorer.activeFilters")}</span>
              {activeChips.map((chip) => (
                <button key={chip.key} className="chip chip-active" onClick={chip.clear}>
                  {chip.label}
                  <X size={13} />
                </button>
              ))}
              <button className="active-clear" onClick={resetFilters}>
                {t("common.reset")}
              </button>
            </div>
          ) : null}

          <div className="case-list">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <CaseCard
                  key={result.caseRecord.id}
                  result={result}
                  isSelected={selectedCase?.id === result.caseRecord.id}
                  isCompared={compareIds.includes(result.caseRecord.id)}
                  onSelect={() => setSelectedCaseId(result.caseRecord.id)}
                  onCompare={() => toggleCompare(result.caseRecord.id)}
                />
              ))
            ) : (
              <div className="empty-state">
                <Search size={26} />
                <strong>{t("explorer.empty.title")}</strong>
                <span>{t("explorer.empty.desc")}</span>
                <button className="btn btn-soft btn-sm" onClick={resetFilters}>
                  <RotateCcw size={14} />
                  {t("common.reset")}
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="workspace-detail">
          {selectedCase ? (
            <QuickView caseRecord={selectedCase} comparedCases={comparedCases} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
