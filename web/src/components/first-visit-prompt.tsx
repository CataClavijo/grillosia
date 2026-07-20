"use client";

import Link from "next/link";
import { GraduationCap, X } from "lucide-react";

import { useTutorialSeen } from "@/lib/projects-store";

/**
 * Aviso amable en la landing invitando al tutorial cuando el usuario
 * nunca lo ha visto. Se puede descartar y no aparece más gracias al flag
 * en localStorage. En SSR se renderiza como "ya visto" para evitar
 * parpadeo.
 */
export function FirstVisitPrompt() {
  const { seen, markSeen } = useTutorialSeen();
  if (seen) return null;

  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="flex-1">
        <p className="text-[14.5px] font-bold leading-tight">
          ¿Es su primera vez?
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-foreground/75">
          Le sugerimos un recorrido de cinco pasos antes de empezar.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/tutorial"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-[12.5px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Empezar tutorial
          </Link>
          <button
            type="button"
            onClick={markSeen}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-foreground/60 hover:text-foreground"
          >
            Después <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
