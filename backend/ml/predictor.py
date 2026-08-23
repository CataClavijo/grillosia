"""Inferencia: carga el modelo entrenado y responde predicciones.

Además del valor predicho devuelve un margen. En un bosque aleatorio cada
árbol vota por su cuenta, y la dispersión entre esos votos dice cuánta
confianza merece el promedio: si los árboles se contradicen, el número no debe
presentarse como si fuera firme. Es preferible a devolver una "confianza" fija
que nadie sabe interpretar.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline

from ml.features import (
    ESPECIE_POR_DEFECTO,
    FEATURE_COLUMNS,
    fuera_de_rango,
)

logger = logging.getLogger(__name__)

#: Dónde vive el artefacto entrenado. Se resuelve contra la carpeta de este
#: archivo y no contra el directorio de trabajo, porque el servicio se arranca
#: unas veces desde la raíz del proyecto y otras desde `backend/`, y el modelo
#: tiene que aparecer en los dos casos.
RUTA_MODELO = os.environ.get(
    "GRILLOSIA_MODEL_PATH",
    str(Path(__file__).resolve().parent / "modelo.joblib"),
)


@dataclass
class Prediccion:
    """Resultado para una combinación de dieta y condiciones."""

    tipo_dieta: str
    proteina_harina: float
    lipidos_harina: float
    #: Margen a cada lado, en puntos de porcentaje, según cuánto discrepan los
    #: árboles del bosque.
    margen_proteina: float
    margen_lipidos: float
    #: Supervivencia esperada. Nulo si no se entrenó el modelo de viabilidad.
    tasa_supervivencia: float | None = None
    #: Variables de la petición que caen fuera del rango del estudio.
    fuera_de_rango: list[str] | None = None


@dataclass
class InfoModelo:
    """Con qué se entrenó lo que está respondiendo."""

    disponible: bool
    datos_simulados: bool = False
    origen_datos: str = ""
    n_muestras: int = 0
    entrenado_en: str = ""
    advertencias: list[str] | None = None


class Predictor:
    def __init__(self, artefacto: dict):
        self._a = artefacto
        self.modelo: Pipeline = artefacto["modelo"]
        self.modelo_viabilidad: Pipeline | None = artefacto.get("modelo_viabilidad")

    @property
    def info(self) -> InfoModelo:
        m = self._a.get("metricas", {})
        return InfoModelo(
            disponible=True,
            datos_simulados=bool(self._a.get("datos_simulados")),
            origen_datos=str(self._a.get("origen_datos", "")),
            n_muestras=int(m.get("n_muestras", 0)),
            entrenado_en=str(self._a.get("entrenado_en", "")),
            advertencias=list(m.get("advertencias") or []),
        )

    def _margenes(self, X: pd.DataFrame) -> np.ndarray:
        """Desviación entre los árboles, por muestra y por salida.

        Devuelve una matriz (n_muestras, n_salidas).
        """
        pre: ColumnTransformer = self.modelo.named_steps["preprocesador"]
        reg: MultiOutputRegressor = self.modelo.named_steps["regresor"]
        X_t = pre.transform(X)

        por_salida = []
        for bosque in reg.estimators_:
            votos = np.array([arbol.predict(X_t) for arbol in bosque.estimators_])
            por_salida.append(votos.std(axis=0))

        return np.column_stack(por_salida)

    def predecir(self, condiciones: list[dict]) -> list[Prediccion]:
        """Predice para una o varias combinaciones a la vez.

        El asistente pregunta siempre por las tres dietas con las mismas
        condiciones, así que conviene resolverlas en una sola pasada.
        """
        X = pd.DataFrame(condiciones)

        # La especie se puede omitir: mientras la identificación taxonómica no
        # esté cerrada, todos los ejemplares se reportan a nivel de familia y
        # exigir el campo solo sería ruido para quien llama.
        if "especie" not in X.columns:
            X["especie"] = ESPECIE_POR_DEFECTO
        X["especie"] = X["especie"].fillna(ESPECIE_POR_DEFECTO)

        faltan = [c for c in FEATURE_COLUMNS if c not in X.columns]
        if faltan:
            raise ValueError(
                "Faltan condiciones de cría: " + ", ".join(faltan)
            )

        X = X[FEATURE_COLUMNS]

        valores = self.modelo.predict(X)
        margenes = self._margenes(X)

        supervivencia = None
        if self.modelo_viabilidad is not None:
            supervivencia = self.modelo_viabilidad.predict(X)

        salida = []
        for i, fila in enumerate(condiciones):
            salida.append(
                Prediccion(
                    tipo_dieta=str(fila["tipo_dieta"]),
                    proteina_harina=round(float(valores[i][0]), 1),
                    lipidos_harina=round(float(valores[i][1]), 1),
                    margen_proteina=round(float(margenes[i][0]), 1),
                    margen_lipidos=round(float(margenes[i][1]), 1),
                    tasa_supervivencia=(
                        round(float(np.ravel(supervivencia[i])[0]), 1)
                        if supervivencia is not None
                        else None
                    ),
                    fuera_de_rango=fuera_de_rango(fila) or None,
                )
            )
        return salida


_predictor: Predictor | None = None
_ruta_cargada: str | None = None


def obtener_predictor(ruta: str | Path | None = None) -> Predictor | None:
    """Devuelve el predictor, o None si todavía no hay modelo entrenado.

    Que no haya modelo es el estado normal del proyecto hasta que lleguen los
    análisis bromatológicos, así que no es un error: la API responde que el
    modelo no está listo y la aplicación lo muestra como "por confirmar".
    """
    global _predictor, _ruta_cargada

    ruta = str(ruta or RUTA_MODELO)
    if _predictor is not None and _ruta_cargada == ruta:
        return _predictor

    if not Path(ruta).exists():
        logger.info("Todavía no hay modelo entrenado en %s", ruta)
        return None

    try:
        import joblib

        _predictor = Predictor(joblib.load(ruta))
        _ruta_cargada = ruta
        logger.info("Modelo cargado desde %s", ruta)
        return _predictor
    except Exception:
        logger.exception("No se pudo cargar el modelo desde %s", ruta)
        return None
