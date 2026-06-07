import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Sparkles, Wand2 } from "lucide-react";
import { useI18n } from "../i18n";
import { buildAiRetrievalContext, countryLabels } from "../lib/search";
import { getCaseById } from "../lib/search";
import type { CaseSearchFilters } from "../lib/types";

export function AiAssist({
  onApply,
}: {
  onApply: (filters: Partial<CaseSearchFilters>) => void;
}) {
  const { t, pick, discipline: dLabel, tier: tierLabel } = useI18n();
  const [query, setQuery] = useState(
    pick(
      "双非一本 商科背景，想看英国管理和香港商业分析的录取案例",
      "Non-985 business background — UK management and Hong Kong business analytics admits",
    ),
  );
  const [submitted, setSubmitted] = useState(query);
  const [open, setOpen] = useState(false);

  const response = useMemo(
    () => buildAiRetrievalContext({ query: submitted, topK: 4 }),
    [submitted],
  );

  const recommended = response.recommendedFilters;
  const recoChips: string[] = [];
  if (recommended.country && recommended.country !== "all")
    recoChips.push(countryLabels[recommended.country]);
  if (recommended.discipline && recommended.discipline !== "all")
    recoChips.push(dLabel(recommended.discipline));
  if (recommended.tier && recommended.tier !== "all")
    recoChips.push(tierLabel(recommended.tier));

  return (
    <div className="ai-assist card">
      <div className="ai-assist-head">
        <span className="ai-assist-title">
          <span className="ai-orb">
            <Sparkles size={15} />
          </span>
          {t("features.ai.title")}
        </span>
        <span className="ai-assist-tag">{pick("自然语言召回", "Natural-language recall")}</span>
      </div>

      <div className="ai-assist-input">
        <textarea
          className="input"
          rows={2}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={pick("描述背景与目标…", "Describe a background and goal…")}
        />
        <button className="btn btn-primary btn-sm" onClick={() => setSubmitted(query)}>
          <Wand2 size={15} />
          {pick("召回案例", "Recall")}
        </button>
      </div>

      <div className="ai-assist-results">
        <div className="ai-matched">
          {response.matchedCaseIds.map((id) => {
            const record = getCaseById(id);
            return (
              <Link key={id} to={`/case/${id}`} className="ai-match-chip">
                <span className="mono">{id}</span>
                {record ? <em>{record.universityCn}</em> : null}
              </Link>
            );
          })}
        </div>

        {recoChips.length > 0 ? (
          <div className="ai-reco">
            <span className="ai-reco-label">{pick("推荐筛选", "Suggested filters")}</span>
            {recoChips.map((chip) => (
              <span key={chip} className="chip chip-brand">
                {chip}
              </span>
            ))}
            <button className="btn btn-soft btn-sm" onClick={() => onApply(recommended)}>
              {pick("应用筛选", "Apply")}
            </button>
          </div>
        ) : null}

        <button className="ai-context-toggle" onClick={() => setOpen((v) => !v)}>
          <ChevronDown size={14} className={open ? "rot" : ""} />
          {pick("查看检索上下文", "View retrieval context")}
        </button>
        {open ? <pre className="ai-context">{response.contextBlocks.join("\n\n")}</pre> : null}
      </div>
    </div>
  );
}
