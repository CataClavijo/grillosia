import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { SiteNav } from "@/components/site-nav";
import { InterestForm } from "@/components/interest-form";

export const metadata = {
  title: "Dejar sus datos — GrillIA",
  description:
    "Déjenos su correo y le avisamos cuando el modelo esté validado.",
};

export default function ContactoPage() {
  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-col gap-8 px-6 pb-16 pt-5">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
          Inicio
        </Link>
        <SiteNav />
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          Estemos en contacto
        </h1>
        <p className="text-[16px] leading-relaxed text-foreground/85">
          Déjenos su correo y le avisamos cuando terminemos de validar el
          modelo.
        </p>
      </section>

      <InterestForm />
    </main>
  );
}
