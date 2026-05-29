import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Kbd } from "@/components/ui/kbd";
import { Search, Database, FileText, Globe, Cloud } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";
import { useSourceStore } from "@/features/sources/store";
import { useTabStore } from "@/stores/tabStore";
import { navItemsFlat } from "@/app/navigation";
import type { SourceType } from "@/features/sources/types";

const SOURCE_ICON: Record<SourceType, LucideIcon> = {
  database: Database,
  files: FileText,
  api: Globe,
  saas: Cloud,
};

interface PaletteItem {
  id: string;
  label: string;
  Icon: LucideIcon;
  group: "navigation" | "sources";
  onSelect: () => void;
}

export function CommandPalette() {
  const { t } = useTranslation();
  const { open, close } = useCommandPaletteStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const addTab = useTabStore((s) => s.addTab);
  const sources = useSourceStore((s) => s.sources);
  const fetchSources = useSourceStore((s) => s.fetchSources);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      fetchSources();
      inputRef.current?.focus();
    }
  }, [open, fetchSources]);

  const goTo = useCallback(
    (id: string, path: string, label?: string) => {
      addTab({ id, path, label });
      navigate(path);
      close();
    },
    [addTab, navigate, close]
  );

  const q = query.toLowerCase();

  const navItems: PaletteItem[] = navItemsFlat
    .filter((item) => item.id !== "home")
    .filter((item) => t(item.labelKey).toLowerCase().includes(q))
    .map((item) => ({
      id: `nav-${item.id}`,
      label: t(item.labelKey),
      Icon: item.icon,
      group: "navigation" as const,
      onSelect: () => goTo(item.id, item.path),
    }));

  const sourceItems: PaletteItem[] = sources
    .filter((s) => s.name.toLowerCase().includes(q))
    .map((s) => ({
      id: `source-${s.id}`,
      label: s.name,
      Icon: SOURCE_ICON[s.source_type] ?? Database,
      group: "sources" as const,
      onSelect: () => goTo(`source-${s.id}`, `/sources/${s.id}`, s.name),
    }));

  const allItems: PaletteItem[] = [...navItems, ...sourceItems];

  const safeIndex = Math.min(activeIndex, Math.max(0, allItems.length - 1));

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${safeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [safeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(1, allItems.length));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + Math.max(1, allItems.length)) % Math.max(1, allItems.length));
    }
    if (e.key === "Enter" && allItems[safeIndex]) {
      allItems[safeIndex].onSelect();
    }
  };

  if (!open) return null;

  const showNav = navItems.length > 0;
  const showSources = sourceItems.length > 0;
  const navOffset = 0;
  const sourcesOffset = navItems.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative w-full max-w-[560px] mx-4 rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, sources…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {allItems.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for "{query}"
            </p>
          )}

          {showNav && (
            <div>
              <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                Navigation
              </p>
              {navItems.map((item, i) => (
                <ResultRow
                  key={item.id}
                  item={item}
                  index={navOffset + i}
                  active={safeIndex === navOffset + i}
                  onMouseEnter={() => setActiveIndex(navOffset + i)}
                />
              ))}
            </div>
          )}

          {showSources && (
            <div className={showNav ? "mt-1" : undefined}>
              <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                Sources
              </p>
              {sourceItems.map((item, i) => (
                <ResultRow
                  key={item.id}
                  item={item}
                  index={sourcesOffset + i}
                  active={safeIndex === sourcesOffset + i}
                  onMouseEnter={() => setActiveIndex(sourcesOffset + i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-xs text-muted-foreground/60">
          <span><Kbd>↑↓</Kbd> navigate</span>
          <span><Kbd>↵</Kbd> open</span>
          <span><Kbd>Esc</Kbd> close</span>
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  item,
  index,
  active,
  onMouseEnter,
}: {
  item: PaletteItem;
  index: number;
  active: boolean;
  onMouseEnter: () => void;
}) {
  return (
    <button
      type="button"
      data-index={index}
      onClick={item.onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors text-left",
        active
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-accent/50"
      )}
    >
      <item.Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{item.label}</span>
    </button>
  );
}
