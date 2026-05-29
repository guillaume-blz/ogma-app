import { cn } from "@/lib/utils";

export type DetailTab = "overview" | "tables" | "schema" | "settings";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "tables",   label: "Tables"   },
  { id: "schema",   label: "Schema"   },
  { id: "settings", label: "Settings" },
];

interface SourceDetailTabsProps {
  active: DetailTab;
  onChange: (tab: DetailTab) => void;
}

export function SourceDetailTabs({ active, onChange }: SourceDetailTabsProps) {
  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => (
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
