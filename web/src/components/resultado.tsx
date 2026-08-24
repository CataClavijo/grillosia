"use client";

import { DIETS, HYDRATION_NOTE } from "@/lib/animals";
import { Analizando } from "@/components/analizando";
import { usePrediccion } from "@/lib/prediccion";

/**
 * La parada 4: el resultado.
 *
 * Se reescribio porque no respondia la pregunta. El productor llega aqui
 * despues de contestar cuatro preguntas sobre su animal, y recibia tres
 * tarjetas de cifras sin ninguna conclusion, con la composicion repetida tres
 * veces —el 20 % es identico en las tres— y midiendo mas de tres mil pixeles.
 *
 * Ahora: lo que su animal necesita primero, las tres comidas en una tabla
 * corta, y una sola linea de lectura. Lo comun se dice una vez.
 *
 * El aviso de datos de prueba va en una linea, no en un recuadro. Tiene que
 * estar —presentar cifras simuladas como firmes seria el peor error posible—
 * pero un cartel del tamano de media pantalla tampoco ayuda a entender.
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
  const listo = prediccion.estado === "listo";
  const simulado = listo && prediccion.modelo.datos_simulados;

  const filas = DIETS.map((d) => ({
    ...d,
    p: listo
      ? prediccion.resultados.find((r) => r.tipo_dieta === d.id)
      : undefined,
  }));

  // ¿Las supervivencias se diferencian de verdad, o caben dentro del margen?
  const vivos = filas
    .map((f) => f.p?.tasa_supervivencia)
    .filter((v): v is number => v != null);
  const mismaSupervivencia =
    vivos.length > 1 && Math.max(...vivos) - Math.min(...vivos) <= 3;

  return (
    <section className="pt-2">
      <p className="rotulo text-muted-foreground">
        {animalName} · {stageName} · {temp} °C · {humidity} %{" "}
        <button
          type="button"
          onClick={onCambiar}
          className="underline underline-offset-2 hover:text-foreground"
        >
          cambiar
        </button>
      </p>

      {/* Lo firme va primero: sale de las tablas NRC, no del modelo. */}
      <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
        <p className="text-[14.5px] leading-snug text-foreground/85">
          Su {animalName.toLowerCase()} en {stageName.toLowerCase()} necesita
        </p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-[-0.035em] text-primary">
            {proteinMin}–{proteinMax}
          </span>
          <span className="font-display text-[1.1rem] font-bold text-primary/70">
            %
          </span>
          <span className="text-[14px] text-muted-foreground">de proteína</span>
        </p>
        <p className="rotulo mt-2 text-muted-foreground">Tablas NRC</p>
      </div>

      {prediccion.estado === "cargando" && (
        <Analizando etiqueta="El modelo está evaluando sus condiciones" />
      )}

      {/* La base comun se dice UNA vez, no tres. */}
      <p className="mt-6 text-[15px] leading-relaxed text-foreground/85">
        Las tres comidas llevan lo mismo en un 20 %: harina de choclo y avena en
        hojuelas. Lo que cambia es el 80 % principal.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {filas.map(({ id, name, main, p }) => (
          <li
            key={id}
            className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3"
          >
            <span className="flex-1">
              <span className="block font-display text-[16.5px] font-bold tracking-[-0.02em]">
                {name}
              </span>
              <span className="mt-0.5 block text-[13.5px] text-muted-foreground">
                {main} 80 %
              </span>
            </span>
            <span className="shrink-0 text-right">
              {p ? (
                <>
                  <span className="block font-display text-[1.35rem] font-extrabold leading-none tabular-nums tracking-[-0.03em] text-primary">
                    {p.proteina_harina} %
                  </span>
                  <span className="rotulo mt-1 block text-muted-foreground">
                    ± {p.margen_proteina}
                  </span>
                </>
              ) : (
                <span className="rotulo text-muted-foreground">
                  {prediccion.estado === "cargando"
                    ? "calculando"
                    : "por confirmar"}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        La cifra es la proteína que tendría la harina.
        {mismaSupervivencia &&
          " Entre las tres no hay diferencia apreciable en cuántos grillos llegan vivos."}
      </p>

      {/* Una linea, no un cartel. */}
      {simulado && (
        <p className="mt-4 border-l-2 border-demo-border pl-3 text-[13px] leading-snug text-muted-foreground">
          Cifras de prueba, mientras llega el análisis del laboratorio. Todavía
          no sirven para decidir.
        </p>
      )}

      {!listo && (
        <p className="mt-4 border-l-2 border-demo-border pl-3 text-[13px] leading-snug text-muted-foreground">
          Los grillos de los ensayos siguen creciendo. Cuando se cosechen, el
          laboratorio mide cuánta proteína quedó en la harina de cada comida.
        </p>
      )}

      <p className="mt-5 text-[13.5px] leading-relaxed text-muted-foreground">
        {HYDRATION_NOTE}
      </p>

      <button
        type="button"
        onClick={onNueva}
        className="mt-6 flex min-h-12 w-full items-center justify-center text-[14.5px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Hacer una consulta para otro animal
      </button>
    </section>
  );
}
