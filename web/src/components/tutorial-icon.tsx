import { Box, Bug, MessageCircle, Sparkles, Wheat } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  bug: Bug,
  box: Box,
  wheat: Wheat,
  "message-circle": MessageCircle,
};

export function TutorialIcon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = MAP[name] ?? Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
