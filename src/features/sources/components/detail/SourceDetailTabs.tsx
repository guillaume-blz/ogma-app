import { cn } from "@/lib/utils";
import type { SourceType } from "../../types";

export type DetailTab = "overview" | "tables" | "data" | "schema" | "settings";

const ALL_TABS: { id: DetailTab; label: string; databaseOnly: boolean }[] = [
  { id: "overview", label: "Overview", databaseOnly: false },
  { id: "tables",   label: "Tables",   databaseOnly: true  },
  { id: "data",     label: "Data",     databaseOnly: true  },
  { id: "schema",   label: "Schema",   databaseOnly: true  },
  { id: "settings", label: "Settings", databaseOnly: false },
];

interface SourceDetailTabsProps {
  active: DetailTab;
  sourceType: SourceType;
  onChange: (tab: DetailTab) => void;
}

export function SourceDetailTabs({ active, sourceType, onChange }: SourceDetailTabsProps) {
  const tabs = ALL_TABS.filter((t) => !t.databaseOnly || sourceType === "database");

  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative px-4 py-2 text-sm transition-colors",
            active === tab.id
              ? "text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
