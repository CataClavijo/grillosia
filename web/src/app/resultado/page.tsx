"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Estado } from "@/components/ds/estado";
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
 *
 * Es la ultima parada, asi que abajo no hay "siguiente": las acciones
 * (cambiar respuestas, nueva consulta, preguntar al asistente) viven dentro
 * del tablero, junto a lo que modifican.
 */
export default function PaginaResultado() {
  const router = useRouter();
  const { active, setActive, loading } = useProjects();
  // Cambiar la clave vuelve a montar el tablero, y con el la consulta al
  // modelo: es el "intentar de nuevo" tras un error.
  const [intento, setIntento] = useState(0);

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
        <Estado tipo="cargando" titulo="Abriendo su consulta" compacto className="max-w-md">
          Un momento, estamos leyendo sus respuestas.
        </Estado>
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
        <div className="flex max-w-[60ch] flex-col gap-4 py-6">
          <p className="t-eyebrow text-subtle">Resultado</p>
          <h1 className="t-h1">Primero hagamos su consulta</h1>
          <p className="t-lead">
            Son unas preguntas cortas sobre su animal, su etapa y su clima. Con
            eso le mostramos las tres comidas comparadas para su caso.
          </p>
        </div>
      </Paso>
    );
  }

  return (
    <Paso n={4} titulo="Vea su resultado" accion={{ href: "" }}>
      <Resultado
        key={intento}
        animal={animal}
        etapa={etapa}
        temp={sel.temp as number}
        humidity={sel.humidity as number}
        // Con `editar`: sin eso, la consulta ya contestada salta sola al
        // paso 4 y rebota de vuelta aqui, y el boton parecia muerto.
        onCambiar={() => router.push("/consulta?editar=1")}
        onNueva={nuevaConsulta}
        onReintentar={() => setIntento((n) => n + 1)}
      />
    </Paso>
  );
}
