import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { useI18n } from "../i18n";
import { useDocumentMeta } from "../lib/useDocumentMeta";

export function NotFoundPage() {
  const { t } = useI18n();
  useDocumentMeta(`404 · ${t("brand.name")}`);
  return (
    <div className="page container-wide">
      <div className="notfound">
        <span className="notfound-mark">
          <Compass size={30} />
        </span>
        <h1 className="serif">404</h1>
        <h2>{t("nf.title")}</h2>
        <p>{t("nf.desc")}</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          {t("nf.home")}
        </Link>
      </div>
    </div>
  );
}
