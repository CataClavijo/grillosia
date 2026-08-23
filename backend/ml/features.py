"""Definición de las variables del modelo.

Fuente única de verdad: el entrenamiento, la inferencia, el cargador de datos
y los esquemas de la API leen de aquí. Si una variable cambia de nombre o de
papel, se cambia en este archivo y el resto del sistema la sigue.

Los códigos V01 a V17 son los del catálogo de variables del proyecto y los
mismos que usa la tabla `experiments`.
"""

# ─────────────────────────── Entradas del modelo ───────────────────────────

#: Condiciones de cría que el modelo usa para predecir. Son seis: el resto de
#: columnas de la tabla, aunque se registren, no entran al modelo.
FEATURE_COLUMNS = [
    "tipo_dieta",         # V01 · categórica · D1, D2, D3
    "alimento_g_dia",     # V02 · g/día
    "temperatura",        # V03 · °C
    "humedad_ambiental",  # V04 · %
    "especie",            # V07 · categórica
    "tiempo_desarrollo",  # V08 · días
]

CATEGORICAL_FEATURES = ["tipo_dieta", "especie"]

NUMERIC_FEATURES = [
    "alimento_g_dia",
    "temperatura",
    "humedad_ambiental",
    "tiempo_desarrollo",
]

# ─────────────────────────── Salidas del modelo ────────────────────────────

#: Lo que el modelo predice: la composición de la harina. Salen del análisis
#: bromatológico, así que una fila sin estos valores no sirve para entrenar.
TARGET_COLUMNS = ["proteina_harina", "lipidos_harina"]  # V10, V11

#: Señales de viabilidad. Se predicen aparte porque responden otra pregunta:
#: no "qué harina sale" sino "sale algo". Una dieta con proteína alta y
#: supervivencia baja no le sirve al productor, y el filtro necesita este
#: número para descartarla antes de comparar.
VIABILITY_COLUMNS = ["tasa_supervivencia"]  # V12

#: Columnas que deben venir en cualquier CSV de entrenamiento.
REQUIRED_COLUMNS = FEATURE_COLUMNS + TARGET_COLUMNS

# ─────────────────────────── Rangos del estudio ────────────────────────────

#: Condiciones de cría objetivo. Sirven para avisar cuando llega una petición
#: fuera del terreno donde el modelo aprendió: fuera de estos rangos la
#: predicción es una extrapolación y hay que decirlo.
RANGOS = {
    "temperatura": (24.0, 34.0),
    "humedad_ambiental": (50.0, 80.0),
    "alimento_g_dia": (0.0, 50.0),
    "tiempo_desarrollo": (1, 120),
}

#: Códigos de dieta en estudio. La composición vive en la plantilla de
#: recolección y en la interfaz; aquí solo importa el código.
DIETAS = ["D1", "D2", "D3"]

#: Mientras la identificación de especie no esté cerrada, todos los ejemplares
#: se reportan a nivel de familia.
ESPECIE_POR_DEFECTO = "Gryllidae"


def fuera_de_rango(valores: dict) -> list[str]:
    """Devuelve los nombres de las variables que caen fuera del rango del
    estudio. Lista vacía significa que la petición está en terreno conocido."""
    fuera = []
    for columna, (minimo, maximo) in RANGOS.items():
        v = valores.get(columna)
        if v is None:
            continue
        if v < minimo or v > maximo:
            fuera.append(columna)
    return fuera
