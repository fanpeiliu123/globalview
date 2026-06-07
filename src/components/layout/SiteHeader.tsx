import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "../ui/common";
import { ThemeToggle, LangToggle } from "./Controls";
import { useI18n } from "../../i18n";

const links = [
  { to: "/explorer", key: "nav.explorer" },
  { to: "/insights", key: "nav.insights" },
  { to: "/programs", key: "nav.programs" },
  { to: "/delivery", key: "nav.delivery" },
] as const;

export function SiteHeader() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-header-inner container-wide">
        <Link to="/" className="header-brand" aria-label="GlobalView home">
          <Logo />
        </Link>

        <nav className="header-nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <LangToggle />
          <ThemeToggle />
          <Link to="/explorer" className="btn btn-primary btn-sm header-cta">
            {t("nav.cta")}
            <ArrowRight size={16} />
          </Link>
          <button
            className="icon-btn header-burger"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav.menu")}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>
          <Link to="/explorer" className="btn btn-primary btn-block">
            {t("nav.cta")}
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : null}
    </header>
  );
}
