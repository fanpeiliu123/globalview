import { Link } from "react-router-dom";
import { Github, Globe2 } from "lucide-react";
import { Logo } from "../ui/common";
import { useI18n } from "../../i18n";

export function SiteFooter() {
  const { t } = useI18n();
  const year = 2026;

  return (
    <footer className="site-footer">
      <div className="container-wide">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>{t("footer.tagline")}</p>
            <div className="footer-social">
              <a
                href="https://github.com/fanpeiliu123/globalview"
                target="_blank"
                rel="noreferrer"
                className="icon-btn"
                aria-label="GitHub"
              >
                <Github size={17} />
              </a>
              <a
                href="https://globalview-kappa.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="icon-btn"
                aria-label="Website"
              >
                <Globe2 size={17} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t("footer.product")}</h4>
            <Link to="/explorer">{t("nav.explorer")}</Link>
            <Link to="/insights">{t("nav.insights")}</Link>
            <Link to="/programs">{t("nav.programs")}</Link>
            <Link to="/delivery">{t("nav.delivery")}</Link>
          </div>

          <div className="footer-col">
            <h4>{t("footer.resources")}</h4>
            <a href="https://github.com/fanpeiliu123/globalview" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link to="/delivery">API</Link>
            <Link to="/delivery">{t("delivery.fields.title")}</Link>
            <Link to="/delivery">{t("footer.legal.privacy")}</Link>
          </div>

          <div className="footer-col">
            <h4>{t("footer.company")}</h4>
            <Link to="/">{t("nav.home")}</Link>
            <a href="mailto:hello@globalview.app">{t("common.contactSales")}</a>
            <Link to="/delivery">{t("footer.legal.terms")}</Link>
          </div>
        </div>

        <p className="footer-disclaimer">{t("footer.disclaimer")}</p>

        <div className="footer-bottom">
          <span>
            © {year} {t("brand.name")}. {t("footer.rights")}
          </span>
          <span className="footer-made">Master Case Intelligence · 10 Regions · 36 Programs</span>
        </div>
      </div>
    </footer>
  );
}
