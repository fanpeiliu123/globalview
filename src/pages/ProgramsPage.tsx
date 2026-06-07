import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { useI18n } from "../i18n";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { CountryTag } from "../components/ui/common";
import { Reveal } from "../components/ui/common";
import { countryMeta } from "../lib/geo";
import { programSources } from "../data/programSources";
import { allCases } from "../data/allCases";
import { getFilterOptions } from "../lib/search";
import type { CountryCode, Discipline } from "../lib/types";

function selectivityTone(selectivity: string) {
  if (selectivity === "高竞争") return "danger";
  if (selectivity === "中高竞争") return "warning";
  return "success";
}

export function ProgramsPage() {
  const { t, discipline: dLabel, locale } = useI18n();
  useDocumentMeta(`${t("programs.title")} · ${t("brand.name")}`);

  const [country, setCountry] = useState<"all" | CountryCode>("all");
  const [discipline, setDiscipline] = useState<"all" | Discipline>("all");

  const caseCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of allCases) {
      map.set(item.programId, (map.get(item.programId) ?? 0) + 1);
    }
    return map;
  }, []);

  const disciplines = getFilterOptions().disciplines;
  const availableCountries = countryMeta.filter((meta) =>
    programSources.some((program) => program.country === meta.code),
  );

  const filtered = programSources.filter(
    (program) =>
      (country === "all" || program.country === country) &&
      (discipline === "all" || program.discipline === discipline),
  );

  return (
    <div className="page page-programs">
      <div className="page-head container-wide">
        <div>
          <span className="eyebrow">{t("nav.programs")}</span>
          <h1 className="page-title serif">{t("programs.title")}</h1>
          <p className="page-sub">
            {t("programs.subtitle", {
              programs: programSources.length,
              countries: availableCountries.length,
            })}
          </p>
        </div>
      </div>

      <div className="container-wide">
        <div className="programs-toolbar">
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
            <span className="programs-count">
              <strong>{filtered.length}</strong> {t("programs.count")}
            </span>
          </div>
        </div>

        <div className="programs-grid">
          {filtered.map((program, index) => {
            const count = caseCounts.get(program.id) ?? 0;
            return (
              <Reveal key={program.id} delay={(index % 3) * 60} className="program-card card">
                <div className="program-card-top">
                  <CountryTag code={program.country} />
                  {program.stemDesignated ? <span className="badge badge-gold">{t("programs.stem")}</span> : null}
                  <span className={`pill ${selectivityTone(program.selectivity)} program-sel`}>
                    {t(`selectivity.${program.selectivity}`)}
                  </span>
                </div>

                <h3>{program.universityCn}</h3>
                <p className="program-name">{program.program}</p>
                <p className="program-city">
                  <MapPin size={13} /> {program.city} · {program.degree}
                </p>

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
                </dl>

                <div className="program-card-foot">
                  <Link
                    to={`/explorer?q=${encodeURIComponent(program.program)}`}
                    className="program-cases"
                  >
                    {count} {t("common.cases")}
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
        </div>
      </div>
    </div>
  );
}
