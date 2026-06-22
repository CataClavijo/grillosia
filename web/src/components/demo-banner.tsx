import { AlertTriangle } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full border-b border-demo-border bg-demo-bg backdrop-blur supports-[backdrop-filter]:bg-demo-bg"
    >
      <div className="mx-auto flex w-full max-w-[640px] items-center justify-center gap-2 px-4 py-2 text-center text-[12.5px] font-semibold leading-tight text-demo-foreground">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
        <span>
          Versión demostrativa{" "}
          <span className="opacity-70">·</span> Sistema en fase de entrenamiento
        </span>
      </div>
    </div>
  );
}
