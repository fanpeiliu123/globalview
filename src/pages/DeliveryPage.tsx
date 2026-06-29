import {
  Database,
  FileDown,
  FileSpreadsheet,
  Lock,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useI18n } from "../i18n";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { Reveal } from "../components/ui/common";
import { plannedApiRoutes } from "../lib/repository";

const programImportFields = [
  "id",
  "universityId",
  "country",
  "countryName",
  "city",
  "university",
  "universityCn",
  "program",
  "programZh",
  "degree",
  "discipline",
  "duration",
  "intake",
  "qsRank",
  "faculty",
  "department",
  "tuition",
  "deadlineNote",
  "languageRequirements",
  "greRequired",
  "entryRequirements",
  "officialUrl",
  "sourceUrls",
  "dataCompleteness",
  "lastUpdated",
];

const caseImportFields = [
  "country",
  "university",
  "program",
  "programId",
  "discipline",
  "result",
  "season",
  "round",
  "offerDate",
  "scholarship",
  "undergradTier",
  "undergradSchool",
  "major",
  "gpa",
  "gpaText",
  "language",
  "tests",
  "internships",
  "research",
  "highlights",
  "strategy",
  "timeline",
  "tags",
];

export function DeliveryPage() {
  const { t, pick } = useI18n();
  useDocumentMeta(`${t("delivery.title")} · ${t("brand.name")}`);

  const roadmap = [
    {
      zh: "PostgreSQL / SQLite 存储项目、案例、匿名画像、标签与导入批次。",
      en: "PostgreSQL / SQLite stores programs, cases, anonymized profiles, tags and import batches.",
    },
    {
      zh: "对策略、亮点、时间线、实习与科研字段建立向量嵌入。",
      en: "Build vector embeddings over strategy, highlights, timeline, internships and research fields.",
    },
    {
      zh: "/api/ai/retrieve-cases 使用结构化筛选 + 向量召回 + rerank。",
      en: "/api/ai/retrieve-cases combines structured filtering, vector recall and rerank.",
    },
    {
      zh: "导入流程加入隐私脱敏、重复检测、字段置信度与人工审核。",
      en: "Import pipeline adds anonymization, dedup, field confidence and human review.",
    },
    {
      zh: "扩展本科、博士、转学、奖学金、签证与选校系统模块。",
      en: "Extend to undergrad, PhD, transfer, scholarship, visa and school-selection modules.",
    },
  ];

  return (
    <div className="page page-delivery">
      <div className="page-head container-wide">
        <div>
          <span className="eyebrow">{t("nav.delivery")}</span>
          <h1 className="page-title serif">{t("delivery.title")}</h1>
          <p className="page-sub">{t("delivery.subtitle")}</p>
        </div>
      </div>

      <div className="container-wide delivery-top">
        <Reveal className="card card-pad delivery-import">
          <span className="delivery-icon"><FileSpreadsheet size={20} /></span>
          <h3>{t("delivery.import.title")}</h3>
          <p>{t("delivery.import.desc")}</p>
          <ol className="delivery-steps">
            <li>{pick("准备项目库或案例 CSV / JSON 文件", "Prepare a programme or case CSV / JSON file")}</li>
            <li>{pick("运行导入脚本完成结构化、核验与脱敏", "Run the import script to structure, verify & anonymize")}</li>
            <li>{pick("接入 repository 或服务端数据库", "Wire into the repository or a server database")}</li>
          </ol>
          <div className="code-block">
            <div className="code-head">
              <Terminal size={13} /> {t("delivery.script.title")}
            </div>
            <pre>npm run import:qs-verified -- /path/to/outputs_verified</pre>
            <pre>npm run import:cases -- docs/case-import-template.csv data/generated-cases.json</pre>
          </div>
        </Reveal>

        <Reveal delay={80} className="card card-pad delivery-privacy">
          <span className="delivery-icon privacy"><ShieldCheck size={20} /></span>
          <h3>{t("delivery.privacy.title")}</h3>
          <p>{t("delivery.privacy.desc")}</p>
          <ul className="privacy-list">
            <li><Lock size={14} /> {pick("姓名 / 邮箱 / 手机号", "Name / email / phone")}</li>
            <li><Lock size={14} /> {pick("微信号 / 申请账号", "WeChat / application accounts")}</li>
            <li><Lock size={14} /> {pick("精确住址 / 可反查奖项编号", "Exact address / identifying award IDs")}</li>
          </ul>
          <div className="privacy-note">
            {pick(
              "所有展示字段均为匿名层级 anonymous，确保无法反向识别申请人。",
              "All displayed fields are at the anonymous level, ensuring applicants cannot be re-identified.",
            )}
          </div>
        </Reveal>
      </div>

      <div className="container-wide delivery-section">
        <h2 className="block-title with-icon">
          <Database size={18} /> {t("delivery.api.title")}
        </h2>
        <div className="api-table card">
          <div className="api-row api-row-head">
            <span>Method</span>
            <span>Endpoint</span>
            <span>{pick("用途", "Purpose")}</span>
          </div>
          {plannedApiRoutes.map((route) => (
            <div className="api-row" key={`${route.method}-${route.path}`}>
              <span className={`api-method m-${route.method.toLowerCase()}`}>{route.method}</span>
              <code>{route.path}</code>
              <span className="api-purpose">{route.purpose}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container-wide delivery-section">
        <h2 className="block-title with-icon">
          <FileDown size={18} /> {t("delivery.fields.title")}
        </h2>
        <h3 className="section-kicker">{pick("硕士项目库字段", "Master programme fields")}</h3>
        <div className="fields-grid">
          {programImportFields.map((field) => (
            <code key={field} className="field-token">{field}</code>
          ))}
        </div>
        <h3 className="section-kicker">{pick("匿名申请案例字段", "Anonymous case fields")}</h3>
        <div className="fields-grid">
          {caseImportFields.map((field) => (
            <code key={field} className="field-token">{field}</code>
          ))}
        </div>
      </div>

      <div className="container-wide delivery-section">
        <h2 className="block-title with-icon">
          <Terminal size={18} /> {t("delivery.roadmap.title")}
        </h2>
        <ol className="roadmap">
          {roadmap.map((item, index) => (
            <Reveal as="li" key={index} delay={index * 60} className="roadmap-item">
              <span className="roadmap-num">{index + 1}</span>
              <span>{pick(item.zh, item.en)}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  );
}
