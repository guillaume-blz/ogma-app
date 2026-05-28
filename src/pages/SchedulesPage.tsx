import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SchedulesPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <CalendarClock className="h-10 w-10 opacity-20" />
      <h1 className="text-lg font-medium">{t("nav.schedules")}</h1>
    </div>
  );
}
