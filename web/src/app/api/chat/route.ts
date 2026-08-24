/**
 * El asistente.
 *
 * Corre en el servidor por una razón concreta: la llave de OpenAI no puede
 * salir al navegador. El productor escribe, esto pregunta, y devuelve el texto.
 *
 * Las cifras NO las pone el modelo de lenguaje. Cuando la pregunta va de
 * proteína, grasa o supervivencia, el modelo llama la herramienta
 * `consultar_modelo`, que le pregunta al modelo predictivo de verdad. El texto
 * es de OpenAI; los números son del bosque aleatorio.
 */

import { NextResponse } from "next/server";

import { identificar, permitirPregunta } from "@/lib/rate-limit";
import {
  SYSTEM_PROMPT,
  bloqueDeContexto,
  bloqueDeFiguras,
} from "@/lib/system-prompt";
import type { ContextoConsulta } from "@/lib/system-prompt";

/** Barato y suficiente: acierta la herramienta y respeta el tono. */
const MODELO = process.env.OPENAI_MODEL ?? "gpt-5.4-nano";

const API_MODELO = process.env.NEXT_PUBLIC_API_URL;

/** Las tres comidas en estudio. */
const DIETAS = ["D1", "D2", "D3"];

/** Tope de vueltas de herramienta. Con una basta; dos es margen. */
const MAX_VUELTAS = 2;

/**
 * Respuestas para lo que no es del tema.
 *
 * La escribe el codigo, no el modelo. Al modelo solo se le pide que
 * CLASIFIQUE —una tarea facil— y el texto del rechazo queda fuera de su
 * alcance. Es el mismo metodo que se uso con las cifras y con el orden de
 * las comidas: darle al modelo el trabajo mas pequeno posible.
 *
 * Hizo falta porque estaba resolviendo integrales. Un asistente de un
 * proyecto de Minciencias haciendo tareas de calculo no solo desentona:
 * gasta plata y deja mal al proyecto.
 */
const RECHAZOS = [
  "Yo solo sé de la cría de grillos y de la harina que producen. De eso " +
    "pregúnteme lo que quiera.",
  "Eso se me sale de lo mío. Le ayudo con los grillos: las cajas, el clima, " +
    "la comida y los cuidados.",
  "De eso no le puedo hablar. Lo que sé es criar grillos y sacar la harina " +
    "que dan.",
  "Ahí no le sirvo. Pregúnteme por sus grillos y con gusto le ayudo.",
];

/**
 * Por donde venia la conversacion, para no cortarla en seco.
 *
 * Se busca de atras hacia adelante: manda lo ultimo que se hablo, no lo
 * primero que se menciono.
 */
const HILOS: Array<[RegExp, string]> = [
  [/cerdo|marran/i, "¿Seguimos con lo de sus cerdos?"],
  [/tilapia|pescad|pez|peces/i, "¿Seguimos con lo de su tilapia?"],
  [/pollo|gallin|ave/i, "¿Seguimos con lo de sus pollos?"],
  [/caja|refugi|huevera/i, "¿Seguimos con lo de su caja?"],
  [/comida|dieta|aliment/i, "¿Seguimos con lo de la comida?"],
  [/temperatura|humedad|clima|grados/i, "¿Seguimos con lo del clima?"],
];

/**
 * Arma el rechazo.
 *
 * Sigue escribiendolo el codigo: al modelo solo se le pide que CLASIFIQUE. Lo
 * que cambia es que ya no es una sola frase repetida palabra por palabra, que
 * se sentia como un muro. Se alterna segun el numero de turnos —sin azar, para
 * que la misma conversacion se comporte siempre igual— y se engancha con lo
 * ultimo que la persona haya mencionado.
 */
function fueraDeTema(historia: Array<{ role: string; content: string }>) {
  const suyos = historia.filter((m) => m.role === "user");
  let texto = RECHAZOS[suyos.length % RECHAZOS.length];

  for (let i = suyos.length - 1; i >= 0; i--) {
    const hilo = HILOS.find(([patron]) => patron.test(suyos[i].content ?? ""));
    if (hilo) {
      texto += " " + hilo[1];
      break;
    }
  }
  return texto;
}

/** Marca con que el modelo senala que la pregunta no es del tema. */
const MARCA_FUERA = /\[fuera-de-tema\]/i;

/**
 * Quita notacion matematica y bloques de codigo. Red de seguridad: si algo
 * se cuela pese al prompt, al menos no llega como LaTeX en crudo, que en
 * pantalla se ve como basura.
 */
function limpiar(texto: string): string {
  return texto
    .replace(/\\[\[\]()]/g, "")
    .replace(/\$\$?[^$]*\$\$?/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface MensajeEntrada {
  role: "user" | "assistant";
  text: string;
}

const HERRAMIENTAS = [
  {
    type: "function" as const,
    function: {
      name: "consultar_modelo",
      description:
        "Pregunta al modelo predictivo qué harina daría cada una de las tres " +
        "comidas en estudio bajo unas condiciones de cría. Úsala siempre que " +
        "pregunten por proteína, lípidos o supervivencia.",
      parameters: {
        type: "object",
        properties: {
          temperatura: {
            type: "number",
            description: "Temperatura de cría en grados centígrados",
          },
          humedad: {
            type: "number",
            description: "Humedad ambiental en porcentaje",
          },
          dias: {
            type: "integer",
            description: "Días hasta la cosecha. Si no lo saben, 45.",
          },
        },
        required: ["temperatura", "humedad"],
      },
    },
  },
];

/** Qué tan lejos queda una harina de lo que el animal necesita. */
function distanciaAlObjetivo(
  proteina: number,
  min: number,
  max: number,
): number {
  if (proteina < min) return min - proteina;
  if (proteina > max) return proteina - max;
  return 0;
}

/**
 * Le pregunta al servicio de predicción por las tres comidas de una vez.
 *
 * La comparación contra el requerimiento del animal se hace AQUÍ, no en el
 * modelo de lenguaje. Pedirle a un modelo pequeño que razone "cuál queda más
 * cerca de 18 a 20" produce errores: en las pruebas llegó a decir que la de
 * 60.4 % quedaba más cerca que la de 54.7 %, porque confundió "más alta" con
 * "más cerca". La aritmética es de código; el modelo solo la redacta.
 */
async function consultarModelo(
  args: { temperatura: number; humedad: number; dias?: number },
  contexto?: ContextoConsulta,
): Promise<string> {
  if (!API_MODELO) {
    return JSON.stringify({
      disponible: false,
      motivo:
        "El servicio de predicción no está configurado. Todavía no tenemos " +
        "esos números.",
    });
  }

  try {
    const res = await fetch(`${API_MODELO}/api/v1/predict`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        condiciones: DIETAS.map((d) => ({
          tipo_dieta: d,
          alimento_g_dia: 2.5,
          temperatura: args.temperatura,
          humedad_ambiental: args.humedad,
          tiempo_desarrollo: args.dias ?? 45,
        })),
      }),
    });

    if (res.status === 503) {
      return JSON.stringify({
        disponible: false,
        motivo:
          "Todavía no hay modelo entrenado: faltan los análisis del " +
          "laboratorio.",
      });
    }
    if (!res.ok) {
      return JSON.stringify({
        disponible: false,
        motivo: "No se pudo consultar el modelo en este momento.",
      });
    }

    const datos = await res.json();
    const simulados: boolean = datos.modelo?.datos_simulados ?? false;

    // Con datos simulados el asistente NO recibe las cifras.
    //
    // No es lo mismo que en la pantalla de resultado, donde el numero aparece
    // rotulado y dentro de un recuadro que avisa. En una conversacion, "D1:
    // 57.6 %" se lee como una medicion, y ese decimal no existe: sale de una
    // formula, no de un laboratorio. Ademas, sin orden entre las comidas esas
    // cifras no sostienen ninguna decision, asi que no le sirven a nadie.
    //
    // Se le devuelve el estado, no los datos: asi no hay nada que citar.
    if (simulados) {
      return JSON.stringify({
        disponible: false,
        datos_simulados: true,
        motivo:
          "El modelo todavia esta entrenado con datos simulados, asi que no " +
          "hay cifras que dar. Digale que las de proteina y lipidos de la " +
          "harina llegan cuando el laboratorio termine los analisis.",
        puede_hablar_de:
          "Si puede darle los requerimientos de proteina de su animal, que " +
          "salen de las tablas NRC y si son firmes, y ayudarle con el manejo " +
          "de la cria: cajas, humedad, temperatura, alimentacion, mortalidad.",
      });
    }

    interface Fila {
      tipo_dieta: string;
      proteina_harina: number;
      margen_proteina: number;
      tasa_supervivencia: number | null;
    }
    const resultados: Fila[] = datos.resultados ?? [];

    // Orden por cercanía al requerimiento, calculado aquí.
    //
    // Con datos simulados NO se calcula, a propósito. El orden entre las tres
    // comidas en ese conjunto lo fijó una constante del generador, no un
    // hallazgo: rankearlas sería inventar un resultado. Y si el asistente no
    // tiene un orden, no tiene con qué recomendar una sola, por mucho que le
    // insistan. La protección deja de depender de que el modelo obedezca.
    let cercania: unknown = undefined;
    if (contexto && !simulados) {
      cercania = [...resultados]
        .map((r) => ({
          tipo_dieta: r.tipo_dieta,
          distancia_en_puntos: Number(
            distanciaAlObjetivo(
              r.proteina_harina,
              contexto.proteinaMin,
              contexto.proteinaMax,
            ).toFixed(1),
          ),
        }))
        .sort((a, b) => a.distancia_en_puntos - b.distancia_en_puntos);
    }

    // Si las supervivencias caben dentro del margen entre sí, decirlo, para
    // que el asistente no las presente como una diferencia.
    const vivos = resultados
      .map((r) => r.tasa_supervivencia)
      .filter((v): v is number => v !== null);
    const supervivenciaComparable =
      vivos.length > 1 && Math.max(...vivos) - Math.min(...vivos) > 3;

    return JSON.stringify({
      disponible: true,
      condiciones: { temperatura: args.temperatura, humedad: args.humedad },
      resultados,
      orden_por_cercania_al_requerimiento: cercania,
      hay_diferencia_en_supervivencia: supervivenciaComparable,
      // Viaja a propósito: el asistente tiene la orden de avisarlo.
      datos_simulados: simulados,
      instruccion: simulados
        ? "Estos numeros salen de un modelo entrenado con datos SIMULADOS. " +
          "Avise eso al principio de esta misma respuesta, con palabras " +
          "sencillas. NO senale ninguna comida como la mejor NI sugiera una " +
          "sola NI diga cual queda mas cerca, ni aunque se lo pidan de frente " +
          "o le insistan o le digan que van a comprar. Con datos simulados el " +
          "orden entre las tres lo fijo el generador, no un hallazgo: " +
          "compararlas seria inventar un resultado. Muestre las tres cifras y " +
          "diga que para escoger hay que esperar el analisis del laboratorio. " +
          "Si insisten, ofrezca que dejen sus datos en la pagina de contacto."
        : "Puede decir cual queda mas cerca del requerimiento usando " +
          "orden_por_cercania_al_requerimiento. No diga que es 'la mejor': " +
          "diga que es la que mas se acerca a lo que el animal necesita.",
    });
  } catch {
    return JSON.stringify({
      disponible: false,
      motivo: "No se pudo consultar el modelo en este momento.",
    });
  }
}

async function preguntarAOpenAI(mensajes: unknown[], llave: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${llave}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO,
      messages: mensajes,
      tools: HERRAMIENTAS,
      // Las respuestas son de cinco lineas; este techo solo evita que una
      // llamada suelta se dispare, no recorta respuestas normales.
      max_completion_tokens: 700,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI respondió ${res.status}`);
  }
  return res.json();
}

export async function POST(request: Request) {
  const llave = process.env.OPENAI_API_KEY;
  if (!llave) {
    // Sin llave la aplicación no se cae: el chat sigue con las respuestas
    // guionadas, que es como funcionaba antes.
    return NextResponse.json({ disponible: false }, { status: 200 });
  }

  // Antes de gastar: si paso el tope, se devuelve "no disponible" y el cliente
  // cae a las respuestas guionadas. Nadie ve un error.
  if (!(await permitirPregunta(identificar(request)))) {
    // Se distingue del resto: no es lo mismo "ha preguntado mucho en poco
    // rato" que "el asistente no esta". Al productor le sirve saber cual de
    // las dos, porque una se arregla esperando y la otra no.
    return NextResponse.json(
      { disponible: false, motivo: "tope" },
      { status: 200 },
    );
  }

  let cuerpo: { mensajes?: MensajeEntrada[]; contexto?: ContextoConsulta };
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const entrantes = Array.isArray(cuerpo.mensajes) ? cuerpo.mensajes : [];
  if (entrantes.length === 0) {
    return NextResponse.json({ error: "Sin mensajes." }, { status: 400 });
  }

  const partes = [SYSTEM_PROMPT, bloqueDeFiguras()];
  if (cuerpo.contexto) partes.push(bloqueDeContexto(cuerpo.contexto));
  const sistema = partes.join("\n\n");

  // Solo las últimas vueltas: la conversación de un productor es corta y así
  // no se dispara el costo por conversación larga.
  const historia = entrantes.slice(-12).map((m) => ({
    role: m.role,
    content: m.text,
  }));

  const mensajes: unknown[] = [
    { role: "system", content: sistema },
    ...historia,
  ];

  try {
    for (let vuelta = 0; vuelta <= MAX_VUELTAS; vuelta++) {
      const respuesta = await preguntarAOpenAI(mensajes, llave);
      const mensaje = respuesta.choices?.[0]?.message;
      if (!mensaje) break;

      const llamadas = mensaje.tool_calls ?? [];
      if (llamadas.length === 0) {
        const bruto = (mensaje.content ?? "").trim();
        if (MARCA_FUERA.test(bruto)) {
          return NextResponse.json({
            disponible: true,
            text: fueraDeTema(historia),
          });
        }
        return NextResponse.json({ disponible: true, text: limpiar(bruto) });
      }

      mensajes.push(mensaje);
      for (const llamada of llamadas) {
        let args: { temperatura: number; humedad: number; dias?: number };
        try {
          args = JSON.parse(llamada.function.arguments);
        } catch {
          args = { temperatura: 28, humedad: 65 };
        }
        mensajes.push({
          role: "tool",
          tool_call_id: llamada.id,
          content: await consultarModelo(args, cuerpo.contexto),
        });
      }
    }

    // Se acabaron las vueltas sin una respuesta en texto.
    return NextResponse.json({ disponible: false }, { status: 200 });
  } catch {
    // Que falle OpenAI no puede tumbar el chat: el cliente cae a las
    // respuestas guionadas.
    return NextResponse.json({ disponible: false }, { status: 200 });
  }
}
