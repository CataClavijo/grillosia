"""Genera un conjunto de datos SIMULADO para comprobar que el pipeline corre.

Por qué existe
--------------
Los ensayos del proyecto todavía no tienen análisis bromatológico, así que las
dos columnas que el modelo debe aprender a predecir —proteína y lípidos de la
harina— están vacías. Sin ellas no se puede entrenar, y sin entrenar no se
puede comprobar que el resto del sistema funciona.

Este script rellena ese hueco con datos inventados, para responder una sola
pregunta: **¿el pipeline corre de principio a fin y aprende una relación que
está ahí?** Como la relación la ponemos nosotros, sabemos cuál es y podemos
verificar que el modelo la encuentra.

Qué NO es
---------
Estos datos no describen ningún grillo. No salen de literatura, no salen del
laboratorio y no deben citarse en ningún informe como resultado. Cada fila
lleva `fuente = SIMULADO` y el archivo se guarda en `data/sintetico/`, aparte
de los datos reales. El modelo entrenado con ellos queda marcado, y la API
repite esa marca en cada respuesta.

La relación inventada
---------------------
Es una superficie sencilla, escrita aquí para que se vea que es artificial:

    proteína = base(dieta)
             − 0,45 × (temperatura − 28)          más calor, menos proteína
             − 0,08 × |humedad − 65|              se penaliza alejarse de 65
             + 0,10 × (días − 45)                 más tiempo, algo más
             + ruido

    lípidos  = 78 − proteína × 0,8 + ruido        relación inversa

    supervivencia = 95
             − 2,5 × |temperatura − 28|
             − 0,8 × |humedad − 65|
             + ruido, recortada a [0, 100]

Uso
---
    python backend/scripts/simular_datos.py --filas 120
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

# Estructura tomada del estudio real: son las dietas, la familia y los rangos
# con los que se trabaja. Lo inventado es la respuesta, no el escenario.
DIETAS = ["D1", "D2", "D3"]
ESPECIE = "Gryllidae"

#: Proteína base por dieta, en % de materia seca. Números escogidos a dedo,
#: separados lo justo para que el modelo pueda distinguir las dietas.
BASE_POR_DIETA = {"D1": 58.0, "D2": 55.0, "D3": 61.0}

MARCA_FUENTE = "SIMULADO"


def generar(n_filas: int = 120, semilla: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(semilla)

    dieta = rng.choice(DIETAS, size=n_filas)
    temperatura = np.round(rng.uniform(24, 34, n_filas), 1)
    humedad = np.round(rng.uniform(50, 80, n_filas), 1)
    dias = rng.integers(30, 60, n_filas)
    alimento = np.round(rng.uniform(0.5, 4.0, n_filas), 2)

    base = np.array([BASE_POR_DIETA[d] for d in dieta])

    proteina = (
        base
        - 0.45 * (temperatura - 28)
        - 0.08 * np.abs(humedad - 65)
        + 0.10 * (dias - 45)
        + rng.normal(0, 1.2, n_filas)
    )
    lipidos = 78 - proteina * 0.8 + rng.normal(0, 0.9, n_filas)

    supervivencia = np.clip(
        95
        - 2.5 * np.abs(temperatura - 28)
        - 0.8 * np.abs(humedad - 65)
        + rng.normal(0, 4, n_filas),
        0,
        100,
    )

    # El alimento diario no entra en la fórmula a propósito: sirve para
    # comprobar que el modelo le asigna poca importancia. Si saliera alta,
    # sería señal de que está aprendiendo ruido.
    return pd.DataFrame(
        {
            "tipo_dieta": dieta,
            "alimento_g_dia": alimento,
            "temperatura": temperatura,
            "humedad_ambiental": humedad,
            "especie": ESPECIE,
            "tiempo_desarrollo": dias,
            "proteina_harina": np.round(proteina, 2),
            "lipidos_harina": np.round(lipidos, 2),
            "tasa_supervivencia": np.round(supervivencia, 1),
            "fuente": MARCA_FUENTE,
            "observaciones": "Fila generada por simular_datos.py. No es un dato real.",
        }
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--filas", type=int, default=120)
    parser.add_argument("--semilla", type=int, default=42)
    parser.add_argument(
        "--salida", default="data/sintetico/experimentos_simulados.csv"
    )
    args = parser.parse_args()

    df = generar(args.filas, args.semilla)
    salida = Path(args.salida)
    salida.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(salida, index=False)

    print(f"Escritas {len(df)} filas SIMULADAS en {salida}")
    print("Estos datos no describen ningún ensayo real.")


if __name__ == "__main__":
    main()
