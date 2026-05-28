import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { PageHeader } from "@/components/PageHeader";
import { SettingsSection } from "@/components/SettingsSection";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import { ThemeSelect } from "@/components/ThemeSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SupportedLanguage = "en" | "fr" | "ja";

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  fr: "Français",
  ja: "日本語",
};

function LanguageSelect() {
  const { language, setLanguage } = useLanguage();

  const options = (Object.entries(LANGUAGE_NAMES) as [SupportedLanguage, string][]);

  return (
    <Select
      value={language}
      onValueChange={(value) => setLanguage(value as SupportedLanguage)}
    >
      <SelectTrigger className="w-40">
        <SelectValue>{LANGUAGE_NAMES[language]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <SettingsSection title={t("settings.appearance.sectionTitle")}>
        <SettingsRow
          label={t("settings.appearance.mode.label")}
          description={t("settings.appearance.mode.description")}
        >
          <ThemeModeToggle />
        </SettingsRow>
        <SettingsRow
          label={t("settings.appearance.lightTheme.label")}
          description={t("settings.appearance.lightTheme.description")}
        >
          <ThemeSelect type="light" />
        </SettingsRow>
        <SettingsRow
          label={t("settings.appearance.darkTheme.label")}
          description={t("settings.appearance.darkTheme.description")}
        >
          <ThemeSelect type="dark" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title={t("settings.language.sectionTitle")}>
        <SettingsRow
          label={t("settings.language.label")}
          description={t("settings.language.description")}
        >
          <LanguageSelect />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
