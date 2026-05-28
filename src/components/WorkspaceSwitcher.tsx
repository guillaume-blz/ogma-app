import { Building2, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export function WorkspaceSwitcher() {
  const { t } = useTranslation();
  return (
    <div className="p-2 border-t border-sidebar-border shrink-0">
      <button className="flex w-full items-center gap-2.5 rounded-md p-2 hover:bg-sidebar-accent transition-colors group">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-sm font-medium text-sidebar-foreground truncate leading-tight">
            {t("workspace.title")}
          </span>
          <span className="text-[11px] text-sidebar-foreground/50 leading-tight">
            {t("workspace.plan")}
          </span>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70 transition-colors" />
      </button>
    </div>
  );
}
