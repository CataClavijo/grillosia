import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Paso } from "@/components/paso";
import { Figura } from "@/components/figura";
import {
  COST_NOTE,
  ENCLOSURE_DISCLAIMER,
  ENCLOSURE_INTRO,
  ENCLOSURE_STEPS,
  MAINTENANCE,
  MATERIALS,
} from "@/lib/content/enclosure";

export const metadata = {
  title: "Armar la caja — GrillosIA",
  description:
    "Guía paso a paso para armar cajas de cría de grillos con materiales sencillos.",
};

export default function PaginaCaja() {
  return (
    <Paso n={1} titulo="Arme su caja">
      <section className="flex flex-col gap-3 pt-2">
        <h1 className="font-display text-[2rem] font-extrabold leading-[1.06] tracking-[-0.03em]">
          Arme su caja de cría
        </h1>
        <p className="text-[16px] leading-relaxed text-foreground/85">
          {ENCLOSURE_INTRO}
        </p>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          {ENCLOSURE_DISCLAIMER}
        </p>
      </section>

      <Accordion type="single" collapsible defaultValue="pasos" className="w-full">
        <AccordionItem value="materiales">
          <AccordionTrigger className="min-h-16 text-left text-[17px] font-bold">
            Lo que necesita
            <span className="ml-2 text-[14px] font-medium text-muted-foreground">
              {MATERIALS.length} cosas
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 text-[15px] leading-relaxed">
            <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-primary">
              {MATERIALS.map((m) => (
                <li key={m.item}>
                  <span className="font-semibold">{m.item}. </span>
                  <span className="text-foreground/85">{m.detail}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground">{COST_NOTE}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pasos">
          <AccordionTrigger className="min-h-16 text-left text-[17px] font-bold">
            Paso a paso
            <span className="ml-2 text-[14px] font-medium text-muted-foreground">
              {ENCLOSURE_STEPS.length} pasos
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ol className="flex flex-col gap-6">
              {ENCLOSURE_STEPS.map((s) => (
                <li key={s.number} className="flex flex-col gap-2">
                  <p className="flex items-baseline gap-2.5">
                    <span className="text-[15px] font-extrabold tabular-nums text-primary">
                      {s.number}.
                    </span>
                    <span className="text-[17px] font-bold leading-tight">
                      {s.title}
                    </span>
                  </p>
                  <p className="text-[15px] leading-relaxed text-foreground/85">
                    {s.body}
                  </p>
                  {s.figura && <Figura id={s.figura} prioridad={s.number === 1} />}
                  {s.tip && (
                    <p className="text-[14px] italic leading-relaxed text-muted-foreground">
                      {s.tip}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mantenimiento">
          <AccordionTrigger className="min-h-16 text-left text-[17px] font-bold">
            Cuidado de todos los días
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed marker:text-primary">
              {MAINTENANCE.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </Paso>
  );
}
