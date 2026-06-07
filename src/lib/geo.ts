import type { CountryCode } from "./types";

export interface CountryMeta {
  code: CountryCode;
  zh: string;
  en: string;
  flag: string;
  region: "北美" | "英国与欧洲" | "亚洲" | "大洋洲";
  regionEn: "North America" | "UK & Europe" | "Asia" | "Oceania";
}

/**
 * Canonical, ordered country metadata. The display order here drives the
 * country strips, taxonomy bands and analytics axes across the product.
 */
export const countryMeta: CountryMeta[] = [
  { code: "US", zh: "美国", en: "United States", flag: "🇺🇸", region: "北美", regionEn: "North America" },
  { code: "CA", zh: "加拿大", en: "Canada", flag: "🇨🇦", region: "北美", regionEn: "North America" },
  { code: "UK", zh: "英国", en: "United Kingdom", flag: "🇬🇧", region: "英国与欧洲", regionEn: "UK & Europe" },
  { code: "CH", zh: "瑞士", en: "Switzerland", flag: "🇨🇭", region: "英国与欧洲", regionEn: "UK & Europe" },
  { code: "DE", zh: "德国", en: "Germany", flag: "🇩🇪", region: "英国与欧洲", regionEn: "UK & Europe" },
  { code: "NL", zh: "荷兰", en: "Netherlands", flag: "🇳🇱", region: "英国与欧洲", regionEn: "UK & Europe" },
  { code: "SG", zh: "新加坡", en: "Singapore", flag: "🇸🇬", region: "亚洲", regionEn: "Asia" },
  { code: "HK", zh: "中国香港", en: "Hong Kong SAR", flag: "🇭🇰", region: "亚洲", regionEn: "Asia" },
  { code: "JP", zh: "日本", en: "Japan", flag: "🇯🇵", region: "亚洲", regionEn: "Asia" },
  { code: "AU", zh: "澳大利亚", en: "Australia", flag: "🇦🇺", region: "大洋洲", regionEn: "Oceania" },
];

export const countryByCode: Record<CountryCode, CountryMeta> = countryMeta.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<CountryCode, CountryMeta>,
);

export const countryLabels: Record<CountryCode, string> = countryMeta.reduce(
  (acc, item) => {
    acc[item.code] = item.zh;
    return acc;
  },
  {} as Record<CountryCode, string>,
);

export function countryName(code: CountryCode, locale: "zh" | "en") {
  const meta = countryByCode[code];
  if (!meta) return code;
  return locale === "en" ? meta.en : meta.zh;
}

export function countryFlag(code: CountryCode) {
  return countryByCode[code]?.flag ?? "🏳️";
}
