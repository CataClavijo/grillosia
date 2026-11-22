# Pipeline de integración del modelo con la plataforma

Actividad 3.4 · Pruebas y validación del sistema (OE3)

Versión 1 · 21 de noviembre de 2026

Este documento muestra, etapa por etapa, el camino que recorre un dato desde
que se anota en la plantilla de recolección hasta que el productor ve el
resultado en su teléfono. Para cada etapa dice qué entra, qué sale, en qué
archivo del repositorio está el código y cómo se comprueba que funciona.

Es el medio de verificación de la actividad 3.4: el módulo de integración
entre el modelo de inteligencia artificial y la plataforma. Las pruebas que lo
verifican están en el [informe de pruebas de integración](pruebas-integracion.md);
cómo está desplegado, en el [documento de despliegue](despliegue.md).

## 1. El pipeline completo

```
 1. Plantilla de recolección (Excel del laboratorio)
        │  backend/scripts/cargar_plantilla.py
        │  backend/scripts/recalcular_plantilla.py
        ▼
 2. Base de datos consolidada
        data/experimentos.csv  ·  entregables/base-datos-consolidada.xlsx
        │  backend/scripts/actualizar.py   (todo en un paso)
        ▼
 3. Entrenamiento del modelo
        │  backend/ml/features.py  ·  backend/ml/trainer.py
        ▼
        backend/ml/modelo.joblib  +  modelo.json (origen de los datos y métricas)
        │
        ▼
 4. Servicio de predicción  (FastAPI, Railway)
        │  backend/api/routes/predict.py
        │  GET /api/v1/modelo    POST /api/v1/predict
        ▼
 5. Plataforma web  (Next.js, Vercel)
        │  web/src/app/api/prediccion/route.ts   (consulta del productor)
        │  web/src/app/api/chat/route.ts         (herramienta del asistente)
        ▼
 6. Pantalla del productor
        web/src/app/resultado  ·  web/src/components/resultado.tsx
        web/src/components/asistente-flotante.tsx
```

Cada flecha es código del repositorio, no un paso manual. Entre la etapa 1 y
la 3 hay un solo comando; entre la 3 y la 6, cada despliegue.

## 2. Etapa por etapa

| # | Etapa | Entra | Sale | Código | Cómo se comprueba |
|---|---|---|---|---|---|
| 1 | Carga de la plantilla | Excel del laboratorio (registro, seguimiento cada 3 días, alimentación) | lotes validados y avisos de calidad | `backend/scripts/cargar_plantilla.py`, `recalcular_plantilla.py` | pruebas automáticas; recalcula las fórmulas del Excel desde las hojas de origen y avisa cuando no coinciden |
| 2 | Consolidación | lotes validados | `data/experimentos.csv` y el anexo en Excel con su hoja de completitud | `backend/scripts/actualizar.py`, `exportar_anexo.py` | el mismo comando corre las pruebas al final |
| 3 | Entrenamiento | base consolidada (o datos simulados mientras no haya análisis bromatológico) | modelo y ficha con el origen de los datos, métricas y fecha | `backend/ml/features.py`, `trainer.py`, `backend/scripts/entrenar.py` | validación cruzada; el modelo candidato no reemplaza al que está en uso sin revisión de una persona |
| 4 | Servicio | condiciones de cría de las tres dietas | proteína, lípidos y supervivencia de cada dieta, con su margen, más el estado del modelo | `backend/api/routes/predict.py` | `/salud` y `/api/v1/modelo` en producción; 46 pruebas automáticas |
| 5 | Integración web | las respuestas del productor (animal, etapa, temperatura, humedad) | la misma respuesta del servicio, sin modificar | `web/src/app/api/prediccion/route.ts`, `web/src/app/api/chat/route.ts` | consulta de las tres dietas contra producción |
| 6 | Pantalla | la respuesta del servicio | el resultado comparado con lo que necesita el animal, y el asistente que lo explica | `web/src/components/resultado.tsx`, `web/src/app/api/chat/route.ts` | casos del asistente que se repiten en cada ejecución (`scripts/probar_asistente.py`) |

## 3. Las tres decisiones que sostienen el pipeline

**Un solo comando de los datos al modelo.** Cuando llega una plantilla nueva
del laboratorio se corre:

```
python backend/scripts/actualizar.py --excel "<plantilla.xlsx>"
```

Valida la plantilla, consolida la base, regenera el anexo, entrena un modelo
candidato si ya hay lotes con proteína y lípidos medidos, y corre las pruebas.
El candidato solo reemplaza al modelo en uso con `--publicar`, después de que
una persona revisa sus métricas: un modelo entrenado con pocos lotes reales
puede ser peor que no tener ninguno.

**El modelo se entrena en cada despliegue.** El servicio no recibe un archivo
compilado: lo entrena al arrancar, con semilla fija, a partir de los datos que
están en el repositorio. Así el modelo en producción es siempre el que sale de
esos datos y su origen se puede reconstruir.

**El estado del modelo viaja con cada número.** La respuesta del servicio no
trae solo las cifras: trae también con qué datos se entrenó el modelo. Mientras
esos datos sean simulados, ni la pantalla de resultado ni el asistente
presentan una dieta como sugerencia. La condición está escrita en el código de
las etapas 5 y 6, no en las instrucciones del asistente.

## 4. Por qué la plataforma consulta al modelo desde su servidor

Desde el 22 de octubre de 2026 el teléfono del productor ya no llama
directamente al servicio de predicción. Llama a la propia plataforma
(`/api/prediccion`), y es el servidor de la plataforma el que consulta al
modelo:

```
Teléfono  ──►  www.grillosia.com/api/prediccion  ──►  servicio de predicción
          ◄──  la misma respuesta, sin modificar  ◄──
```

Antes, una consulta hecha desde una dirección distinta a la de producción (una
versión de prueba, o un teléfono en la red local durante las pruebas de
campo) era rechazada por el servicio por seguridad, y el productor veía "no
pudimos consultar el modelo". Con este cambio:

- la consulta funciona desde cualquier dirección en la que se abra la
  plataforma, sin abrir el servicio a todo internet;
- la plataforma revisa la solicitud antes de pasarla (de 1 a 12 combinaciones
  de dieta y condiciones) y corta la espera a los 20 segundos;
- si el servicio no responde, el productor ve "por confirmar" en lugar de
  números, igual que antes.

## 5. Comprobación contra producción

Medido el 21 de noviembre de 2026:

| Tramo | Resultado |
|---|---|
| Pruebas automáticas del modelo y del servicio | 46 de 46 aprobadas |
| `/salud` del servicio | responde `{"estado":"ok"}` |
| `/api/v1/modelo` | entrenado, con datos simulados (120 muestras), y lo declara |
| Consulta de las tres dietas a través de la plataforma | responde en 0,85 a 0,96 segundos, cinco de cinco |
| Rutas públicas de la plataforma | las diez responden correctamente |
