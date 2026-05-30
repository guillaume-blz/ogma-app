import type { ReactNode } from "react";

interface WelcomeActionProps {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
}

export function WelcomeAction({ icon, label, shortcut, onClick }: WelcomeActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-64 px-4 py-2.5 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      <span className="shrink-0 opacity-60">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {shortcut && (
        <kbd className="shrink-0 font-mono text-xs opacity-40">{shortcut}</kbd>
      )}
    </button>
  );
}
