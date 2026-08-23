"use client";

import type { CSSProperties } from "react";

import { DIETS, HYDRATION_NOTE } from "@/lib/animals";
import { usePrediccion } from "@/lib/prediccion";

/** Retardo escalonado de las animaciones de entrada. */
const d = (ms: number): CSSProperties =>
  ({ ["--delay" as string]: `${ms}ms` }) as CSSProperties;

/**
 * La parada 4: el resultado de la consulta.
 *
 * Vivia dentro del asistente guiado, como una quinta pantalla suya. Se saco a
 * su propia ruta para que la direccion diga en que parada esta, para que el
 * boton de volver del navegador haga lo esperado, y para que se pueda enlazar
 * desde el menu y desde "mis consultas".
 */
export function Resultado({
  animalName,
  stageName,
  proteinMin,
  proteinMax,
  temp,
  humidity,
  onCambiar,
  onNueva,
}: {
  animalName: string;
  stageName: string;
  proteinMin: number;
  proteinMax: number;
  temp: number;
  humidity: number;
  onCambiar: () => void;
  onNueva: () => void;
}) {
  const prediccion = usePrediccion({ temperatura: temp, humedad: humidity });

  return (
    <section className="reveal" style={d(0)}>
      <h1 className="text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
        Las tres comidas en estudio
      </h1>
      <p className="mt-2 text-[16px] leading-relaxed text-foreground/85">
        Le sugerimos comparar estas tres. Todavía no le damos una sola
        respuesta: seguimos aprendiendo.
      </p>

      {/* Una línea, no una tarjeta de cuatro celdas */}
      <p className="mt-6 text-[15px] text-muted-foreground">
        {animalName} · {stageName} · {temp} °C · {humidity} % —{" "}
        <button
          type="button"
          onClick={onCambiar}
          className="font-semibold text-primary underline underline-offset-2"
        >
          cambiar
        </button>
      </p>

      {/* Lo que su animal necesita — esto sí es un dato firme (tablas NRC) */}
      <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
        <p className="text-[14px] font-semibold text-foreground/85">
          Su {animalName.toLowerCase()} en etapa de {stageName.toLowerCase()}{" "}
          necesita
        </p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-[2.5rem] font-extrabold leading-none tracking-[-0.02em] text-primary">
            {proteinMin} a {proteinMax}
          </span>
          <span className="text-[1.2rem] font-bold text-primary/70">%</span>
          <span className="text-[14px] font-medium text-muted-foreground">
            de proteína
          </span>
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Según las tablas de referencia NRC para alimentación animal.
        </p>
      </div>

      {/* La comparación. Los huecos se llenan si hay modelo entrenado
          detrás; si no, siguen en "por confirmar". */}
      <p className="mt-8 text-[15px] font-semibold text-foreground/85">
        Las tres comidas que estamos comparando
      </p>

      <ul className="mt-3 flex flex-col gap-3">
        {DIETS.map((diet) => {
          const p =
            prediccion.estado === "listo"
              ? prediccion.resultados.find((r) => r.tipo_dieta === diet.id)
              : undefined;

          return (
            <li key={diet.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[17px] font-bold">{diet.name}</p>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[12px] font-bold tabular-nums text-muted-foreground">
                  {diet.id}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/85">
                {diet.composition}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                <span className="text-[13px] font-medium text-muted-foreground">
                  Proteína que daría la harina
                </span>
                {p ? (
                  <span className="text-[15px] font-bold tabular-nums text-primary">
                    {p.proteina_harina} %
                    <span className="ml-1 font-medium text-muted-foreground">
                      ± {p.margen_proteina}
                    </span>
                  </span>
                ) : (
                  <span className="text-[15px] font-bold text-muted-foreground">
                    {prediccion.estado === "cargando"
                      ? "Calculando…"
                      : "Por confirmar"}
                  </span>
                )}
              </div>

              {p?.tasa_supervivencia != null && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-muted-foreground">
                    Grillos que llegarían vivos
                  </span>
                  <span className="text-[14px] font-semibold tabular-nums text-foreground/85">
                    {p.tasa_supervivencia} %
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        {HYDRATION_NOTE}
      </p>

      {/* Un modelo entrenado con datos inventados no puede presentarse como
          si no lo fuera, por muy bien que se vean los números. */}
      {prediccion.estado === "listo" && prediccion.modelo.datos_simulados && (
        <div className="mt-6 rounded-2xl border-2 border-demo-border bg-demo-bg p-4">
          <p className="text-[14px] font-bold text-demo-foreground">
            Estos números son de prueba
          </p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-demo-foreground">
            Salen de un modelo entrenado con datos simulados, mientras llegan
            los análisis de laboratorio. Sirven para comprobar que el sistema
            funciona; no para decidir qué darles de comer a sus grillos.
          </p>
        </div>
      )}

      {/* Por qué no hay números todavía */}
      {prediccion.estado !== "listo" && (
      <div className="mt-6 rounded-2xl border border-demo-border bg-demo-bg p-4">
        <p className="text-[14px] font-bold text-demo-foreground">
          ¿Por qué todavía no le decimos cuál es la mejor?
        </p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-demo-foreground">
          Los grillos de nuestros ensayos siguen creciendo. Cuando se
          cosechen, el laboratorio mide cuánta proteína quedó en la harina de
          cada comida. Con esos números el sistema aprende y aquí mismo le
          diremos cuál se acerca más a lo que su{" "}
          {animalName.toLowerCase()} necesita.
        </p>
      </div>
      )}

      <p className="mt-4 text-[13px] text-muted-foreground">
        Guardado en Mis consultas.
      </p>

      {/* La accion hacia adelante la pone el armazon de la parada. Aqui solo
          queda el reinicio, que no es avanzar sino volver a empezar, y por eso
          va como texto y no como boton. */}
      <button
        type="button"
        onClick={onNueva}
        className="mt-2 flex min-h-14 w-full items-center justify-center text-[15px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Hacer una consulta para otro animal
      </button>
    </section>
  );
}
