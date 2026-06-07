import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AdmissionResult, CountryCode } from "../../lib/types";
import { resultTone } from "../../lib/search";
import { countryByCode } from "../../lib/geo";
import { useI18n } from "../../i18n";

/* ------------------------------------------------------------- Brand mark */

export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
        <rect width="40" height="40" rx="11" fill="url(#bm-grad)" />
        <circle cx="20" cy="20" r="11.5" stroke="rgba(255,255,255,0.92)" strokeWidth="1.6" />
        <path
          d="M8.5 20h23M20 8.5c3.4 3.1 5.3 7.2 5.3 11.5S23.4 28.4 20 31.5c-3.4-3.1-5.3-7.2-5.3-11.5S16.6 11.6 20 8.5Z"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="1.6"
        />
        <circle cx="27.4" cy="13.2" r="3" fill="#e6c068" stroke="#0a3d30" strokeWidth="1.3" />
        <defs>
          <linearGradient id="bm-grad" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#16785d" />
            <stop offset="1" stopColor="#0a3d30" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <span className="logo">
      <BrandMark />
      <span className="logo-text">
        <strong>{t("brand.name")}</strong>
        {!compact ? <span>{t("brand.tagline")}</span> : null}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------- Result pill */

export function ResultPill({ result }: { result: AdmissionResult }) {
  const { t } = useI18n();
  return <span className={`pill ${resultTone[result]}`}>{t(`result.${result}`)}</span>;
}

/* ------------------------------------------------------------- Country tag */

export function CountryTag({
  code,
  withFlag = true,
  className = "",
}: {
  code: CountryCode;
  withFlag?: boolean;
  className?: string;
}) {
  const { locale } = useI18n();
  const meta = countryByCode[code];
  if (!meta) return null;
  return (
    <span className={`country-tag ${className}`}>
      {withFlag ? <span className="flag">{meta.flag}</span> : null}
      {locale === "en" ? meta.en : meta.zh}
    </span>
  );
}

/* ----------------------------------------------------------------- Reveal */

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    // Degenerate environments (no IO support, no measurable viewport) reveal
    // immediately — content must never be left hidden.
    if (typeof IntersectionObserver === "undefined" || vh === 0) {
      setShown(true);
      return;
    }
    // Already in (or above) the viewport at mount → reveal now. Robust against
    // restored scroll positions, anchor jumps and fast flicks.
    if (node.getBoundingClientRect().top < vh * 0.95) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    // Safety net: guarantee content is shown even if IO never delivers.
    const fallback = window.setTimeout(() => setShown(true), 2200);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal${shown ? " is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
