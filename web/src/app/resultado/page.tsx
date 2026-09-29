"use client";

import { useRouter } from "next/navigation";

import { Paso } from "@/components/paso";
import { Resultado } from "@/components/resultado";
import { animalPorId, etapaPorId } from "@/lib/animals";
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
  const { active, setActive, loading } = useProjects();

  const sel = active?.selection;
  const animal = animalPorId(sel?.animalId);
  const etapa = etapaPorId(animal, sel?.stageId);
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
          <h1 className="font-display text-[2.2rem] font-medium leading-[1.08] lg:text-[2.9rem]">
            Primero hagamos su consulta
          </h1>
          <p className="text-[16px] leading-relaxed text-foreground/85">
            Son unas preguntas cortas sobre su animal, su etapa y su clima.
            Con eso le mostramos las tres comidas comparadas para su caso.
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
        animal={animal}
        etapa={etapa}
        temp={sel.temp as number}
        humidity={sel.humidity as number}
        // Con `editar`: sin eso, la consulta ya contestada salta sola al
        // paso 4 y rebota de vuelta aqui, y el boton parecia muerto.
        onCambiar={() => router.push("/consulta?editar=1")}
        onNueva={nuevaConsulta}
      />

    </Paso>
  );
}
