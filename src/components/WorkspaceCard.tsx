import type { LucideIcon } from "lucide-react";

interface WorkspaceCardProps {
  icon: LucideIcon;
  label: string;
  count: number;
  onClick: () => void;
}

export function WorkspaceCard({ icon: Icon, label, count, onClick }: WorkspaceCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left hover:bg-accent transition-colors w-full"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}
