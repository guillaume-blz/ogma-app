import { Database, FileStack, Globe, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceType } from "../types";

const ICONS: Record<SourceType, React.ElementType> = {
  database: Database,
  files: FileStack,
  api: Globe,
  saas: Boxes,
};

interface SourceTypeIconProps {
  type: SourceType;
  className?: string;
}

export function SourceTypeIcon({ type, className }: SourceTypeIconProps) {
  const Icon = ICONS[type] ?? Database;
  return <Icon className={cn("size-4", className)} />;
}
