"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Paso } from "@/components/paso";
import { Resultado } from "@/components/resultado";
import { ANIMALS } from "@/lib/animals";
import { clearWizardDraft } from "@/lib/wizard-draft";
import { useProjects } from "@/lib/projects-store";

/**
 * Parada 4: el resultado.
 *
 * Lee la consulta activa. Si no hay ninguna —alguien entro por el menu sin
 * haber contestado— no muestra un error: muestra el camino de vuelta a la
 * parada 3, que es lo que esa persona necesita.
 */
export default function PaginaResultado() {
  const router = useRouter();
  const { active, activeId, setActive, loading } = useProjects();

  const sel = active?.selection;
  const animal = ANIMALS.find((a) => a.id === sel?.animalId);
  const etapa = animal?.stages.find((e) => e.id === sel?.stageId);
  const completa =
    animal && etapa && sel?.temp !== undefined && sel?.humidity !== undefined;

  const nuevaConsulta = () => {
    setActive(null);
    clearWizardDraft();
    router.push("/consulta");
  };

  if (loading) {
    return (
      <Paso n={4} titulo="Vea su resultado" accion={{ href: "" }}>
        <p className="py-12 text-center text-[16px] text-muted-foreground">
          Cargando su consulta...
        </p>
      </Paso>
    );
  }

  if (!completa) {
    return (
      <Paso
        n={4}
        titulo="Vea su resultado"
        accion={{ texto: "Hacer mi consulta", href: "/consulta" }}
      >
        <div className="flex flex-col gap-4 py-8">
          <h1 className="font-display text-[1.9rem] font-extrabold leading-[1.08] tracking-[-0.03em]">
            Primero hagamos su consulta
          </h1>
          <p className="text-[16px] leading-relaxed text-foreground/85">
            Son cuatro preguntas cortas sobre su animal y su clima. Con eso le
            mostramos las tres comidas comparadas para su caso.
          </p>
        </div>
      </Paso>
    );
  }

  return (
    <Paso
      n={4}
      titulo="Vea su resultado"
      accion={{ texto: "Preguntar sobre esto", href: "/chat" }}
    >
      <Resultado
        animalName={animal.name}
        stageName={etapa.name}
        proteinMin={etapa.proteinMin}
        proteinMax={etapa.proteinMax}
        temp={sel.temp as number}
        humidity={sel.humidity as number}
        onCambiar={() => router.push("/consulta")}
        onNueva={nuevaConsulta}
      />

      <p className="mt-6 text-center text-[14.5px] text-muted-foreground">
        <Link
          href="/consultas"
          className="font-semibold text-primary underline underline-offset-2"
        >
          Ver mis consultas guardadas
        </Link>
      </p>
      {!activeId && null}
    </Paso>
  );
}
