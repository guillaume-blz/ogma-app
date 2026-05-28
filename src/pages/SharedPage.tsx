import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SharedPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <Users className="h-10 w-10 opacity-20" />
      <h1 className="text-lg font-medium">{t("nav.sharedWithMe")}</h1>
    </div>
  );
}
