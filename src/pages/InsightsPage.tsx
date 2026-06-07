import { Link } from "react-router-dom";
import { ArrowRight, Info, TrendingUp } from "lucide-react";
import { useI18n } from "../i18n";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { Reveal } from "../components/ui/common";
import {
  AreaLine,
  BarList,
  ColumnChart,
  DonutChart,
  Legend,
  StackedBar,
} from "../components/charts/Charts";
import {
  countryDistribution,
  disciplineDistribution,
  gpaDistribution,
  outcomeBreakdown,
  seasonCadence,
  summaryStats,
  tierOutcome,
  topPrograms,
} from "../lib/analytics";
import type { AdmissionResult } from "../lib/types";

const RESULT_COLORS: Record<AdmissionResult, string> = {
  admit: "var(--success)",
  conditional: "var(--accent)",
  waitlist: "var(--info)",
  reject: "var(--danger)",
};

const CATEGORICAL = [
  "var(--brand)",
  "var(--accent)",
  "var(--info)",
  "#6fb89e",
  "#c98a3a",
];

function Panel({
  title,
  children,
  span = 1,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  span?: 1 | 2;
  hint?: string;
}) {
  return (
    <Reveal className={`insight-panel card${span === 2 ? " span-2" : ""}`}>
      <div className="insight-panel-head">
        <h3>{title}</h3>
        {hint ? <span className="insight-hint" title={hint}><Info size={14} /></span> : null}
      </div>
      {children}
    </Reveal>
  );
}

export function InsightsPage() {
  const { t, discipline: dLabel, tier: tierLabel, pick } = useI18n();
  useDocumentMeta(`${t("insights.title")} · ${t("brand.name")}`);

  const stats = summaryStats();
  const outcomes = outcomeBreakdown();
  const countries = countryDistribution();
  const disciplines = disciplineDistribution();
  const tiers = tierOutcome();
  const gpaBins = gpaDistribution();
  const season = seasonCadence();
  const programs = topPrograms(undefined, 7);

  const tierBest = [...tiers].sort((a, b) => b.admitRate - a.admitRate)[0];
  const topCountry = countries[0];
  const peakSeason = [...season].sort((a, b) => b.count - a.count)[0];

  const takeaways = [
    {
      zh: `${tierBest ? tierLabel(tierBest.tier) : ""} 背景的录取参考率最高，约 ${tierBest?.admitRate ?? 0}%。`,
      en: `${tierBest ? tierLabel(tierBest.tier) : ""} backgrounds show the highest admit reference rate, around ${tierBest?.admitRate ?? 0}%.`,
    },
    {
      zh: `${topCountry ? topCountry.meta.zh : ""} 是案例最集中的目的地，共 ${topCountry?.count ?? 0} 例。`,
      en: `${topCountry ? topCountry.meta.en : ""} is the most represented destination with ${topCountry?.count ?? 0} cases.`,
    },
    {
      zh: `录取结果在 ${peakSeason?.label ?? ""} 前后最为集中，建议据此倒排申请时间线。`,
      en: `Decisions cluster around ${peakSeason?.label ?? ""}; plan your timeline backwards from there.`,
    },
    {
      zh: `案例平均 GPA 约 ${stats.gpa.avg.toFixed(2)}，多数成功案例集中在 3.6 以上区间。`,
      en: `Average GPA is ~${stats.gpa.avg.toFixed(2)}; most positive outcomes sit above 3.6.`,
    },
  ];

  return (
    <div className="page page-insights">
      <div className="page-head container-wide">
        <div>
          <span className="eyebrow">{t("nav.insights")}</span>
          <h1 className="page-title serif">{t("insights.title")}</h1>
          <p className="page-sub">{t("insights.subtitle")}</p>
        </div>
        <Link to="/explorer" className="btn btn-primary btn-sm">
          {t("nav.explorer")}
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="container-wide">
        <div className="insight-kpis">
          {[
            { v: stats.total, l: t("stats.cases") },
            { v: stats.programs, l: t("stats.programs") },
            { v: stats.countries, l: t("stats.countries") },
            { v: stats.universities, l: t("common.universities") },
            { v: `${stats.admitRate}%`, l: t("result.admitRate") },
            { v: stats.gpa.avg.toFixed(2), l: `${t("detail.gpa")} avg` },
          ].map((kpi, index) => (
            <Reveal key={kpi.l} delay={index * 50} className="insight-kpi">
              <strong>{kpi.v}</strong>
              <span>{kpi.l}</span>
            </Reveal>
          ))}
        </div>

        <p className="insight-note">
          <Info size={14} />
          {t("insights.note")}
        </p>

        <div className="insight-grid">
          <Panel title={t("insights.outcome")}>
            <div className="donut-wrap">
              <DonutChart
                segments={outcomes.map((o) => ({
                  label: t(`result.${o.result}`),
                  value: o.count,
                  color: RESULT_COLORS[o.result],
                }))}
                centerValue={`${stats.admitRate}%`}
                centerLabel={t("result.admitRate")}
              />
              <Legend
                items={outcomes.map((o) => ({
                  label: t(`result.${o.result}`),
                  color: RESULT_COLORS[o.result],
                  value: `${o.count} · ${o.pct}%`,
                }))}
              />
            </div>
          </Panel>

          <Panel title={t("insights.byCountry")} span={2}>
            <BarList
              items={countries.map((c, index) => ({
                key: c.code,
                label: (
                  <span className="flag-label">
                    <span className="flag">{c.meta.flag}</span>
                    {pick(c.meta.zh, c.meta.en)}
                  </span>
                ),
                value: c.count,
                sub: `${c.admitRate}%`,
                color: CATEGORICAL[index % CATEGORICAL.length],
              }))}
            />
          </Panel>

          <Panel title={t("insights.byDiscipline")}>
            <BarList
              items={disciplines.map((d, index) => ({
                key: d.discipline,
                label: dLabel(d.discipline),
                value: d.count,
                sub: `${d.admitRate}%`,
                color: CATEGORICAL[index % CATEGORICAL.length],
              }))}
            />
          </Panel>

          <Panel title={t("insights.gpaDist")}>
            <ColumnChart
              columns={gpaBins.map((bin) => ({
                key: bin.label,
                label: bin.label,
                value: bin.count,
                highlight: bin.admits,
              }))}
            />
            <div className="column-legend">
              <span><i style={{ background: "var(--brand)" }} /> {t("common.cases")}</span>
              <span><i style={{ background: "var(--accent)" }} /> {t("result.admit")}</span>
            </div>
          </Panel>

          <Panel title={t("insights.season")}>
            <AreaLine points={season.map((s) => s.count)} />
            <div className="arealine-labels">
              {season.map((s) => (
                <span key={s.key}>{s.label}</span>
              ))}
            </div>
          </Panel>

          <Panel title={t("insights.byTier")} span={2}>
            <div className="tier-rows">
              {tiers.map((row) => (
                <div className="tier-row" key={row.tier}>
                  <div className="tier-row-head">
                    <strong>{tierLabel(row.tier)}</strong>
                    <span>
                      {row.total} {t("common.cases")} · <em>{row.admitRate}%</em>
                    </span>
                  </div>
                  <StackedBar
                    segments={(["admit", "conditional", "waitlist", "reject"] as AdmissionResult[]).map(
                      (result) => ({
                        key: result,
                        value: row.counts[result],
                        color: RESULT_COLORS[result],
                        label: t(`result.${result}`),
                      }),
                    )}
                  />
                </div>
              ))}
            </div>
            <Legend
              items={(["admit", "conditional", "waitlist", "reject"] as AdmissionResult[]).map(
                (result) => ({ label: t(`result.${result}`), color: RESULT_COLORS[result] }),
              )}
            />
          </Panel>

          <Panel title={t("insights.topPrograms")}>
            <BarList
              items={programs.map((p, index) => ({
                key: p.programId,
                label: p.program?.universityCn ?? p.programId,
                value: p.count,
                sub: `${p.admitRate}%`,
                color: CATEGORICAL[index % CATEGORICAL.length],
              }))}
            />
          </Panel>

          <Panel title={t("insights.takeaways")} span={2}>
            <ul className="takeaways">
              {takeaways.map((item, index) => (
                <li key={index}>
                  <TrendingUp size={16} />
                  <span>{pick(item.zh, item.en)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

