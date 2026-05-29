import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Database, FileText, Globe, Cloud, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSourceStore } from "@/features/sources/store";
import { useTabStore } from "@/stores/tabStore";
import type { SourceType } from "@/features/sources/types";

const SOURCE_ICON: Record<SourceType, React.ElementType> = {
  database: Database,
  files: FileText,
  api: Globe,
  saas: Cloud,
};

export function SidebarSourcesSection({ label }: { label: string }) {
  const [expanded, setExpanded] = useState(false);
  const [fetched, setFetched] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const addTab = useTabStore((s) => s.addTab);

  const sources = useSourceStore((s) => s.sources);
  const loading = useSourceStore((s) => s.loading);
  const fetchSources = useSourceStore((s) => s.fetchSources);

  const isParentActive =
    location.pathname === "/sources" || location.pathname.startsWith("/sources/");

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expanded && !fetched) {
      fetchSources();
      setFetched(true);
    }
    setExpanded((v) => !v);
  };

  const handleParentClick = () => {
    addTab({ id: "sources", path: "/sources" });
    navigate("/sources");
  };

  const handleSourceClick = (id: string) => {
    addTab({ id: `source-${id}`, path: `/sources/${id}` });
    navigate(`/sources/${id}`);
  };

  return (
    <div>
      <div
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
          "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isParentActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        )}
      >
        <button onClick={handleParentClick} className="flex flex-1 min-w-0 items-center gap-2.5">
          <Database className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </button>
        <button
          onClick={handleToggle}
          className="shrink-0 rounded p-0.5 hover:bg-sidebar-accent"
          aria-label={expanded ? "Collapse sources" : "Expand sources"}
        >
          <ChevronRight
            className={cn("h-3.5 w-3.5 transition-transform duration-150", expanded && "rotate-90")}
          />
        </button>
      </div>

      {expanded && (
        <div className="mt-0.5 flex flex-col gap-0.5 pl-4">
          {loading && sources.length === 0 && (
            <>
              <div className="h-7 rounded-md bg-sidebar-accent/40 animate-pulse" />
              <div className="h-7 rounded-md bg-sidebar-accent/40 animate-pulse" />
            </>
          )}

          {!loading && sources.length === 0 && (
            <button
              onClick={handleParentClick}
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
            >
              <Plus className="h-3 w-3 shrink-0" />
              <span>Add a source</span>
            </button>
          )}

          {sources.map((source) => {
            const Icon = SOURCE_ICON[source.source_type] ?? Database;
            const active = location.pathname === `/sources/${source.id}`;
            return (
              <button
                key={source.id}
                onClick={() => handleSourceClick(source.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                  "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{source.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
