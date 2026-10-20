# Despliegue de la plataforma

Actividad 3.6 · Utilización de inteligencia artificial (OE3)

Este documento describe la plataforma tal como está desplegada y en uso: qué
pieza corre en dónde, cómo viaja una consulta desde el teléfono del productor
hasta el modelo y de vuelta, qué pasa cuando una pieza falla, y cómo se
levanta todo de nuevo desde cero.

| Pieza | Dónde corre | Dirección pública |
|---|---|---|
| Aplicación web | Vercel | https://www.grillosia.com |
| Servicio de predicción | Railway | https://grillosia-api-production.up.railway.app |
| Base de datos | PostgreSQL en Railway | interna, sin acceso público |

## 1. Cómo viaja una consulta

```
Teléfono del productor
      │  https://www.grillosia.com/consulta
      ▼
Aplicación web (Next.js en Vercel)
      │  POST /api/v1/predict   { condiciones: [D1, D2, D3] }
      ▼
Servicio de predicción (FastAPI en Railway)
      │  modelo.joblib — bosque aleatorio de salida múltiple
      ▼
      └─> { resultados: [...], modelo: { datos_simulados, n_muestras, ... } }
```

El productor responde cuatro preguntas (animal, etapa, temperatura, humedad) y
la aplicación consulta **las tres dietas de una sola vez**, en una petición.
Se resuelven juntas y no una por una porque el asistente pregunta siempre por
las tres con las mismas condiciones; hacerlo en tres llamadas triplicaría la
espera sin añadir información.

La respuesta nunca trae solo los números. Trae también el estado del modelo
que los produjo, y la aplicación está obligada a mostrarlo. Mientras
`datos_simulados` venga en verdadero, ninguna pantalla y ningún mensaje del
asistente presenta una dieta como sugerencia. Esa condición está escrita en el
código del sistema, no en las instrucciones del asistente.

## 2. El servicio de predicción

Se despliega desde la raíz del repositorio. Railway lee `requirements.txt` y
`runtime.txt` (Python 3.13) y arranca con el `Procfile`:

```
web: python backend/scripts/entrenar.py \
       --datos data/sintetico/experimentos_simulados.csv --simulados \
     && uvicorn main:app --host 0.0.0.0 --port $PORT --app-dir backend
```

**El modelo se entrena en cada despliegue, no se sube compilado.** Es una
decisión deliberada: así el modelo que está en producción es siempre el que
sale de los datos que están en el repositorio, y no un binario que alguien
generó en su portátil y cuyo origen ya nadie puede reconstruir. El
entrenamiento usa semilla fija, tarda unos segundos y deja el artefacto marcado
con el origen de sus datos.

### Puntos que expone

| Punto | Método | Qué hace |
|---|---|---|
| `/salud` | GET | Comprobación de vida para el proveedor |
| `/api/v1/modelo` | GET | Si hay modelo, con qué datos y cuándo se entrenó |
| `/api/v1/predict` | POST | Hasta 50 combinaciones de dieta y condiciones |
| `/docs` | GET | Documentación interactiva generada del contrato |

### Variables de entorno

| Variable | Para qué | Si falta |
|---|---|---|
| `PORT` | Puerto, lo inyecta Railway | el proveedor siempre lo pone |
| `GRILLOSIA_ALLOWED_ORIGINS` | Dominios que pueden llamar al servicio | se usan localhost y los dos dominios de grillosia.com |

No hay dominios escritos en el código. El permiso de origen cruzado se lee de
esa variable, y los métodos aceptados se limitan a GET y POST.

## 3. La aplicación web

Next.js 16 sobre React 19, desplegada en Vercel desde la carpeta `web/`. Diez
rutas públicas y siete rutas internas de servicio:

| Ruta | Para qué |
|---|---|
| `/` | Portada |
| `/consulta` | Las cuatro preguntas al productor |
| `/resultado` | Las tres dietas comparadas, con el aviso del estado del modelo |
| `/chat` | Asistente, por escrito y por voz |
| `/caja` | Cómo armar la caja de cría, paso a paso |
| `/grillos` | Guía visual de campo: qué grillo es, cómo se captura |
| `/proyecto` | Qué es el proyecto, quién lo hace y con qué financiación |
| `/consultas` | Consultas guardadas |
| `/entrar` | Inicio de sesión, solo si las cuentas están activadas |
| `/reset` | Limpia el almacenamiento del navegador |

Las rutas internas (`/api/chat`, `/api/voz`, `/api/consultas`, `/api/auth`)
corren en Vercel y guardan del lado del servidor las llaves de los servicios
externos, que así no llegan nunca al teléfono.

### Variables de entorno

Están documentadas una por una en `web/.env.example`. Las que cambian el
comportamiento del despliegue:

| Variable | Si falta |
|---|---|
| `NEXT_PUBLIC_API_URL` | el resultado muestra "por confirmar" en lugar de números |
| `OPENAI_API_KEY` | el asistente sigue respondiendo con su base guionada |
| `ELEVENLABS_API_KEY` | las respuestas se leen con la voz del propio teléfono |
| `NEXT_PUBLIC_ENABLE_AUTH` | en falso, las consultas se guardan solo en el dispositivo |
| `DATABASE_URL` | solo hace falta con las cuentas activadas |

## 4. Qué pasa cuando algo falla

La plataforma está hecha para seguir sirviendo aunque una pieza externa se
caiga. Ninguna caída deja al productor frente a una pantalla rota:

| Falla | Qué hace la plataforma |
|---|---|
| El servicio de predicción no responde | muestra "por confirmar" en lugar de números; el resto de la aplicación sigue |
| El proveedor del asistente no responde | el asistente contesta con su base guionada, sin inventar |
| Se agota el cupo de peticiones del asistente | lo dice con todas sus letras y pide volver más tarde |
| El servicio de voz no responde | lee con la voz del propio teléfono |
| El navegador es antiguo | la plataforma carga igual; se verifica en cada despliegue (sección 4 del informe de pruebas) |

El archivo `web/public/sw.js` merece mención aparte. Hoy es un **interruptor
de apagado**: no intercepta nada y borra las cachés que dejaron sus versiones
anteriores. Una versión anterior sí interceptaba la navegación y, cuando ni la
página ni la portada estaban en caché, dejaba el teléfono en "esta página no
se pudo cargar". Un service worker sin interceptor es equivalente a no tener
ninguno, y esa equivalencia es justamente lo que se quería.

## 5. Medidas del despliegue actual

Medido contra producción el 19 de octubre de 2026, desde una conexión
doméstica:

| Página | Peso total descargado | Peticiones | Primer byte |
|---|---|---|---|
| Portada | 310 KB | 15 | 0,35 s |
| Consulta | 308 KB | 15 | 0,32 s |
| Asistente | 325 KB | 16 | 0,35 s |
| Cómo armar la caja | 424 KB | 21 | 0,50 s |

| Punto del servicio | Tiempo |
|---|---|
| `/salud` | menos de 0,1 s |
| `/api/v1/predict`, las tres dietas en una petición | 0,69 s a 0,75 s |

El peso importa: la plataforma la abren productores con teléfonos de gama
media y datos móviles contados. Una página de 310 KB se carga con poco más de
un cuarto de megabyte de plan.

## 6. Levantar todo desde cero

```bash
# Servicio de predicción
pip install -r requirements.txt
python backend/scripts/entrenar.py \
  --datos data/sintetico/experimentos_simulados.csv --simulados
uvicorn main:app --app-dir backend --reload      # queda en :8000

# Aplicación web
cd web
pnpm install
cp .env.example .env.local                        # y completar lo que aplique
pnpm dev                                          # queda en :3000
```

Para desplegar no hay comando: ambos proveedores publican solo. Un empujón a
`main` dispara la construcción de la web en Vercel y la del servicio en
Railway. Para volver atrás se promueve el despliegue anterior desde el panel
del proveedor correspondiente; como el modelo se entrena en el arranque, un
despliegue anterior reconstruye también el modelo de ese momento.

## 7. Cómo comprobar que un despliegue quedó bien

```bash
curl -s https://grillosia-api-production.up.railway.app/salud
curl -s https://grillosia-api-production.up.railway.app/api/v1/modelo
curl -s -o /dev/null -w '%{http_code}\n' https://www.grillosia.com/
cd backend && python -m pytest -q
python scripts/probar_asistente.py --repeticiones 3
```

Lo que debe verse: el servicio en pie, el estado del modelo declarando con qué
datos fue entrenado, la web respondiendo 200, las 46 pruebas automáticas
aprobadas y los 13 casos del asistente cumpliendo.
