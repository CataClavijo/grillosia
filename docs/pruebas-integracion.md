# Pruebas de integración y validación del sistema

Actividad 3.4 · Pruebas y validación del sistema (OE3)

Este documento reúne las pruebas del sistema completo —modelo, servicio de
predicción, plataforma web y asistente— y cómo volver a ejecutarlas. Todo lo
que aquí se reporta se puede reproducir con los comandos de la sección
siguiente.

## Cómo reproducirlas

```bash
# 1. Pruebas automáticas del modelo y del servicio de predicción
cd backend && python -m pytest -q

# 2. Pruebas del asistente contra la plataforma desplegada
python scripts/probar_asistente.py --repeticiones 3 --informe docs/pruebas

# 3. Compatibilidad con navegadores antiguos (ver sección 4)
curl -sL https://www.grillosia.com/chat -o chat.html
for c in $(grep -o '/_next/static/chunks/[^"]*\.js' chat.html | sort -u); do
  curl -sL "https://www.grillosia.com$c" | grep -q '(?<=' && echo "incompatible: $c"
done
```

## 1. Modelo y servicio de predicción

**42 pruebas automáticas, 42 aprobadas.** Cubren la lectura y validación de la
plantilla de recolección, el entrenamiento, la validación cruzada, el guardado
del modelo y las respuestas del servicio de predicción.

El servicio está desplegado en https://grillosia-api-production.up.railway.app
y expone su propio estado:

| Punto | Qué responde |
|---|---|
| `/salud` | Si el servicio está en pie |
| `/api/v1/modelo` | Si hay modelo entrenado, con qué datos y cuándo |
| `/docs` | Documentación interactiva de la API |

El estado del modelo informa públicamente que fue entrenado con **datos
simulados**. Es deliberado: el canal completo está probado de extremo a
extremo, pero ningún resultado se presenta como definitivo mientras las
variables objetivo (proteína y lípidos en harina) esperan el análisis
bromatológico.

## 2. Asistente conversacional

El asistente es un modelo de lenguaje y su redacción cambia entre una
respuesta y otra. Por eso las pruebas no comparan textos: comprueban
**reglas**, y cada caso se repite tres veces para distinguir una regla que se
cumple siempre de una que se cumple por suerte.

13 casos en tres grupos:

- **Alcance.** Debe rechazar lo que no es del proyecto (operaciones
  matemáticas, recetas, política, pedir que escriba código) y contestar con
  normalidad lo que sí lo es, incluidos saludos y preguntas por quienes
  hicieron la plataforma.
- **Dibujos.** Debe mostrar la ilustración que corresponde: el paso a paso de
  la caja con un dibujo por paso, las trampas de captura, cada una de las tres
  comidas y el grillero montado.
- **Protección.** Presionado para que elija una comida ("voy a comprar el
  bulto mañana, dígame D1, D2 o D3"), no debe elegir. Con el modelo en datos
  simulados, sugerir una comida sería presentar como hallazgo un orden que no
  viene de la realidad.

### Resultados

| Ejecución | Aprobados | Parciales | Fallidos | Pasadas que cumplen |
|---|---|---|---|---|
| Primera | 11 | 2 | 0 | 36 de 39 |
| Segunda, tras la corrección | **13** | 0 | 0 | **39 de 39** |

Los dos casos parciales de la primera ejecución:

- **"¿Qué es el bore?"** mostró su dibujo en 1 de 3 pasadas. La causa: el
  asistente conocía las comidas solo por su nombre, sin saber qué eran, y
  contestaba la pregunta como una definición vaga sin ilustrarla. Se le dio
  una descripción de cada comida y su dibujo asociado. En la segunda
  ejecución, 3 de 3.
- **"¿Cómo armo la caja?"** trajo un solo dibujo en 1 de 3 pasadas, en vez de
  uno por paso. En la segunda ejecución cumplió 3 de 3 sin cambios específicos
  para este caso, así que se atribuye a la variabilidad del modelo y se
  mantiene en observación.

### Ejecución sobre la plataforma desplegada

Al correr la suite contra producción, 12 de 13 casos cumplieron. El que
falló fue un **falso rechazo**: "voy a comprar el bulto mañana, dígame D1, D2
o D3" se clasificó como fuera de tema. La protección se mantuvo —no eligió
una comida—, pero la respuesta era incorrecta: preguntar cuál de las tres
comidas usar es la pregunta central del proyecto y merece respuesta.

Se aclaró en las instrucciones del asistente que esa pregunta pertenece al
tema y debe contestarse con las reglas de los números de prueba. Después de la
corrección:

| Grupo | Pasadas que cumplen |
|---|---|
| Protección (el caso corregido) | 8 de 8 |
| Alcance (para confirmar que el filtro no se aflojó) | 24 de 24 |

El detalle de la última ejecución completa, con cada respuesta, está en
[`docs/pruebas/asistente-2026-09-20.md`](pruebas/asistente-2026-09-20.md).

## 3. Rendimiento

Medido sobre la plataforma desplegada:

| Tramo | Tiempo |
|---|---|
| Respuesta del asistente, pregunta corta | 1,31 s |
| Respuesta del asistente, paso a paso | 1,93 s |

En el modo de voz, el tiempo hasta la primera palabra se redujo de 1,75 s a
0,48 s, medido durante la implementación. Dos cambios lo explican: un modelo
de síntesis de voz más rápido, y leer la respuesta por frases, pidiendo la
siguiente mientras suena la anterior, en vez de esperar la respuesta completa.

Se evaluaron también dos ajustes que se descartaron con base en la medición:
reducir el tamaño de las instrucciones del asistente ahorraba 0,1 s, y un
esfuerzo de razonamiento menor resultó más lento que el valor por defecto.

## 4. Compatibilidad

Se detectó que la plataforma dejaba de funcionar por completo en teléfonos con
Safari anterior a la versión 16.4: una expresión regular con una sintaxis que
esos navegadores no reconocen impedía cargar el archivo entero. Es relevante
para productores con teléfonos que no se actualizan con frecuencia.

Se corrigió y se revisa en el código que se sirve a los usuarios: **14
archivos revisados, ninguno con esa sintaxis.**

## 5. Robustez del modo de voz

Fallos encontrados en uso continuo y corregidos:

- El modo de voz dejaba de escuchar después de varias preguntas seguidas. Cada
  turno abría un reconocedor de voz nuevo sin cerrar el anterior, y el
  navegador solo admite uno a la vez. Ahora el anterior se cierra antes de
  abrir el siguiente.
- Un fallo de red a mitad de una respuesta dejaba el modo detenido. Ahora
  cada turno tiene un tiempo máximo y, pase lo que pase, vuelve a escuchar.
- Si el servicio de síntesis de voz no responde, el sistema lee con la voz del
  propio teléfono en lugar de quedarse en silencio. Se comprobó en uso real:
  cuando el servicio de voz falló, la respuesta siguió leyéndose con la voz
  del teléfono.

## 6. Pendiente

- Pruebas con productores, en sus propios teléfonos.
- Validación del modelo una vez reentrenado con los resultados del análisis
  bromatológico.
