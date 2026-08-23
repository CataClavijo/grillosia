import { Info } from "lucide-react";
import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Paso } from "@/components/paso";
import {
  CATALOG_INTRO,
  CATALOG_NOTE,
  COMO_CAPTURAR,
  COMO_RECONOCER,
  CRICKET_PHOTOS,
  FAMILIA,
} from "@/lib/content/catalog";

export const metadata = {
  title: "Los grillos — GrillosIA",
  description:
    "Fotografías de los grillos del proyecto GrillosIA, familia Gryllidae, del Piedemonte Llanero.",
};

export default function PaginaGrillos() {
  return (
    <Paso n={2} titulo="Conozca sus grillos">

      <section className="flex flex-col gap-3">
        <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          Los grillos de nuestra tierra
        </h1>
        <p className="w-fit rounded-full bg-primary/10 px-3 py-1 text-[14px] font-semibold text-primary">
          {FAMILIA}
        </p>
        <p className="text-[16px] leading-relaxed text-foreground/85">
          {CATALOG_INTRO}
        </p>
      </section>

      {/* Galería */}
      <section className="flex flex-col gap-6">
        {CRICKET_PHOTOS.map((photo, i) => (
          <figure key={photo.id} className="flex flex-col gap-2">
            <div className="overflow-hidden rounded-2xl border bg-white">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={720}
                height={900}
                sizes="(max-width: 520px) 100vw, 520px"
                priority={i === 0}
                className="h-auto w-full object-contain"
              />
            </div>
            <figcaption className="flex flex-col gap-1">
              <p className="text-[15px] leading-relaxed text-foreground/85">
                {photo.note}
              </p>
              <p className="text-[13px] text-muted-foreground">
                Fotografía: {photo.credit}
              </p>
            </figcaption>
          </figure>
        ))}
      </section>

      {/* Aviso sobre la identificación pendiente */}
      <div className="flex items-start gap-3 rounded-2xl border border-demo-border bg-demo-bg p-4">
        <Info
          className="mt-0.5 size-4 shrink-0 text-demo-foreground"
          strokeWidth={2.25}
        />
        <p className="text-[13.5px] leading-relaxed text-demo-foreground">
          {CATALOG_NOTE}
        </p>
      </div>

      {/* Contenido práctico, aplicable a toda la familia */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="reconocer">
          <AccordionTrigger className="min-h-16 text-left text-[17px] font-bold">
            Cómo reconocer un grillo
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed marker:text-primary">
              {COMO_RECONOCER.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="capturar">
          <AccordionTrigger className="min-h-16 text-left text-[17px] font-bold">
            Cómo capturarlos
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed marker:text-primary">
              {COMO_CAPTURAR.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Paso>
  );
}
