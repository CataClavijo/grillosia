import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteNav } from "@/components/site-nav";
import { BackToGuide } from "@/components/back-to-guide";
import { CATALOG_INTRO, CATALOG_NOTE, CRICKETS } from "@/lib/content/catalog";

const ACTIVITY_LABEL: Record<string, string> = {
  Nocturno: "Sale de noche",
  Crepuscular: "Sale al amanecer y al atardecer",
  Diurno: "Sale de día",
};

export const metadata = {
  title: "Los tres grillos — GrillIA",
  description:
    "Grillos nativos del Piedemonte Llanero considerados en el proyecto GrillIA.",
};

export default function CatalogPage() {
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
          Los grillos de nuestra tierra
        </h1>
        <p className="text-[16px] leading-relaxed text-foreground/85">
          {CATALOG_INTRO}
        </p>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          {CATALOG_NOTE}
        </p>
      </section>

      <Accordion type="single" collapsible className="w-full">
        {CRICKETS.map((c) => (
          <AccordionItem key={c.id} value={c.id}>
            <AccordionTrigger className="min-h-16 text-left text-[17px] font-bold">
              <span className="flex flex-col gap-0.5">
                {c.common_name}
                <span className="text-[13px] font-medium text-muted-foreground">
                  {c.size_cm} ·{" "}
                  {ACTIVITY_LABEL[c.activity] ?? c.activity}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-[15px] leading-relaxed">
              <p>
                <span className="font-semibold">Dónde vive. </span>
                {c.habitat}
              </p>
              <p>
                <span className="font-semibold">Cómo reconocerlo. </span>
                {c.recognition}
              </p>
              <p>
                <span className="font-semibold">Cómo capturarlo. </span>
                {c.capture_tip}
              </p>
              <p className="text-primary">
                <span className="font-semibold">Para criar. </span>
                {c.suitability}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <BackToGuide />
    </main>
  );
}
