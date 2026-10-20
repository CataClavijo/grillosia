"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Estado } from "@/components/ds/estado";
import { Barra } from "@/components/barra";
import { Pasos } from "@/components/ds/pasos";
import { BarraAcciones } from "@/components/paso";
import { Resultado } from "@/components/resultado";
import { animalPorId, etapaPorId } from "@/lib/animals";
import { pasosConsulta } from "@/lib/consulta-pasos";
import { useProjects } from "@/lib/projects-store";

/**
 * El resultado: el cuarto paso de la consulta.
 *
 * Lee la consulta activa. Si no hay ninguna —alguien entro por el menu sin
 * haber contestado— no muestra un error: muestra el camino de vuelta a la
 * consulta, que es lo que esa persona necesita.
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

  // Entrar a /consulta sin pantalla ya es empezar una nueva; la abierta
  // queda en "Mis consultas".
  const nuevaConsulta = () => {
    setActive(null);
    router.push("/consulta");
  };

  if (loading) {
    return (
      <Marco>
        <Estado tipo="cargando" titulo="Abriendo su consulta" compacto className="max-w-md">
          Un momento, estamos leyendo sus respuestas.
        </Estado>
      </Marco>
    );
  }

  if (!completa) {
    return (
      <Marco>
        <div className="flex max-w-[60ch] flex-col gap-4 py-6">
          <p className="t-eyebrow text-subtle">Resultado</p>
          <h1 className="t-h1">Primero hagamos su consulta</h1>
          <p className="t-lead">
            Son unas preguntas cortas sobre su animal, su etapa y su clima. Con
            eso le mostramos las tres comidas comparadas para su caso.
          </p>
          <Link
            href="/consulta"
            className="mt-2 inline-flex h-12 w-fit items-center rounded-md bg-primary px-6 text-[16px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Hacer mi consulta
          </Link>
        </div>
      </Marco>
    );
  }

  return (
    <Marco>
      <Resultado
        key={intento}
        animal={animal}
        etapa={etapa}
        temp={sel.temp as number}
        humidity={sel.humidity as number}
        // Con `editar`: sin eso, la consulta ya contestada salta sola al
        // paso 4 y rebota de vuelta aqui, y el boton parecia muerto.
        onCambiar={() => router.push("/consulta?editar=1&p=animal")}
        onNueva={nuevaConsulta}
        onReintentar={() => setIntento((n) => n + 1)}
      />
    </Marco>
  );
}

/**
 * Armazon del resultado: la cabecera del sitio, los pasos de la consulta
 * con los tres primeros hechos (cada uno abre esa pregunta para cambiarla)
 * y "Atras" al final, que vuelve al clima.
 */
function Marco({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Barra />
      <Pasos pasos={pasosConsulta(true)} actual={4} />
      <main
        aria-label="Su resultado"
        className="mx-auto flex w-full max-w-[1240px] flex-col px-5 pt-8 lg:px-8 lg:pt-12"
      >
        <div className="pb-10 lg:pb-16">{children}</div>
        <BarraAcciones atras={{ href: "/consulta?editar=1&p=clima" }} fija={false} />
      </main>
    </>
  );
}
