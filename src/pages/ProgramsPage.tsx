import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Database,
  ExternalLink,
  GraduationCap,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import { useI18n } from "../i18n";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { CountryTag } from "../components/ui/common";
import { Reveal } from "../components/ui/common";
import { countryMeta } from "../lib/geo";
import { loadProgramCatalogue } from "../data/programCatalogue";
import catalogueSummary from "../data/programCatalogueStats.json";
import { allCases } from "../data/allCases";
import type { CountryCode, Discipline, ProgramSource } from "../lib/types";

type RankBand = "all" | "top10" | "top30" | "top50" | "top80";
type CoverageFilter = "all" | "language" | "deadline" | "tuition" | "enriched";
type ProgramSortKey = "rank" | "completeness" | "university" | "program";

const PAGE_SIZE = 96;

const rankBands: Array<{ key: RankBand; label: string; match: (rank?: number) => boolean }> = [
  { key: "all", label: "QS Top80", match: () => true },
  { key: "top10", label: "Top 10", match: (rank) => Boolean(rank && rank <= 10) },
  { key: "top30", label: "Top 30", match: (rank) => Boolean(rank && rank <= 30) },
  { key: "top50", label: "Top 50", match: (rank) => Boolean(rank && rank <= 50) },
  { key: "top80", label: "Top 80", match: (rank) => Boolean(rank && rank <= 80) },
];

const coverageFilters: Array<{ key: CoverageFilter; labelZh: string; labelEn: string }> = [
  { key: "all", labelZh: "全部字段", labelEn: "All fields" },
  { key: "language", labelZh: "有语言要求", labelEn: "Language available" },
  { key: "deadline", labelZh: "有截止日期", labelEn: "Deadline available" },
  { key: "tuition", labelZh: "有学费", labelEn: "Tuition available" },
  { key: "enriched", labelZh: "高完整度", labelEn: "Enriched records" },
];

function selectivityTone(selectivity: string) {
  if (selectivity === "高竞争") return "danger";
  if (selectivity === "中高竞争") return "warning";
  return "success";
}

export function ProgramsPage() {
  const { t, discipline: dLabel, locale } = useI18n();
  useDocumentMeta(`${t("programs.title")} · ${t("brand.name")}`);

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<"all" | CountryCode>("all");
  const [discipline, setDiscipline] = useState<"all" | Discipline>("all");
  const [rankBand, setRankBand] = useState<RankBand>("all");
  const [coverage, setCoverage] = useState<CoverageFilter>("all");
  const [sortKey, setSortKey] = useState<ProgramSortKey>("rank");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [programSources, setProgramSources] = useState<ProgramSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const caseCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of allCases) {
      map.set(item.programId, (map.get(item.programId) ?? 0) + 1);
    }
    return map;
  }, []);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    loadProgramCatalogue()
      .then((programs) => {
        if (isActive) setProgramSources(programs);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const disciplines = useMemo(
    () =>
      [...new Set(programSources.map((program) => program.discipline))].sort((a, b) =>
        a.localeCompare(b, "zh-CN"),
      ) as Discipline[],
    [programSources],
  );
  const availableCountries = countryMeta.filter((meta) =>
    programSources.some((program) => program.country === meta.code),
  );

  const catalogueStats = useMemo(() => {
    const universities = new Set(programSources.map((program) => program.universityId ?? program.university));
    const countries = new Set(programSources.map((program) => program.country));
    const withLanguage = programSources.filter((program) => program.languageRequirements).length;
    const withDeadline = programSources.filter((program) => program.deadlineNote).length;
    const withTuition = programSources.filter((program) => program.tuition).length;
    const avgCompleteness = programSources.length
      ? Math.round(
          programSources.reduce((sum, program) => sum + (program.dataCompleteness ?? 0), 0) /
            programSources.length,
        )
      : 0;
    return {
      universities: universities.size || catalogueSummary.universities,
      countries: countries.size || catalogueSummary.countries,
      withLanguage,
      withDeadline,
      withTuition,
      avgCompleteness: avgCompleteness || catalogueSummary.avgCompleteness,
    };
  }, [programSources]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rankMatcher =
      rankBands.find((item) => item.key === rankBand)?.match ?? rankBands[0].match;

    const result = programSources.filter((program) => {
      const searchable = [
        program.id,
        program.university,
        program.universityCn,
        program.program,
        program.programZh,
        program.degree,
        program.discipline,
        program.rawDiscipline,
        program.faculty,
        program.department,
        program.city,
        program.countryName,
        ...(program.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coverageMatch =
        coverage === "all" ||
        (coverage === "language" && Boolean(program.languageRequirements)) ||
        (coverage === "deadline" && Boolean(program.deadlineNote)) ||
        (coverage === "tuition" && Boolean(program.tuition)) ||
        (coverage === "enriched" && (program.dataCompleteness ?? 0) >= 45);

      return (
        (!needle || searchable.includes(needle)) &&
        (country === "all" || program.country === country) &&
        (discipline === "all" || program.discipline === discipline) &&
        rankMatcher(program.qsRank) &&
        coverageMatch
      );
    });

    return result.sort((a, b) => {
      if (sortKey === "completeness") {
        return (b.dataCompleteness ?? 0) - (a.dataCompleteness ?? 0) || (a.qsRank ?? 999) - (b.qsRank ?? 999);
      }
      if (sortKey === "university") {
        return a.university.localeCompare(b.university) || a.program.localeCompare(b.program);
      }
      if (sortKey === "program") {
        return a.program.localeCompare(b.program) || (a.qsRank ?? 999) - (b.qsRank ?? 999);
      }
      return (a.qsRank ?? 999) - (b.qsRank ?? 999) || a.university.localeCompare(b.university);
    });
  }, [country, coverage, discipline, programSources, query, rankBand, sortKey]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [country, coverage, discipline, query, rankBand, sortKey]);

  const visiblePrograms = filtered.slice(0, visibleCount);

  function resetFilters() {
    setQuery("");
    setCountry("all");
    setDiscipline("all");
    setRankBand("all");
    setCoverage("all");
    setSortKey("rank");
  }

  return (
    <div className="page page-programs">
      <div className="page-head container-wide">
        <div>
          <span className="eyebrow">{t("nav.programs")}</span>
          <h1 className="page-title serif">{t("programs.title")}</h1>
          <p className="page-sub">
            {t("programs.subtitle", {
              programs: programSources.length,
              countries: catalogueSummary.countries || availableCountries.length,
            })}
          </p>
        </div>
      </div>

      <div className="container-wide">
        <div className="programs-kpis">
          <Reveal className="program-kpi">
            <Database size={18} />
            <strong>{(programSources.length || catalogueSummary.programs).toLocaleString()}</strong>
            <span>{t("programs.count")}</span>
          </Reveal>
          <Reveal className="program-kpi">
            <GraduationCap size={18} />
            <strong>{catalogueStats.universities}</strong>
            <span>{t("common.universities")}</span>
          </Reveal>
          <Reveal className="program-kpi">
            <MapPin size={18} />
            <strong>{catalogueStats.countries}</strong>
            <span>{t("common.countries")}</span>
          </Reveal>
          <Reveal className="program-kpi">
            <Award size={18} />
            <strong>{catalogueStats.avgCompleteness}%</strong>
            <span>{locale === "en" ? "Avg. completeness" : "平均完整度"}</span>
          </Reveal>
        </div>

        <div className="programs-database-note card">
          <strong>{locale === "en" ? "Verified QS Top80 source" : "QS Top80 官方核验数据库"}</strong>
          <span>
            {locale === "en"
              ? "Core catalogue fields are complete. Tuition, deadline and language fields are shown only when verified in the source files."
              : "项目名称、学位、学院、学科和官方链接已完整导入；学费、截止日和语言要求只在核验文件中存在时展示，不做推测补全。"}
          </span>
        </div>

        <div className="programs-toolbar">
          <div className="program-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={locale === "en" ? "Search university, programme, faculty..." : "搜索大学、项目、学院、学科方向"}
              aria-label={t("common.search")}
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label={t("common.reset")}>
                ×
              </button>
            ) : null}
          </div>

          <div className="country-tabs">
            <button
              className={`country-tab${country === "all" ? " active" : ""}`}
              onClick={() => setCountry("all")}
            >
              {t("common.all")}
            </button>
            {availableCountries.map((meta) => (
              <button
                key={meta.code}
                className={`country-tab${country === meta.code ? " active" : ""}`}
                onClick={() => setCountry(country === meta.code ? "all" : meta.code)}
              >
                <span className="flag">{meta.flag}</span>
                {locale === "en" ? meta.en : meta.zh}
              </button>
            ))}
          </div>

          <div className="programs-toolbar-right">
            <select
              className="select select-sm"
              value={discipline}
              onChange={(event) => setDiscipline(event.target.value as "all" | Discipline)}
            >
              <option value="all">{t("programs.filterDiscipline")} · {t("common.all")}</option>
              {disciplines.map((d) => (
                <option key={d} value={d}>
                  {dLabel(d)}
                </option>
              ))}
            </select>
            <select
              className="select select-sm"
              value={rankBand}
              onChange={(event) => setRankBand(event.target.value as RankBand)}
            >
              {rankBands.map((band) => (
                <option key={band.key} value={band.key}>
                  {band.label}
                </option>
              ))}
            </select>
            <select
              className="select select-sm"
              value={coverage}
              onChange={(event) => setCoverage(event.target.value as CoverageFilter)}
            >
              {coverageFilters.map((item) => (
                <option key={item.key} value={item.key}>
                  {locale === "en" ? item.labelEn : item.labelZh}
                </option>
              ))}
            </select>
            <select
              className="select select-sm"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as ProgramSortKey)}
            >
              <option value="rank">{locale === "en" ? "Sort by QS rank" : "按 QS 排名"}</option>
              <option value="completeness">{locale === "en" ? "Sort by completeness" : "按完整度"}</option>
              <option value="university">{locale === "en" ? "Sort by university" : "按大学名称"}</option>
              <option value="program">{locale === "en" ? "Sort by programme" : "按项目名称"}</option>
            </select>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
              <RotateCcw size={14} />
              {t("common.reset")}
            </button>
            <span className="programs-count">
              <strong>{filtered.length.toLocaleString()}</strong> {t("programs.count")}
            </span>
          </div>
        </div>

        <div className="programs-grid">
          {isLoading ? (
            <div className="programs-loading card">
              <Database size={20} />
              <strong>{locale === "en" ? "Loading verified programme database" : "正在加载核验项目数据库"}</strong>
              <span>{locale === "en" ? "The QS Top80 catalogue is being loaded as a static data asset." : "QS Top80 全量项目库正在作为静态数据资产加载。"}</span>
            </div>
          ) : null}
          {visiblePrograms.map((program, index) => {
            const count = caseCounts.get(program.id) ?? 0;
            const completeness = program.dataCompleteness ?? 0;
            return (
              <Reveal key={program.id} delay={(index % 3) * 60} className="program-card card">
                <div className="program-card-top">
                  <CountryTag code={program.country} />
                  {program.stemDesignated ? <span className="badge badge-gold">{t("programs.stem")}</span> : null}
                  <span className={`pill ${selectivityTone(program.selectivity)} program-sel`}>
                    {t(`selectivity.${program.selectivity}`)}
                  </span>
                </div>

                <h3>{locale === "en" ? program.university : program.universityCn}</h3>
                <p className="program-name">{program.program}</p>
                {program.programZh ? <p className="program-name-zh">{program.programZh}</p> : null}
                <p className="program-city">
                  <MapPin size={13} /> {program.city} · {program.degree}
                </p>
                {program.faculty ? <p className="program-faculty">{program.faculty}</p> : null}

                <dl className="program-stats">
                  {program.qsRank ? (
                    <div>
                      <dt>{t("programs.qs")}</dt>
                      <dd>#{program.qsRank}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>{t("programs.duration")}</dt>
                    <dd>{program.duration}</dd>
                  </div>
                  <div>
                    <dt>{t("programs.intake")}</dt>
                    <dd>{program.intake}</dd>
                  </div>
                  <div>
                    <dt>{t("programs.deadline")}</dt>
                    <dd>{program.deadlineNote ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>{t("programs.tuition")}</dt>
                    <dd>{program.tuition ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>{t("explorer.discipline")}</dt>
                    <dd>{dLabel(program.discipline)}</dd>
                  </div>
                  <div>
                    <dt>{locale === "en" ? "Language" : "语言要求"}</dt>
                    <dd>{program.languageRequirements ?? "—"}</dd>
                  </div>
                </dl>

                <div className="program-quality">
                  <span>{locale === "en" ? "Data completeness" : "字段完整度"}</span>
                  <strong>{completeness}%</strong>
                  <i style={{ width: `${Math.max(6, completeness)}%` }} />
                </div>

                <div className="program-card-foot">
                  <Link
                    to={`/explorer?q=${encodeURIComponent(program.program)}`}
                    className="program-cases"
                  >
                    {count > 0 ? `${count} ${t("common.cases")}` : t("programs.casesLink")}
                    <ArrowRight size={13} />
                  </Link>
                  <a
                    href={program.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="program-official"
                  >
                    {t("programs.viewProgram")}
                    <ExternalLink size={13} />
                  </a>
                </div>
              </Reveal>
            );
          })}
          {!isLoading && visiblePrograms.length === 0 ? (
            <div className="programs-loading card">
              <Search size={20} />
              <strong>{locale === "en" ? "No programmes match" : "暂无匹配项目"}</strong>
              <span>{locale === "en" ? "Adjust keyword, country, discipline or coverage filters." : "请调整关键词、国家、学科、排名或字段覆盖条件。"}</span>
            </div>
          ) : null}
        </div>

        {visibleCount < filtered.length ? (
          <div className="program-loadmore">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            >
              {locale === "en" ? "Load more programmes" : "加载更多项目"}
              <ArrowRight size={16} />
            </button>
            <span>
              {visiblePrograms.length.toLocaleString()} / {filtered.length.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
