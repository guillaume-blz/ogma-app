import { Edit2, Trash2, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopupMenu } from "@/components/PopupMenu";
import { SourceTypeIcon } from "./SourceTypeIcon";
import type { Source } from "../types";

const TYPE_LABELS: Record<string, string> = {
  database: "Database",
  files: "Files",
  api: "API",
  saas: "SaaS",
};

interface SourceCardProps {
  source: Source;
  onEdit: (source: Source) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}

export function SourceCard({ source, onEdit, onDelete, onTest }: SourceCardProps) {
  const menuItems = [
    { icon: Plug,   label: "Test connection", onClick: () => onTest(source.id) },
    { icon: Edit2,  label: "Edit",            onClick: () => onEdit(source) },
    { icon: Trash2, label: "Delete",          onClick: () => onDelete(source.id) },
  ];

  return (
    <PopupMenu items={menuItems}>
      <div
        className={cn(
          "group flex items-center gap-3 rounded-lg border border-border bg-card p-4",
          "cursor-pointer transition-colors hover:bg-accent/40 select-none"
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
          <SourceTypeIcon type={source.source_type} className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{source.name}</p>
          <p className="text-xs text-muted-foreground">{TYPE_LABELS[source.source_type]}</p>
        </div>
      </div>
    </PopupMenu>
  );
}
