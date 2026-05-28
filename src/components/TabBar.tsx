import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTabStore, type Tab } from "@/stores/tabStore";
import { findNavItem } from "@/app/navigation";
import { cn } from "@/lib/utils";

export function TabBar() {
  const { openTabs, closeTab } = useTabStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleClose = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    const isActive = location.pathname === tab.path;
    closeTab(tab.id);

    if (isActive) {
      const idx = openTabs.findIndex((t) => t.id === tab.id);
      const remaining = openTabs.filter((t) => t.id !== tab.id);
      if (remaining.length > 0) {
        navigate(remaining[Math.max(0, idx - 1)].path);
      } else {
        navigate("/");
      }
    }
  };

  if (openTabs.length === 0) return null;

  return (
    <div className="flex items-end h-9 border-b border-border bg-background shrink-0 overflow-x-auto scrollbar-none">
      {openTabs.map((tab) => {
        const item = findNavItem(tab.id);
        if (!item) return null;
        const Icon = item.icon;
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn(
              "group relative flex items-center gap-1.5 h-full px-3 max-w-[180px] min-w-[100px]",
              "text-xs border-r border-border shrink-0 transition-colors",
              isActive
                ? "bg-background text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-primary"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate flex-1 text-left">{t(item.labelKey)}</span>
            <span
              role="button"
              aria-label="Close tab"
              onClick={(e) => handleClose(e, tab)}
              className={cn(
                "ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm",
                "opacity-0 group-hover:opacity-100 hover:bg-border transition-opacity",
                isActive && "opacity-60 hover:opacity-100"
              )}
            >
              <X className="h-2.5 w-2.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
