import {
  ArrowUpDown,
  BookOpen,
  Bot,
  CheckCircle2,
  Database,
  FileDown,
  Filter,
  Globe2,
  GraduationCap,
  Link as LinkIcon,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { plannedApiRoutes, programSources } from "./lib/repository";
import {
  buildAiRetrievalContext,
  countryLabels,
  defaultFilters,
  findSimilarCases,
  formatLanguage,
  formatTests,
  getCountryBuckets,
  getFilterOptions,
  getProgramById,
  getStats,
  getTaxonomy,
  resultLabels,
  resultTone,
  searchCases,
} from "./lib/search";
import type {
  AdmissionResult,
  CaseRecord,
  CaseSearchFilters,
  CountryCode,
  Discipline,
  UndergraduateTier,
} from "./lib/types";

type ViewMode = "cases" | "taxonomy" | "interfaces";

const viewModes: Array<{ id: ViewMode; label: string }> = [
  { id: "cases", label: "案例检索" },
  { id: "taxonomy", label: "分类图谱" },
  { id: "interfaces", label: "导入与接口" },
];

const tierOptions: UndergraduateTier[] = [
  "C9/985",
  "211",
  "双非一本",
  "中外合作",
  "海外本科",
];

function formatPercent(value: number) {
  return `${value}%`;
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function Metric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function ResultPill({ result }: { result: AdmissionResult }) {
  return (
    <span className={`result-pill ${resultTone[result]}`}>
      {resultLabels[result]}
    </span>
  );
}

function FilterPanel({
  filters,
  updateFilter,
  resetFilters,
}: {
  filters: CaseSearchFilters;
  updateFilter: <K extends keyof CaseSearchFilters>(
    key: K,
    value: CaseSearchFilters[K],
  ) => void;
  resetFilters: () => void;
}) {
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
    <aside className="filter-panel">
      <div className="panel-title">
        <Filter size={18} />
        <span>筛选条件</span>
      </div>

      <label className="field search-field">
        <span>关键词</span>
        <div className="input-shell">
          <Search size={16} />
          <input
            value={filters.keyword}
            onChange={(event) => updateFilter("keyword", event.target.value)}
            placeholder="学校、项目、背景、标签"
          />
        </div>
      </label>

      <label className="field">
        <span>国家/地区</span>
        <select
          value={filters.country}
          onChange={(event) =>
            updateFilter("country", event.target.value as CaseSearchFilters["country"])
          }
        >
          <option value="all">全部</option>
          {options.countries.map((country) => (
            <option key={country} value={country}>
              {countryLabels[country]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>大学</span>
        <select
          value={filters.university}
          onChange={(event) => updateFilter("university", event.target.value)}
        >
          <option value="all">全部</option>
          {universities.map((university) => (
            <option key={university} value={university}>
              {university}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>项目</span>
        <select
          value={filters.programId}
          onChange={(event) => updateFilter("programId", event.target.value)}
        >
          <option value="all">全部</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.program}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>方向</span>
        <select
          value={filters.discipline}
          onChange={(event) =>
            updateFilter("discipline", event.target.value as "all" | Discipline)
          }
        >
          <option value="all">全部</option>
          {options.disciplines.map((discipline) => (
            <option key={discipline} value={discipline}>
              {discipline}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>结果</span>
        <select
          value={filters.result}
          onChange={(event) =>
            updateFilter("result", event.target.value as "all" | AdmissionResult)
          }
        >
          <option value="all">全部</option>
          {Object.entries(resultLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>本科层级</span>
        <select
          value={filters.tier}
          onChange={(event) =>
            updateFilter("tier", event.target.value as "all" | UndergraduateTier)
          }
        >
          <option value="all">全部</option>
          {tierOptions.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
      </label>

      <label className="range-field">
        <span>最低 GPA {filters.minGpa.toFixed(1)}</span>
        <input
          type="range"
          min="0"
          max="4"
          step="0.1"
          value={filters.minGpa}
          onChange={(event) => updateFilter("minGpa", Number(event.target.value))}
        />
      </label>

      <label className="range-field">
        <span>语言线 TOEFL 等效 {filters.minLanguage}</span>
        <input
          type="range"
          min="0"
          max="115"
          step="1"
          value={filters.minLanguage}
          onChange={(event) => updateFilter("minLanguage", Number(event.target.value))}
        />
      </label>

      <label className="field">
        <span>GRE/GMAT</span>
        <select
          value={filters.withGreGmat}
          onChange={(event) =>
            updateFilter(
              "withGreGmat",
              event.target.value as CaseSearchFilters["withGreGmat"],
            )
          }
        >
          <option value="all">不限</option>
          <option value="yes">已提交</option>
          <option value="no">未提交</option>
        </select>
      </label>

      <button className="secondary-button full-button" onClick={resetFilters}>
        <RotateCcw size={16} />
        重置筛选
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
  const caseRecord = result.caseRecord;

  return (
    <article className={`case-card ${isSelected ? "selected" : ""}`}>
      <button className="case-main" onClick={onSelect}>
        <div className="case-card-top">
          <div>
            <span className="case-id">{caseRecord.id}</span>
            <h3>{caseRecord.universityCn}</h3>
            <p>{caseRecord.program}</p>
          </div>
          <ResultPill result={caseRecord.result} />
        </div>

        <div className="case-meta-grid">
          <span>{caseRecord.countryName}</span>
          <span>{caseRecord.discipline}</span>
          <span>{caseRecord.profile.undergradTier}</span>
          <span>{caseRecord.profile.gpaText}</span>
          <span>{formatLanguage(caseRecord)}</span>
          <span>{formatTests(caseRecord)}</span>
        </div>

        <p className="case-strategy">{caseRecord.strategy}</p>

        <div className="tag-row">
          {caseRecord.tags.slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </button>

      <div className="case-card-actions">
        <span className="match-score">{result.score} 匹配</span>
        <button className={isCompared ? "compare active" : "compare"} onClick={onCompare}>
          {isCompared ? <X size={15} /> : <CheckCircle2 size={15} />}
          对比
        </button>
      </div>
    </article>
  );
}

function DetailPanel({
  caseRecord,
  comparedCases,
}: {
  caseRecord: CaseRecord;
  comparedCases: CaseRecord[];
}) {
  const program = getProgramById(caseRecord.programId);
  const similarCases = findSimilarCases(caseRecord);

  return (
    <aside className="detail-panel">
      <div className="detail-header">
        <div>
          <span className="case-id">{caseRecord.id}</span>
          <h2>{caseRecord.applicantAlias}</h2>
          <p>
            {caseRecord.universityCn} · {caseRecord.program}
          </p>
        </div>
        <ResultPill result={caseRecord.result} />
      </div>

      <div className="detail-grid">
        <div>
          <span>申请季</span>
          <strong>{caseRecord.season}</strong>
        </div>
        <div>
          <span>轮次</span>
          <strong>{caseRecord.round}</strong>
        </div>
        <div>
          <span>结果日期</span>
          <strong>{caseRecord.offerDate}</strong>
        </div>
        <div>
          <span>奖学金</span>
          <strong>{caseRecord.scholarship}</strong>
        </div>
      </div>

      <section className="detail-section">
        <h3>申请人背景</h3>
        <dl className="profile-list">
          <div>
            <dt>本科</dt>
            <dd>
              {caseRecord.profile.undergradSchool} / {caseRecord.profile.undergradTier}
            </dd>
          </div>
          <div>
            <dt>专业</dt>
            <dd>{caseRecord.profile.major}</dd>
          </div>
          <div>
            <dt>成绩</dt>
            <dd>{caseRecord.profile.gpaText}</dd>
          </div>
          <div>
            <dt>语言</dt>
            <dd>{formatLanguage(caseRecord)}</dd>
          </div>
          <div>
            <dt>标化</dt>
            <dd>{formatTests(caseRecord)}</dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <h3>材料信号</h3>
        <div className="signal-list">
          {caseRecord.profile.highlights.map((highlight) => (
            <span key={highlight}>{highlight}</span>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h3>实习与科研</h3>
        <ul className="compact-list">
          {[...caseRecord.profile.internships, ...caseRecord.profile.research].map(
            (item) => (
              <li key={item}>{item}</li>
            ),
          )}
        </ul>
      </section>

      <section className="detail-section">
        <h3>申请策略</h3>
        <p>{caseRecord.strategy}</p>
      </section>

      <section className="detail-section">
        <h3>时间线</h3>
        <ol className="timeline">
          {caseRecord.timeline.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      {program ? (
        <section className="detail-section source-section">
          <h3>项目源</h3>
          <p>
            {program.universityCn} · {program.program} · {program.duration}
          </p>
          <a href={program.officialUrl} target="_blank" rel="noreferrer">
            <LinkIcon size={15} />
            官方项目页
          </a>
        </section>
      ) : null}

      <section className="detail-section">
        <h3>相似案例</h3>
        <div className="similar-list">
          {similarCases.map((item) => (
            <span key={item.id}>
              {item.id} · {item.universityCn}
            </span>
          ))}
        </div>
      </section>

      {comparedCases.length > 0 ? (
        <section className="detail-section">
          <h3>对比栏</h3>
          <div className="compare-table">
            {comparedCases.map((item) => (
              <div key={item.id}>
                <strong>{item.universityCn}</strong>
                <span>{item.profile.undergradTier}</span>
                <span>{item.profile.gpaText}</span>
                <ResultPill result={item.result} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}

function TaxonomyView({
  selectProgram,
}: {
  selectProgram: (programId: string, country: CountryCode) => void;
}) {
  const taxonomy = getTaxonomy();
  const grouped = Object.entries(countryLabels)
    .map(([country, label]) => ({
      country: country as CountryCode,
      label,
      programs: taxonomy.filter((program) => program.country === country),
    }))
    .filter((group) => group.programs.length > 0);

  return (
    <section className="taxonomy-view">
      {grouped.map((group) => (
        <div className="taxonomy-band" key={group.country}>
          <div className="taxonomy-country">
            <Globe2 size={18} />
            <strong>{group.label}</strong>
            <span>{group.programs.length} 个项目</span>
          </div>
          <div className="taxonomy-programs">
            {group.programs.map((program) => (
              <button
                className="taxonomy-row"
                key={program.id}
                onClick={() => selectProgram(program.id, program.country)}
              >
                <span>{program.universityCn}</span>
                <strong>{program.program}</strong>
                <em>{program.discipline}</em>
                <small>{program.cases.length} 个案例</small>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function InterfacesView() {
  return (
    <section className="interfaces-view">
      <div className="interface-panel">
        <div className="panel-title">
          <Database size={18} />
          <span>API 合约</span>
        </div>
        <div className="api-table">
          {plannedApiRoutes.map((route) => (
            <div key={`${route.method}-${route.path}`}>
              <code>{route.method}</code>
              <strong>{route.path}</strong>
              <span>{route.purpose}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="interface-panel">
        <div className="panel-title">
          <UploadCloud size={18} />
          <span>案例导入字段</span>
        </div>
        <div className="schema-grid">
          {[
            "country",
            "university",
            "program",
            "discipline",
            "result",
            "season",
            "undergradTier",
            "major",
            "gpa",
            "language",
            "tests",
            "internships",
            "research",
            "strategy",
          ].map((field) => (
            <code key={field}>{field}</code>
          ))}
        </div>
      </div>

      <div className="interface-panel">
        <div className="panel-title">
          <FileDown size={18} />
          <span>本地脚本</span>
        </div>
        <pre>{`npm run import:cases -- docs/case-import-template.csv data/generated-cases.json`}</pre>
      </div>
    </section>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>("cases");
  const [filters, setFilters] = useState<CaseSearchFilters>(defaultFilters);
  const [selectedCaseId, setSelectedCaseId] = useState("GV-MS-2026-001");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [aiQuery, setAiQuery] = useState("双非一本 商科 想看英国管理和香港商业分析案例");

  const searchResults = useMemo(() => searchCases(filters), [filters]);
  const selectedCase =
    searchResults.find((result) => result.caseRecord.id === selectedCaseId)?.caseRecord ??
    searchResults[0]?.caseRecord;
  const globalStats = getStats();
  const filteredStats = getStats(searchResults.map((result) => result.caseRecord));
  const countryBuckets = getCountryBuckets();
  const aiResponse = useMemo(
    () => buildAiRetrievalContext({ query: aiQuery, topK: 4 }),
    [aiQuery],
  );
  const comparedCases = compareIds
    .map((caseId) => searchResults.find((result) => result.caseRecord.id === caseId))
    .filter((item): item is ReturnType<typeof searchCases>[number] => Boolean(item))
    .map((item) => item.caseRecord);

  function updateFilter<K extends keyof CaseSearchFilters>(
    key: K,
    value: CaseSearchFilters[K],
  ) {
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
  }

  function resetFilters() {
    setFilters(defaultFilters);
  }

  function toggleCompare(caseId: string) {
    setCompareIds((current) => {
      if (current.includes(caseId)) {
        return current.filter((id) => id !== caseId);
      }
      return [...current, caseId].slice(-3);
    });
  }

  function selectProgram(programId: string, country: CountryCode) {
    setFilters({ ...defaultFilters, country, programId });
    setActiveView("cases");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Globe2 size={22} />
          </div>
          <div>
            <strong>GlobalView</strong>
            <span>硕士研究生申请案例库</span>
          </div>
        </div>
        <nav className="view-tabs" aria-label="主视图">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              className={activeView === mode.id ? "active" : ""}
              onClick={() => setActiveView(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero-band">
          <div className="hero-copy">
            <span className="eyebrow">Master Case Intelligence</span>
            <h1>按国家、大学、项目定位可参考申请先例</h1>
            <div className="quick-search">
              <Search size={18} />
              <input
                value={filters.keyword}
                onChange={(event) => updateFilter("keyword", event.target.value)}
                placeholder="例：双非 数据科学 英国 商业分析"
              />
              {filters.keyword ? (
                <button onClick={() => updateFilter("keyword", "")} aria-label="清空关键词">
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>
          <div className="hero-visual">
            <img src="/globalview-board.svg" alt="GlobalView 留学案例图谱" />
          </div>
          <div className="metric-grid">
            <Metric
              label="案例"
              value={globalStats.total}
              detail="匿名种子库"
              icon={<BookOpen size={18} />}
            />
            <Metric
              label="项目"
              value={globalStats.programs}
              detail="官方项目源"
              icon={<GraduationCap size={18} />}
            />
            <Metric
              label="国家/地区"
              value={globalStats.countries}
              detail="硕士阶段"
              icon={<MapPin size={18} />}
            />
            <Metric
              label="录取参考"
              value={formatPercent(globalStats.admitRate)}
              detail="含条件录取"
              icon={<CheckCircle2 size={18} />}
            />
          </div>
        </section>

        <section className="country-strip" aria-label="国家案例统计">
          {countryBuckets.map((bucket) => (
            <button
              key={bucket.code}
              className={filters.country === bucket.code ? "active" : ""}
              onClick={() =>
                updateFilter(
                  "country",
                  filters.country === bucket.code ? "all" : bucket.code,
                )
              }
            >
              <strong>{bucket.label}</strong>
              <span>
                {bucket.count} 例 · {bucket.admits} 成功
              </span>
            </button>
          ))}
        </section>

        {activeView === "cases" ? (
          <section className="workspace-grid">
            <FilterPanel
              filters={filters}
              updateFilter={updateFilter}
              resetFilters={resetFilters}
            />

            <section className="results-panel">
              <div className="results-header">
                <div>
                  <span>检索结果</span>
                  <h2>{searchResults.length} 个案例</h2>
                </div>
                <div className="results-sort">
                  <ArrowUpDown size={16} />
                  匹配度排序
                </div>
              </div>

              <div className="filtered-stats">
                <span>成功参考 {filteredStats.admits + filteredStats.conditional}</span>
                <span>项目 {filteredStats.programs}</span>
                <span>国家/地区 {filteredStats.countries}</span>
              </div>

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
                    <Search size={24} />
                    <strong>暂无匹配案例</strong>
                    <span>调整国家、方向、GPA 或关键词后继续检索。</span>
                  </div>
                )}
              </div>
            </section>

            {selectedCase ? (
              <DetailPanel caseRecord={selectedCase} comparedCases={comparedCases} />
            ) : null}
          </section>
        ) : null}

        {activeView === "taxonomy" ? <TaxonomyView selectProgram={selectProgram} /> : null}

        {activeView === "interfaces" ? <InterfacesView /> : null}

        <section className="ai-band">
          <div className="ai-input">
            <div className="panel-title">
              <Bot size={18} />
              <span>AI 检索上下文</span>
            </div>
            <textarea
              value={aiQuery}
              onChange={(event) => setAiQuery(event.target.value)}
              rows={3}
            />
          </div>
          <div className="ai-output">
            <div className="ai-output-title">
              <Sparkles size={17} />
              <strong>召回案例</strong>
            </div>
            <div className="ai-case-row">
              {aiResponse.matchedCaseIds.map((caseId) => (
                <span key={caseId}>{caseId}</span>
              ))}
            </div>
            <pre>{aiResponse.contextBlocks[0]}</pre>
          </div>
        </section>
      </main>
    </div>
  );
}
