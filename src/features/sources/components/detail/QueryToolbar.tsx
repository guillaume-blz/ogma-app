import { RefreshCw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_SIZES } from "../../hooks/useTableQuery";
import type { PageSize } from "../../hooks/useTableQuery";

interface QueryToolbarProps {
  table: string;
  total: number | undefined;
  page: number;
  pageSize: PageSize;
  totalPages: number | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
  onRefresh: () => void;
}

export function QueryToolbar({
  table,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  onPageChange,
  onPageSizeChange,
  onRefresh,
}: QueryToolbarProps) {
  const canPrev = page > 1;
  const canNext = totalPages != null ? page < totalPages : true;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-mono font-medium text-foreground">{table}</span>

      {total != null && (
        <span className="text-muted-foreground/60">
          {total.toLocaleString()} row{total !== 1 ? "s" : ""}
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        {loading && <Loader2 className="size-3 animate-spin" />}

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          className="rounded border border-border bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} rows</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <PaginationBtn onClick={() => onPageChange(page - 1)} disabled={!canPrev}>
            <ChevronLeft className="size-3.5" />
          </PaginationBtn>
          <span className="min-w-[60px] text-center">
            {totalPages != null ? `${page} / ${totalPages}` : `Page ${page}`}
          </span>
          <PaginationBtn onClick={() => onPageChange(page + 1)} disabled={!canNext}>
            <ChevronRight className="size-3.5" />
          </PaginationBtn>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className={cn(
            "flex size-6 items-center justify-center rounded border border-border hover:bg-muted transition-colors",
            "disabled:opacity-40"
          )}
          aria-label="Refresh"
        >
          <RefreshCw className="size-3" />
        </button>
      </div>
    </div>
  );
}

function PaginationBtn({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
    >
      {children}
    </button>
  );
}
