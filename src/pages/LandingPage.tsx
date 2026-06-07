import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Database,
  GitCompare,
  GraduationCap,
  Quote,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { useI18n } from "../i18n";
import { Reveal } from "../components/ui/common";
import { DonutChart, BarList } from "../components/charts/Charts";
import { programSources } from "../data/programSources";
import {
  countryDistribution,
  outcomeBreakdown,
  summaryStats,
} from "../lib/analytics";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import type { AdmissionResult } from "../lib/types";

const RESULT_COLORS: Record<AdmissionResult, string> = {
  admit: "var(--success)",
  conditional: "var(--accent)",
  waitlist: "var(--info)",
  reject: "var(--danger)",
};

function HeroPreview() {
  const { t, pick } = useI18n();
  const outcomes = outcomeBreakdown();
  const countries = countryDistribution().slice(0, 5);
  const stats = summaryStats();

  return (
    <div className="hero-preview" aria-hidden="true">
      <div className="hero-preview-glow" />
      <div className="app-window">
        <div className="app-window-bar">
          <span className="dotrow">
            <i /> <i /> <i />
          </span>
          <span className="app-window-title">globalview · insights</span>
        </div>
        <div className="app-window-body">
          <div className="preview-card preview-donut">
            <span className="preview-label">{t("insights.outcome")}</span>
            <DonutChart
              size={150}
              thickness={20}
              segments={outcomes.map((o) => ({
                label: t(`result.${o.result}`),
                value: o.count,
                color: RESULT_COLORS[o.result],
              }))}
              centerValue={`${stats.admitRate}%`}
              centerLabel={t("result.admitRate")}
            />
          </div>
          <div className="preview-card preview-bars">
            <span className="preview-label">{t("insights.byCountry")}</span>
            <BarList
              items={countries.map((c) => ({
                key: c.code,
                label: (
                  <span className="flag-label">
                    <span className="flag">{c.meta.flag}</span>
                    {pick(c.meta.zh, c.meta.en)}
                  </span>
                ),
                value: c.count,
                color: "var(--brand)",
              }))}
            />
          </div>
        </div>
      </div>
      <div className="hero-float hero-float-a">
        <Sparkles size={15} />
        <div>
          <strong>{t("features.ai.title")}</strong>
          <span>{stats.total} {t("common.cases")}</span>
        </div>
      </div>
      <div className="hero-float hero-float-b">
        <GraduationCap size={15} />
        <div>
          <strong>{stats.programs} {t("common.programs")}</strong>
          <span>{stats.countries} {t("common.countries")}</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const stats = summaryStats();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    navigate(query.trim() ? `/explorer?q=${encodeURIComponent(query.trim())}` : "/explorer");
  }

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container-wide hero-inner">
        <div className="hero-copy">
          <span className="eyebrow animate-up">{t("hero.eyebrow")}</span>
          <h1 className="hero-title animate-up" style={{ animationDelay: "60ms" }}>
            {t("hero.title")}
          </h1>
          <p className="hero-sub animate-up" style={{ animationDelay: "120ms" }}>
            {t("hero.subtitle")}
          </p>

          <form
            className="hero-search animate-up"
            style={{ animationDelay: "180ms" }}
            onSubmit={onSubmit}
          >
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("hero.searchPlaceholder")}
              aria-label={t("common.search")}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              {t("common.search")}
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="hero-cta animate-up" style={{ animationDelay: "240ms" }}>
            <Link to="/explorer" className="btn btn-primary btn-lg">
              {t("hero.cta.primary")}
              <ArrowRight size={17} />
            </Link>
            <Link to="/insights" className="btn btn-ghost btn-lg">
              {t("hero.cta.secondary")}
            </Link>
          </div>

          <p className="hero-trust animate-up" style={{ animationDelay: "300ms" }}>
            {t("hero.trust", {
              countries: stats.countries,
              programs: stats.programs,
              cases: stats.total,
            })}
          </p>
        </div>

        <div className="hero-visual animate-up" style={{ animationDelay: "160ms" }}>
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  const { t } = useI18n();
  const stats = summaryStats();
  const items = [
    { value: stats.total, label: t("stats.cases"), detail: t("stats.casesDetail") },
    { value: stats.programs, label: t("stats.programs"), detail: t("stats.programsDetail") },
    { value: stats.countries, label: t("stats.countries"), detail: t("stats.countriesDetail") },
    { value: `${stats.admitRate}%`, label: t("stats.admit"), detail: t("stats.admitDetail") },
  ];
  return (
    <section className="stats-band">
      <div className="container-wide stats-grid">
        {items.map((item, index) => (
          <Reveal key={item.label} delay={index * 70} className="stat-tile">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <small>{item.detail}</small>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function UniversityMarquee() {
  const { t } = useI18n();
  const names = [...new Set(programSources.map((p) => p.university))];
  const loop = [...names, ...names];
  return (
    <section className="marquee-section">
      <div className="container-wide">
        <p className="marquee-title">{t("logos.title")}</p>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {loop.map((name, index) => (
            <span key={`${name}-${index}`} className="marquee-item">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useI18n();
  const features = [
    { icon: Search, k: "search", to: "/explorer" },
    { icon: BarChart3, k: "insights", to: "/insights" },
    { icon: Sparkles, k: "ai", to: "/explorer" },
    { icon: GitCompare, k: "compare", to: "/explorer" },
    { icon: GraduationCap, k: "programs", to: "/programs" },
    { icon: Database, k: "delivery", to: "/delivery" },
  ];
  return (
    <section className="section container-wide">
      <div className="section-head center">
        <span className="eyebrow">{t("features.eyebrow")}</span>
        <h2>{t("features.title")}</h2>
        <p>{t("features.subtitle")}</p>
      </div>
      <div className="feature-grid">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.k} delay={(index % 3) * 80} className="feature-card-wrap">
              <Link to={feature.to} className="feature-card">
                <span className="feature-icon">
                  <Icon size={20} />
                </span>
                <h3>{t(`features.${feature.k}.title`)}</h3>
                <p>{t(`features.${feature.k}.desc`)}</p>
                <span className="feature-arrow">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const steps = ["s1", "s2", "s3"];
  return (
    <section className="section how-section">
      <div className="container-wide">
        <div className="section-head center">
          <span className="eyebrow">{t("how.eyebrow")}</span>
          <h2>{t("how.title")}</h2>
        </div>
        <div className="how-grid">
          {steps.map((step, index) => (
            <Reveal key={step} delay={index * 90} className="how-card">
              <span className="how-num">{String(index + 1).padStart(2, "0")}</span>
              <h3>{t(`how.${step}.title`)}</h3>
              <p>{t(`how.${step}.desc`)}</p>
            </Reveal>
          ))}
          <div className="how-line" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { t, pick } = useI18n();
  const quotes = [
    {
      zh: "把过往零散的申请案例整理成可检索的情报库，选校定位会议从两小时压缩到二十分钟。",
      en: "Turning scattered past cases into a searchable intelligence library cut our school-selection meetings from two hours to twenty minutes.",
      nameZh: "资深留学申请顾问",
      nameEn: "Senior admissions advisor",
      org: "Education Studio",
    },
    {
      zh: "数据洞察页让我第一次直观看到不同背景层级的录取结构，和家长沟通时更有底气。",
      en: "The insights view finally let me see admit structures by background tier at a glance — I speak to parents with far more confidence.",
      nameZh: "独立申请规划师",
      nameEn: "Independent application planner",
      org: "GradPath",
    },
    {
      zh: "导入脚本和 API 合约设计得很干净，我们一周内就把自己的历史数据接了进来。",
      en: "The import script and API contract are clean — we plugged our historical data in within a week.",
      nameZh: "教育科技产品负责人",
      nameEn: "EdTech product lead",
      org: "Atlas Learning",
    },
  ];
  return (
    <section className="section quotes-section">
      <div className="container-wide">
        <div className="section-head center">
          <span className="eyebrow">{t("quotes.eyebrow")}</span>
          <h2>{t("quotes.title")}</h2>
        </div>
        <div className="quotes-grid">
          {quotes.map((quote, index) => (
            <Reveal key={index} delay={index * 80} className="quote-card">
              <Quote size={26} className="quote-mark" />
              <p>{pick(quote.zh, quote.en)}</p>
              <div className="quote-foot">
                <div className="quote-stars">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} size={13} fill="currentColor" />
                  ))}
                </div>
                <strong>{pick(quote.nameZh, quote.nameEn)}</strong>
                <span>{quote.org}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container-wide">
        <Reveal className="cta-band">
          <div className="cta-glow" aria-hidden="true" />
          <h2>{t("cta.title")}</h2>
          <p>{t("cta.subtitle")}</p>
          <div className="cta-actions">
            <Link to="/explorer" className="btn btn-gold btn-lg">
              {t("cta.primary")}
              <ArrowRight size={17} />
            </Link>
            <Link to="/delivery" className="btn btn-ghost btn-lg cta-ghost">
              {t("cta.secondary")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { t } = useI18n();
  useDocumentMeta(`${t("brand.name")} · ${t("brand.tagline")}`);
  return (
    <>
      <Hero />
      <StatsBand />
      <UniversityMarquee />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CtaBand />
    </>
  );
}
