"use client";

import { useEffect, useState } from "react";

import { DIETS } from "@/lib/animals";

/**
 * Puente entre la plataforma y el modelo.
 *
 * El modelo corre en un servicio aparte, en Python, porque la web se despliega
 * en Vercel y allí no hay dónde ejecutar scikit-learn. Sin la dirección de ese
 * servicio la aplicación funciona igual: el resultado deja los huecos en "por
 * confirmar", que es el estado normal mientras no lleguen los análisis
 * bromatológicos.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

export interface ResultadoDieta {
  tipo_dieta: string;
  proteina_harina: number;
  lipidos_harina: number;
  margen_proteina: number;
  margen_lipidos: number;
  tasa_supervivencia: number | null;
  fuera_de_rango: string[] | null;
}

export interface InfoModelo {
  datos_simulados: boolean;
  origen_datos: string;
  n_muestras: number;
  entrenado_en: string;
  advertencias: string[];
}

export type EstadoPrediccion =
  /** No hay servicio configurado: la plataforma corre sola. */
  | { estado: "sin-servicio" }
  | { estado: "cargando" }
  /** El servicio responde pero todavía no hay modelo entrenado. */
  | { estado: "sin-modelo" }
  /** No se pudo hablar con el servicio. */
  | { estado: "error" }
  | { estado: "listo"; resultados: ResultadoDieta[]; modelo: InfoModelo };

export interface CondicionesConsulta {
  temperatura: number;
  humedad: number;
  /** Días hasta la cosecha. Valor de referencia mientras no se pregunte. */
  dias?: number;
  /** Gramos por día. Valor de referencia mientras no se pregunte. */
  alimento?: number;
}

/**
 * Pide al modelo una predicción por cada dieta en estudio, con las mismas
 * condiciones. Devuelve siempre un estado, nunca lanza: que no haya modelo es
 * lo esperado, no una avería.
 */
export function usePrediccion(
  condiciones: CondicionesConsulta | null,
): EstadoPrediccion {
  const [estado, setEstado] = useState<EstadoPrediccion>(
    API ? { estado: "cargando" } : { estado: "sin-servicio" },
  );

  const { temperatura, humedad, dias, alimento } = condiciones ?? {};

  useEffect(() => {
    if (!API || temperatura === undefined || humedad === undefined) return;

    let vigente = true;
    setEstado({ estado: "cargando" });

    const cuerpo = {
      condiciones: DIETS.map((d) => ({
        tipo_dieta: d.id,
        alimento_g_dia: alimento ?? 2.5,
        temperatura,
        humedad_ambiental: humedad,
        tiempo_desarrollo: dias ?? 45,
      })),
    };

    void (async () => {
      try {
        const res = await fetch(`${API}/api/v1/predict`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(cuerpo),
        });

        if (!vigente) return;

        if (res.status === 503) {
          setEstado({ estado: "sin-modelo" });
          return;
        }
        if (!res.ok) {
          setEstado({ estado: "error" });
          return;
        }

        const datos = (await res.json()) as {
          resultados: ResultadoDieta[];
          modelo: InfoModelo;
        };
        setEstado({
          estado: "listo",
          resultados: datos.resultados,
          modelo: datos.modelo,
        });
      } catch {
        if (vigente) setEstado({ estado: "error" });
      }
    })();

    return () => {
      vigente = false;
    };
  }, [temperatura, humedad, dias, alimento]);

  return estado;
}
