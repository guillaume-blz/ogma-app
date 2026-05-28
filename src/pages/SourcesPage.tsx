import { Database } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SourcesPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <Database className="h-10 w-10 opacity-20" />
      <h1 className="text-lg font-medium">{t("nav.sources")}</h1>
    </div>
  );
}
