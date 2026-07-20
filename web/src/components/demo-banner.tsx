import { Sparkles } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 w-full border-b border-demo-border bg-demo-bg backdrop-blur supports-[backdrop-filter]:bg-demo-bg"
    >
      <div className="mx-auto flex w-full max-w-[640px] items-center justify-center gap-2 px-4 py-2 text-center text-[13px] font-semibold leading-tight text-demo-foreground">
        <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
        <span>
          En pruebas <span className="opacity-70">·</span> Estamos aprendiendo
          con usted
        </span>
      </div>
    </div>
  );
}
