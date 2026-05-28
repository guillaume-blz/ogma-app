import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <Home className="h-10 w-10 opacity-20" />
      <h1 className="text-lg font-medium">{t("nav.home")}</h1>
    </div>
  );
}
