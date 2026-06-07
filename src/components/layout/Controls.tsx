import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  return (
    <button
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={t("common.theme")}
      title={theme === "light" ? "Dark mode" : "Light mode"}
    >
      {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}

export function LangToggle() {
  const { locale, toggleLocale, t } = useI18n();
  return (
    <button
      className="lang-toggle"
      onClick={toggleLocale}
      aria-label={t("common.language")}
      title={t("common.language")}
    >
      <span className={locale === "zh" ? "on" : ""}>中</span>
      <span className="sep">/</span>
      <span className={locale === "en" ? "on" : ""}>EN</span>
    </button>
  );
}
