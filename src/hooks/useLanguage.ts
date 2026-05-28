import { useTranslation } from "react-i18next";

type SupportedLanguage = "en" | "fr" | "ja";

export function useLanguage() {
  const { i18n } = useTranslation();
  return {
    language: i18n.language as SupportedLanguage,
    setLanguage: (lng: SupportedLanguage) => i18n.changeLanguage(lng),
  };
}
