# GrillosIA

GrillosIA usa aprendizaje automático para sugerir con cuál comida criar grillos,
según el animal al que va destinada la harina (tilapia, pollo o cerdo). El
objetivo es producir harina de grillo con alto contenido de proteína para
reemplazar las importaciones de harina de pescado en Colombia.

> Aplicación web: **https://grillosia.com**

- **Financiación**: Minciencias, Convocatoria 963 de 2025 (Contrato 207-2025).
- **Ejecutor**: Universidad de los Llanos.
- **Investigadora principal**: Dra. Mónica Paola Higuera-Díaz.
- **Duración**: 12 meses (febrero 2026 — febrero 2027).
- **Licencia**: Apache 2.0.

---

## Estado

El sistema completo está montado y probado de punta a punta. Lo que falta son
los **análisis bromatológicos**: hasta que se sepa cuánta proteína quedó en la
harina de los lotes cosechados, no hay con qué entrenar el modelo con datos
reales.

Mientras tanto el modelo se entrena con un conjunto **simulado**, que sirve
para comprobar que el aparato funciona. Ese hecho viaja marcado en el artefacto
del modelo, en cada respuesta de la API y en la pantalla de la aplicación. Un
número que se ve bien no debe poder pasar por real.

---

## Cómo funciona

```
Plantilla de recolección (Excel, se llena en el laboratorio)
        │  backend/scripts/cargar_plantilla.py
        ▼
data/experimentos.csv  +  tabla experiments (PostgreSQL)
        │  backend/scripts/entrenar.py
        ▼
backend/ml/modelo.joblib          Random Forest
        │  POST /api/v1/predict
        ▼
Aplicación web (Next.js)          resultado + asistente
```

**Entra**: código de dieta, alimento por día, temperatura, humedad, especie y
días hasta la cosecha.

**Sale**: proteína y lípidos esperados en la harina, con su margen de duda, y
la supervivencia esperada del lote.

El porqué de cada decisión —incluida la comparación argumentada contra
regresión lineal, gradient boosting, redes neuronales y SVR— está en
[`docs/modelo-tecnico.md`](docs/modelo-tecnico.md).

---

## Cómo correrlo

### Servicio de predicción

```bash
pip install -r requirements.txt
cp backend/.env.example backend/.env
uvicorn main:app --reload --app-dir backend   # queda en http://localhost:8000
```

Comprobar que responde:

```bash
curl http://localhost:8000/api/v1/modelo
```

### Aplicación web

```bash
cd web
pnpm install
cp .env.example .env.local         # ponga NEXT_PUBLIC_API_URL
pnpm dev                           # queda en http://localhost:3000
```

Sin `NEXT_PUBLIC_API_URL` la aplicación funciona igual: el resultado muestra
"por confirmar" en lugar de números. Es el estado normal mientras no haya
servicio de predicción desplegado.

### Pruebas

```bash
pytest backend/tests
```

---

## Cuando lleguen los análisis del laboratorio

Dos comandos, sin tocar código:

```bash
# 1. Consolidar la plantilla: valida, exporta el CSV y guarda el histórico
python backend/scripts/cargar_plantilla.py --excel <plantilla.xlsx>

# 2. Reentrenar con datos reales (sin la bandera --simulados)
python backend/scripts/entrenar.py --datos data/experimentos.csv
```

El artefacto queda marcado como entrenado con datos reales, la API lo propaga
y el aviso de "números de prueba" desaparece solo de la aplicación.

---

## Qué hay en cada carpeta

| Carpeta | Qué contiene |
|---|---|
| `backend/ml/` | Definición de variables, entrenamiento e inferencia del modelo. |
| `backend/api/` | Endpoints `GET /api/v1/modelo` y `POST /api/v1/predict`. |
| `backend/schemas/` | Contrato de la API (Pydantic). |
| `backend/scripts/` | Cargar la plantilla, simular datos, entrenar. |
| `backend/db/` | Tabla `experiments` y migraciones (Alembic). |
| `backend/tests/` | Pruebas del modelo, la API y el cargador. |
| `web/` | Aplicación web (Next.js). Consulta paso a paso y asistente. |
| `data/literature/` | Plantilla e instrucciones para capturar datos de artículos. |
| `data/sintetico/` | Datos simulados y la explicación de cómo se generan. |
| `notebooks/` | Análisis exploratorio de los datos. |
| `docs/` | Manuales y documentos técnicos. |

---

## La tabla de datos

Toda la información experimental vive en una sola tabla, `experiments`. Cada
fila es un lote: una comida probada en unas condiciones concretas.

![Diagrama de la tabla experiments](docs/diagrams/er-diagram.png)

| Grupo | Variables | Para qué sirve |
|---|---|---|
| **Dieta y alimentación** | `tipo_dieta`, `alimento_g_dia` | Qué les damos de comer a los grillos y cuánto. |
| **Condiciones de cría** | `temperatura`, `humedad_ambiental`, `fotoperiodo`, `densidad` | Cómo está el ambiente donde viven. |
| **Grillo** | `especie`, `tiempo_desarrollo`, `n_grillos_inicio` | Qué grillo se usó y cuánto tiempo se crió. |
| **Resultado nutricional** | `proteina_harina`, `lipidos_harina` | Lo que el modelo predice. |
| **Resultado productivo** | `tasa_supervivencia`, `peso_promedio`, `biomasa_total` | Cuántos grillos sobrevivieron y cuánto pesaron. |
| **Procedencia** | `observaciones`, `fuente`, `created_at` | De dónde vino el dato y notas. |

---

## Documentos

| Documento | Markdown | PDF |
|---|---|---|
| Modelo predictivo (técnico) | [`modelo-tecnico.md`](docs/modelo-tecnico.md) | [`modelo-tecnico.pdf`](docs/modelo-tecnico.pdf) |
| Guía de uso para productores | [`manual-usuario.md`](docs/manual-usuario.md) | [`manual-usuario.pdf`](docs/manual-usuario.pdf) |
| Manual técnico | [`manual-tecnico.md`](docs/manual-tecnico.md) | [`manual-tecnico.pdf`](docs/manual-tecnico.pdf) |
| Esquema de base de datos | [`database-schema.md`](docs/database-schema.md) | [`database-schema.pdf`](docs/database-schema.pdf) |
| Login con Google y persistencia | [`auth-y-persistencia.md`](docs/auth-y-persistencia.md) | [`auth-y-persistencia.pdf`](docs/auth-y-persistencia.pdf) |

Los PDF se regeneran con:

```bash
npx md-to-pdf --stylesheet docs/pdf-style.css docs/modelo-tecnico.md
```

Además:

- [`notebooks/01_analisis_exploratorio.ipynb`](notebooks/01_analisis_exploratorio.ipynb) — qué dicen los datos que hay.
- [`data/sintetico/README.md`](data/sintetico/README.md) — cómo se generan los datos simulados y qué no se puede hacer con ellos.
- [`data/literature/INSTRUCCIONES.md`](data/literature/INSTRUCCIONES.md) — cómo llenar la plantilla de literatura.
- [`LICENSE`](LICENSE) — Apache 2.0.

---

## En qué parte del cronograma va

| Actividad | Qué respalda este repositorio |
|---|---|
| **3.2** Desarrollo del modelo de IA | Variables, entrenamiento, validación, documento técnico con la justificación del modelo elegido, pruebas. |
| **3.4** Integración del modelo con la plataforma | API de predicción y la aplicación web consumiéndola: resultado con números y margen, y asistente que responde sobre esos números. |
