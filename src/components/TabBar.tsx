import { X, ArrowLeftToLine, ArrowRightToLine, Database } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTabStore, type Tab } from "@/stores/tabStore";
import { findNavItem } from "@/app/navigation";
import { PopupMenu, type PopupMenuItemConfig } from "@/components/PopupMenu";
import { cn } from "@/lib/utils";

function resolveTab(tab: Tab, t: ReturnType<typeof import("react-i18next").useTranslation>["t"]) {
  const item = findNavItem(tab.id);
  if (item) return { Icon: item.icon, label: t(item.labelKey) };
  if (tab.path.startsWith("/sources/")) return { Icon: Database, label: tab.label ?? tab.id };
  return null;
}

export function TabBar() {
  const { openTabs, closeTab, closeTabsWhere } = useTabStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const closeTabById = (tab: Tab) => {
    const isActive = location.pathname === tab.path;
    closeTab(tab.id);
    if (isActive) {
      const idx = openTabs.findIndex((t) => t.id === tab.id);
      const remaining = openTabs.filter((t) => t.id !== tab.id);
      navigate(remaining.length > 0 ? remaining[Math.max(0, idx - 1)].path : "/");
    }
  };

  const getContextMenuItems = (tab: Tab): PopupMenuItemConfig[] => {
    const idx = openTabs.findIndex((t) => t.id === tab.id);
    const isFirst = idx === 0;
    const isLast = idx === openTabs.length - 1;

    return [
      {
        icon: X,
        label: t("tabs.close"),
        shortcutId: "close-tab",
        onClick: () => closeTabById(tab),
      },
      {
        icon: ArrowLeftToLine,
        label: t("tabs.closeLeft"),
        disabled: isFirst,
        onClick: () => {
          const leftTabs = openTabs.slice(0, idx);
          const activeIsLeft = leftTabs.some((t) => t.path === location.pathname);
          closeTabsWhere((t) => leftTabs.some((l) => l.id === t.id));
          if (activeIsLeft) navigate(tab.path);
        },
      },
      {
        icon: ArrowRightToLine,
        label: t("tabs.closeRight"),
        disabled: isLast,
        onClick: () => {
          const rightTabs = openTabs.slice(idx + 1);
          const activeIsRight = rightTabs.some((t) => t.path === location.pathname);
          closeTabsWhere((t) => rightTabs.some((r) => r.id === t.id));
          if (activeIsRight) navigate(tab.path);
        },
      },
    ];
  };

  if (openTabs.length === 0) return null;

  return (
    <div className="flex items-end h-9 border-b border-border bg-background shrink-0 overflow-x-auto scrollbar-none">
      {openTabs.map((tab) => {
        const resolved = resolveTab(tab, t);
        if (!resolved) return null;
        const { Icon, label: tabLabel } = resolved;
        const isActive = location.pathname === tab.path;

        return (
          <PopupMenu key={tab.id} items={getContextMenuItems(tab)}>
            <button
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
              <span className="truncate flex-1 text-left">{tabLabel}</span>
              <span
                role="button"
                aria-label={t("tabs.close")}
                onClick={(e) => { e.stopPropagation(); closeTabById(tab); }}
                className={cn(
                  "ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm",
                  "opacity-0 group-hover:opacity-100 hover:bg-border transition-opacity",
                  isActive && "opacity-60 hover:opacity-100"
                )}
              >
                <X className="h-2.5 w-2.5" />
              </span>
            </button>
          </PopupMenu>
        );
      })}
    </div>
  );
}
