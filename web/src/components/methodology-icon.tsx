import {
  BookOpen,
  Brain,
  Database,
  Flag,
  Layers,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  target: Target,
  layers: Layers,
  brain: Brain,
  database: Database,
  flag: Flag,
  "book-open": BookOpen,
};

export function MethodologyIcon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = MAP[name] ?? Target;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
