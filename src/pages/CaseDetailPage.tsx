import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Layers,
  Sparkles,
} from "lucide-react";
import { useI18n } from "../i18n";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { ResultPill, CountryTag } from "../components/ui/common";
import {
  findSimilarCases,
  formatLanguage,
  formatTests,
  getCaseById,
  getProgramById,
} from "../lib/search";

export function CaseDetailPage() {
  const { id } = useParams();
  const { t, discipline: dLabel, tier: tierLabel, pick } = useI18n();
  const caseRecord = id ? getCaseById(id) : undefined;
  useDocumentMeta(
    caseRecord
      ? `${caseRecord.universityCn} · ${caseRecord.program} · ${t("brand.name")}`
      : `${t("detail.notFound")} · ${t("brand.name")}`,
  );

  if (!caseRecord) {
    return (
      <div className="page container-wide">
        <div className="empty-state empty-page">
          <strong>{t("detail.notFound")}</strong>
          <Link to="/explorer" className="btn btn-soft btn-sm">
            <ArrowLeft size={14} />
            {t("detail.backToExplorer")}
          </Link>
        </div>
      </div>
    );
  }

  const program = getProgramById(caseRecord.programId);
  const similar = findSimilarCases(caseRecord);
  const experience = [...caseRecord.profile.internships, ...caseRecord.profile.research].filter(
    (item) => item && item !== "无",
  );

  return (
    <div className="page page-detail">
      <div className="detail-hero">
        <div className="detail-hero-bg" aria-hidden="true" />
        <div className="container-wide">
          <Link to="/explorer" className="detail-back">
            <ArrowLeft size={15} />
            {t("detail.backToExplorer")}
          </Link>
          <div className="detail-hero-row">
            <div className="detail-hero-main">
              <div className="detail-hero-tags">
                <span className="mono case-id-pill">{caseRecord.id}</span>
                <CountryTag code={caseRecord.country} />
                <span className="badge badge-line">{dLabel(caseRecord.discipline)}</span>
              </div>
              <h1 className="serif">{caseRecord.universityCn}</h1>
              <p className="detail-program">{caseRecord.program}</p>
              <p className="detail-uni-en">{caseRecord.university}</p>
            </div>
            <div className="detail-hero-result">
              <ResultPill result={caseRecord.result} />
              <div className="detail-hero-meta">
                <span><CalendarDays size={14} /> {caseRecord.season} · {caseRecord.round}</span>
                <span>{t("detail.offerDate")}: {caseRecord.offerDate}</span>
                <span>{t("detail.scholarship")}: {caseRecord.scholarship}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide detail-body">
        <div className="detail-main">
          <section className="card card-pad detail-block">
            <h2 className="block-title">{t("detail.background")}</h2>
            <dl className="detail-profile">
              <div>
                <dt>{t("detail.undergrad")}</dt>
                <dd>{caseRecord.profile.undergradSchool} · {tierLabel(caseRecord.profile.undergradTier)}</dd>
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
                <dt>{t("detail.language")}</dt>
                <dd>{formatLanguage(caseRecord)}</dd>
              </div>
              <div>
                <dt>{t("detail.tests")}</dt>
                <dd>{formatTests(caseRecord)}</dd>
              </div>
            </dl>
          </section>

          <section className="card card-pad detail-block">
            <h2 className="block-title">{t("detail.signals")}</h2>
            <div className="signal-row">
              {caseRecord.profile.highlights.map((highlight) => (
                <span key={highlight} className="signal-chip">
                  <Sparkles size={13} />
                  {highlight}
                </span>
              ))}
            </div>
          </section>

          {experience.length > 0 ? (
            <section className="card card-pad detail-block">
              <h2 className="block-title">{t("detail.experience")}</h2>
              <ul className="exp-list">
                {experience.map((item) => (
                  <li key={item}>
                    <Layers size={15} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card card-pad detail-block">
            <h2 className="block-title">{t("detail.strategy")}</h2>
            <p className="detail-strategy">{caseRecord.strategy}</p>
          </section>

          <section className="card card-pad detail-block">
            <h2 className="block-title">{t("detail.timeline")}</h2>
            <ol className="timeline">
              {caseRecord.timeline.map((item, index) => (
                <li key={item}>
                  <span className="timeline-dot">{index + 1}</span>
                  <span className="timeline-text">{item}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="detail-side">
          {program ? (
            <section className="card card-pad detail-block">
              <h2 className="block-title">{t("detail.programSource")}</h2>
              <div className="program-source">
                <span className="program-source-uni">
                  <GraduationCap size={16} />
                  {program.universityCn}
                </span>
                <p>{program.program}</p>
                <ul className="program-source-meta">
                  <li><span>{t("programs.duration")}</span><b>{program.duration}</b></li>
                  <li><span>{t("programs.intake")}</span><b>{program.intake}</b></li>
                  <li><span>{t("programs.selectivity")}</span><b>{t(`selectivity.${program.selectivity}`)}</b></li>
                  {program.qsRank ? (
                    <li><span>{t("programs.qs")}</span><b>#{program.qsRank}</b></li>
                  ) : null}
                </ul>
                <a href={program.officialUrl} target="_blank" rel="noreferrer" className="btn btn-soft btn-sm btn-block">
                  {t("common.official")}
                  <ExternalLink size={14} />
                </a>
                <Link to={`/programs?program=${program.id}`} className="program-source-link">
                  {t("programs.casesLink")}
                  <ArrowRight size={13} />
                </Link>
              </div>
            </section>
          ) : null}

          <section className="card card-pad detail-block">
            <h2 className="block-title">{t("detail.similar")}</h2>
            <div className="similar-list">
              {similar.map((item) => (
                <Link key={item.id} to={`/case/${item.id}`} className="similar-item">
                  <div>
                    <strong>{item.universityCn}</strong>
                    <span>{tierLabel(item.profile.undergradTier)} · {item.profile.gpaText}</span>
                  </div>
                  <ResultPill result={item.result} />
                </Link>
              ))}
            </div>
          </section>

          <p className="detail-note">{pick(
            "案例为匿名脱敏数据，仅供背景参考，不构成录取承诺。",
            "Cases are anonymized references only and do not constitute any admission guarantee.",
          )}</p>
        </aside>
      </div>
    </div>
  );
}
