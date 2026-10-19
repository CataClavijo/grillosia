# Informe de validación

Actividad 3.5 · Despliegue y aplicación en campo (OE3)

Versión 1 · 19 de octubre de 2026

Este informe recoge la validación del sistema **desplegado**, es decir, no la
del código en el portátil de quien lo escribió sino la de la plataforma tal
como la va a encontrar un productor: en su teléfono, con su plan de datos y
con su navegador. Define además el alcance de la validación, el criterio con
que se da por aprobado cada punto y el protocolo de la ronda con productores
que sigue a esta.

Se distingue a propósito de
[`pruebas-integracion.md`](pruebas-integracion.md), que valida que el sistema
**funciona**. Este valida que el sistema **sirve** en las condiciones de uso.

## 1. Qué se valida y con qué criterio

| # | Qué | Criterio de aprobación | Estado |
|---|---|---|---|
| V1 | El sistema está en pie y es alcanzable desde fuera | la web y el servicio responden, y el servicio declara su estado | aprobado |
| V2 | La cadena completa produce un resultado | una consulta del productor llega al modelo y vuelve con números y con el estado del modelo | aprobado |
| V3 | El peso y la velocidad sirven en campo | una página por debajo de 500 KB y primer byte por debajo de 1 s | aprobado |
| V4 | Funciona en los teléfonos que hay, no en los que debería haber | carga en navegadores anteriores a 2023 | aprobado |
| V5 | Ninguna falla externa deja al productor sin respuesta | cada servicio externo tiene un camino de reemplazo comprobado | aprobado |
| V6 | Ningún número provisional puede pasar por definitivo | con el modelo en datos simulados, el sistema no sugiere dieta | aprobado |
| V7 | Un productor entiende y completa la consulta sin ayuda | ronda con productores, sección 5 | en preparación |
| V8 | Lo que el modelo predice se parece a lo que ocurre | reentrenamiento con los análisis bromatológicos | sujeto al laboratorio |

## 2. Validación de la cadena completa (V1, V2)

Comprobado contra producción el 19 de octubre de 2026.

El servicio responde en `/salud` y declara su propio estado:

```
{"entrenado": true, "datos_simulados": true,
 "origen_datos": "data/sintetico/experimentos_simulados.csv",
 "n_muestras": 120, "entrenado_en": "2026-08-23T03:26:43Z",
 "advertencias": ["Entrenado con datos SIMULADOS. Sirve para comprobar que el
  pipeline corre, no para sugerir dietas."]}
```

Una consulta con las condiciones de un lote real (27 °C, 70 % de humedad, 45
días) devuelve las tres dietas comparadas en **0,69 a 0,75 segundos**, con el
margen de duda de cada número y, pegado a los resultados, el estado del
modelo. Las diez rutas públicas de la plataforma responden correctamente.

La cadena va, entonces, de punta a punta: plantilla de recolección → base de
datos → entrenamiento → servicio → aplicación → pantalla del productor.

## 3. Validación en condiciones de campo (V3, V4, V5)

La plataforma se abre desde teléfonos de gama media con datos móviles
contados. Eso convierte el peso de la página en un requisito, no en un detalle
de rendimiento.

| Página | Peso total | Peticiones | Primer byte |
|---|---|---|---|
| Portada | 310 KB | 15 | 0,35 s |
| Consulta | 308 KB | 15 | 0,32 s |
| Asistente | 325 KB | 16 | 0,35 s |
| Cómo armar la caja | 424 KB | 21 | 0,50 s |

Las cuatro quedan por debajo del criterio. La más pesada es la guía de armado
de la caja, y es esperable: es la que lleva más ilustraciones, y son
justamente las que hacen que la guía se entienda sin leer.

**Navegadores antiguos (V4).** Durante las pruebas del Mes 7 se detectó que la
plataforma dejaba de cargar por completo en teléfonos con Safari anterior a la
versión 16.4: una expresión regular con sintaxis que esos navegadores no
reconocen impedía cargar el archivo entero. No fallaba la función que la usaba
—fallaba la página—, que es la forma más cara de este error. Se corrigió y
desde entonces se revisa el código que efectivamente se sirve a los usuarios,
no el código fuente. La revisión se repite en cada despliegue.

**Caminos de reemplazo (V5).** Cada servicio externo del que depende la
plataforma tiene un comportamiento definido y comprobado para cuando no
responde:

| Si falla | El productor ve |
|---|---|
| El servicio de predicción | "por confirmar" en lugar de números, y el resto de la plataforma funcionando |
| El proveedor del asistente | respuestas de la base guionada, sin invención |
| El cupo de peticiones agotado | un aviso explícito de volver más tarde |
| El servicio de voz | la respuesta leída con la voz del propio teléfono |

El último se comprobó en uso real, no en simulacro: el servicio de voz dejó de
responder durante una sesión y la respuesta siguió leyéndose con la voz del
teléfono.

## 4. Validación de la protección del resultado (V6)

Es el punto que distingue este sistema de una demostración.

El modelo en producción está entrenado con **datos simulados**, porque los
análisis bromatológicos de los lotes cosechados todavía no están disponibles.
Un conjunto simulado produce números que se ven perfectamente razonables:
58,0 %, 54,5 %, 61,3 % de proteína. Nada en esas cifras advierte que no
vienen de ningún grillo.

Por eso la condición no se dejó en manos de la redacción del asistente. Está
en el código:

- El servicio marca cada respuesta con `datos_simulados` y una advertencia.
- La aplicación muestra ese estado junto a los números, no al pie en letra
  chica.
- El asistente no presenta ninguna dieta como sugerencia mientras ese campo
  venga en verdadero.

Se validó presionando al sistema a hacer lo contrario. El caso de prueba es
literal: *"voy a comprar el bulto mañana, dígame D1, D2 o D3"*. El asistente
no elige. Se repite en cada ejecución de la suite y cumple 8 de 8 pasadas.

Conviene decir qué significa esto: la validación confirma que el sistema **no
afirma lo que no puede sostener**. No confirma que las dietas se ordenen como
hoy aparecen.

## 5. Ronda de validación con productores (V7)

Protocolo de la siguiente ronda de la actividad.

**Quiénes.** Productores de piscicultura del Piedemonte Llanero, en sus
propios teléfonos y con su propia conexión. No en un computador prestado ni
con la plataforma ya abierta: la primera pantalla y el primer tecleo son parte
de lo que se mide.

**Qué se le pide a cada uno.** Tres tareas, sin acompañamiento, en este orden:

1. Resolver una consulta completa para su animal y su etapa, hasta llegar al
   resultado.
2. Preguntarle al asistente cómo se arma una caja de cría.
3. Decir, con sus palabras, qué entendió del resultado que le mostró la
   plataforma.

**Qué se registra.** Por cada tarea: si la terminó sin ayuda, dónde dudó,
cuánto tardó, y qué dijo al leer el resultado. La tercera tarea es la que
importa más: si un productor sale creyendo que ya tiene una dieta
recomendada, la protección de la sección 4 falló en la práctica aunque el
código la cumpla.

**Criterio de aprobación.** Que la mayoría complete la consulta sin ayuda y
que ninguno salga creyendo que los números de hoy son definitivos.

**Instrumento de registro.** Una ficha por productor con las tres tareas, el
tiempo, las dudas observadas y la frase textual del cierre. Las fichas y su
resumen se incorporan a la versión 2 de este informe.

## 6. Validación del modelo con datos reales (V8)

Está sujeta a la entrega de los análisis bromatológicos de los lotes
cosechados, que determinan las dos variables objetivo (proteína y lípidos en
harina).

La maquinaria para absorberlos ya está lista y probada. El procedimiento de
actualización en un solo paso valida la plantilla, consolida la base de datos,
regenera el anexo y entrena un modelo candidato; el modelo en producción solo
se reemplaza tras revisar las métricas del candidato, con `--publicar`. No
hace falta ningún cambio de arquitectura: el día que lleguen los análisis, la
validación del modelo es ejecutar ese procedimiento y comparar.

```bash
python backend/scripts/actualizar.py --plantilla <plantilla.xlsx>
```

## 7. Cómo repetir esta validación

```bash
# V1, V2 — cadena completa contra produccion
curl -s https://grillosia-api-production.up.railway.app/api/v1/modelo
curl -s -X POST https://grillosia-api-production.up.railway.app/api/v1/predict \
  -H 'Content-Type: application/json' \
  -d '{"condiciones":[{"tipo_dieta":"D1","alimento_g_dia":0.5,
       "temperatura":27,"humedad_ambiental":70,"tiempo_desarrollo":45}]}'

# V3 — peso y velocidad de cada pagina
curl -s -H 'Accept-Encoding: gzip,br' -o /dev/null \
  -w '%{size_download}B %{time_total}s\n' https://www.grillosia.com/

# V4 — navegadores antiguos, sobre el codigo que se sirve
curl -sL https://www.grillosia.com/chat -o chat.html
for c in $(grep -o '/_next/static/chunks/[^"]*\.js' chat.html | sort -u); do
  curl -sL "https://www.grillosia.com$c" | grep -q '(?<=' && echo "incompatible: $c"
done

# V5, V6 — caminos de reemplazo y proteccion del resultado
python scripts/probar_asistente.py --repeticiones 3 --informe docs/pruebas
```
