import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card/40 pb-[calc(env(safe-area-inset-bottom)+72px)] sm:pb-6">
      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-2 px-6 py-6 text-center">
        <p className="text-[14px] font-semibold text-foreground/90">
          GrillIA 2026 · En pruebas
        </p>
        <p className="text-[13px] leading-relaxed text-foreground/70">
          Universidad de los Llanos · Convocatoria Minciencias 963 de 2025
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-foreground/60">
          <Link
            href="/metodologia"
            className="underline underline-offset-2 hover:text-foreground/90"
          >
            Para investigadores: metodología técnica
          </Link>
        </p>
      </div>
    </footer>
  );
}
