"""Entrenamiento del modelo predictivo.

Random Forest multi-salida sobre las seis condiciones de cría, para predecir
la composición de la harina. La justificación de por qué este algoritmo y no
otro está en `docs/modelo-tecnico.md`.

Sobre las métricas
------------------
El R² calculado sobre los mismos datos con los que se entrenó no dice nada en
un bosque aleatorio: los árboles memorizan y el número sale cerca de 1 aunque
el modelo no haya aprendido nada generalizable. Por eso la métrica principal
que reporta este módulo es la de **validación cruzada**, y el R² de
entrenamiento se guarda aparte y etiquetado, solo para detectar sobreajuste
comparando ambos.

Con pocas decenas de filas ni siquiera la validación cruzada es concluyente.
El artefacto guarda cuántas muestras se usaron para que quien lea las métricas
sepa cuánto peso darles.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.features import (
    CATEGORICAL_FEATURES,
    FEATURE_COLUMNS,
    NUMERIC_FEATURES,
    REQUIRED_COLUMNS,
    TARGET_COLUMNS,
    VIABILITY_COLUMNS,
)

logger = logging.getLogger(__name__)

#: Debajo de este número de muestras la validación cruzada no es informativa y
#: el modelo no debería usarse para decidir nada.
MINIMO_PARA_CONFIAR = 30


@dataclass
class Metricas:
    """Resultado de entrenar. Se guarda junto al modelo."""

    n_muestras: int
    #: Validación cruzada: la métrica que cuenta.
    cv_r2_proteina: float | None = None
    cv_r2_lipidos: float | None = None
    cv_folds: int | None = None
    #: Error absoluto medio en validación cruzada, en puntos de porcentaje.
    cv_mae_proteina: float | None = None
    cv_mae_lipidos: float | None = None
    #: R² sobre los datos de entrenamiento. Solo sirve para comparar con el de
    #: validación: una brecha grande delata sobreajuste.
    r2_entrenamiento_proteina: float | None = None
    r2_entrenamiento_lipidos: float | None = None
    #: Peso relativo de cada variable de entrada.
    importancia_variables: dict[str, float] = field(default_factory=dict)
    #: Advertencias legibles para quien lea el informe.
    advertencias: list[str] = field(default_factory=list)


def construir_pipeline(
    n_estimators: int = 300, random_state: int = 42
) -> Pipeline:
    """Preprocesamiento más bosque aleatorio.

    Las categóricas van a variables indicadoras y las numéricas se estandarizan.
    Un bosque no necesita el escalado, pero mantenerlo deja el pipeline listo
    para comparar contra modelos que sí lo necesitan, que es lo que pide el
    informe técnico.
    """
    preprocesador = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES,
            ),
            ("num", StandardScaler(), NUMERIC_FEATURES),
        ]
    )

    return Pipeline(
        [
            ("preprocesador", preprocesador),
            (
                "regresor",
                MultiOutputRegressor(
                    RandomForestRegressor(
                        n_estimators=n_estimators,
                        random_state=random_state,
                        # Con pocas filas, exigir un mínimo por hoja evita que
                        # cada muestra acabe en su propia hoja.
                        min_samples_leaf=2,
                        n_jobs=-1,
                    )
                ),
            ),
        ]
    )


def _nombres_de_variables(pipeline: Pipeline) -> list[str]:
    """Nombres de las columnas después del preprocesamiento."""
    pre: ColumnTransformer = pipeline.named_steps["preprocesador"]
    nombres: list[str] = []
    for nombre, transformador, columnas in pre.transformers_:
        if nombre == "cat":
            nombres.extend(transformador.get_feature_names_out(columnas))
        elif nombre == "num":
            nombres.extend(columnas)
    return nombres


def _importancia(pipeline: Pipeline) -> dict[str, float]:
    """Peso relativo de cada variable, promediado entre las dos salidas.

    Es lo que permite responderle al productor por qué se le sugiere una dieta,
    y es la razón principal por la que se eligió un bosque y no una red.
    """
    regresor: MultiOutputRegressor = pipeline.named_steps["regresor"]
    importancias = np.mean(
        [est.feature_importances_ for est in regresor.estimators_], axis=0
    )
    nombres = _nombres_de_variables(pipeline)

    # Las categóricas se expanden en varias columnas; se vuelven a juntar bajo
    # el nombre original para que el informe hable de "dieta", no de "dieta_D2".
    agrupadas: dict[str, float] = {}
    for nombre, peso in zip(nombres, importancias):
        original = next(
            (c for c in CATEGORICAL_FEATURES if nombre.startswith(f"{c}_")),
            nombre,
        )
        agrupadas[original] = agrupadas.get(original, 0.0) + float(peso)

    return dict(sorted(agrupadas.items(), key=lambda kv: kv[1], reverse=True))


def entrenar(
    datos: str | Path | pd.DataFrame,
    salida: str | Path = "backend/ml/modelo.joblib",
    n_estimators: int = 300,
    origen_datos: str = "desconocido",
    datos_simulados: bool = False,
) -> Metricas:
    """Entrena el modelo y guarda el artefacto.

    Args:
        datos: Ruta a un CSV o un DataFrame ya cargado.
        salida: Dónde guardar el artefacto.
        n_estimators: Número de árboles.
        origen_datos: De dónde salieron los datos. Queda escrito en el
            artefacto para que después se sepa con qué se entrenó.
        datos_simulados: Cierto si los datos son sintéticos. El artefacto lo
            registra y la API lo repite en cada respuesta: un modelo entrenado
            con datos inventados no puede presentarse como si no lo fuera.
    """
    df = pd.read_csv(datos) if isinstance(datos, (str, Path)) else datos.copy()

    faltan = set(REQUIRED_COLUMNS) - set(df.columns)
    if faltan:
        raise ValueError(f"Al conjunto de datos le faltan columnas: {sorted(faltan)}")

    antes = len(df)
    df = df.dropna(subset=TARGET_COLUMNS)
    descartadas = antes - len(df)

    if df.empty:
        raise ValueError(
            "Ninguna fila tiene proteína y lípidos. Sin análisis bromatológico "
            "no hay nada que el modelo pueda aprender a predecir."
        )

    advertencias: list[str] = []
    if descartadas:
        advertencias.append(
            f"Se descartaron {descartadas} filas sin análisis bromatológico."
        )
    if len(df) < MINIMO_PARA_CONFIAR:
        advertencias.append(
            f"Solo {len(df)} muestras: por debajo de {MINIMO_PARA_CONFIAR} las "
            "métricas no son concluyentes y el modelo no debe usarse para "
            "decidir nada."
        )
    if datos_simulados:
        advertencias.append(
            "Entrenado con datos SIMULADOS. Sirve para comprobar que el "
            "pipeline corre, no para sugerir dietas."
        )

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMNS]

    pipeline = construir_pipeline(n_estimators=n_estimators)

    # ── Validación cruzada: la métrica que cuenta ──
    #
    # Se usa cross_val_predict y no cross_val_score porque las puntuaciones
    # de scikit-learn promedian las dos salidas en un solo número, y aquí
    # interesa cada una por separado: la proteína y los lípidos no se
    # predicen igual de bien, y presentar un promedio taparía la diferencia.
    # Con las predicciones fuera de muestra en la mano, el R² y el error se
    # calculan por columna.
    cv_r2 = cv_mae = None
    folds = min(5, len(df))
    if folds >= 2:
        kf = KFold(n_splits=folds, shuffle=True, random_state=42)
        y_cv = cross_val_predict(pipeline, X, y, cv=kf)
        cv_r2 = r2_score(y, y_cv, multioutput="raw_values")
        cv_mae = mean_absolute_error(y, y_cv, multioutput="raw_values")
    else:
        advertencias.append(
            "Muy pocas muestras para validación cruzada: no hay métrica fiable."
        )

    # ── Ajuste final sobre todos los datos ──
    pipeline.fit(X, y)
    y_pred = pipeline.predict(X)
    r2_entrenamiento = r2_score(y, y_pred, multioutput="raw_values")

    metricas = Metricas(
        n_muestras=len(df),
        cv_folds=folds if cv_r2 is not None else None,
        cv_r2_proteina=float(cv_r2[0]) if cv_r2 is not None else None,
        cv_r2_lipidos=float(cv_r2[1]) if cv_r2 is not None else None,
        cv_mae_proteina=float(cv_mae[0]) if cv_mae is not None else None,
        cv_mae_lipidos=float(cv_mae[1]) if cv_mae is not None else None,
        r2_entrenamiento_proteina=float(r2_entrenamiento[0]),
        r2_entrenamiento_lipidos=float(r2_entrenamiento[1]),
        importancia_variables=_importancia(pipeline),
        advertencias=advertencias,
    )

    # Una brecha grande entre entrenamiento y validación es sobreajuste, y con
    # datasets pequeños es lo más probable que pase.
    if metricas.cv_r2_proteina is not None:
        brecha = metricas.r2_entrenamiento_proteina - metricas.cv_r2_proteina
        if brecha > 0.35:
            metricas.advertencias.append(
                f"Brecha de {brecha:.2f} entre entrenamiento y validación: el "
                "modelo está memorizando más que generalizando."
            )

    # ── Modelo aparte para la viabilidad ──
    modelo_viabilidad = None
    columnas_viabilidad = [c for c in VIABILITY_COLUMNS if c in df.columns]
    if columnas_viabilidad:
        df_v = df.dropna(subset=columnas_viabilidad)
        if len(df_v) >= 5:
            modelo_viabilidad = construir_pipeline(n_estimators=n_estimators)
            modelo_viabilidad.fit(df_v[FEATURE_COLUMNS], df_v[columnas_viabilidad])
        else:
            metricas.advertencias.append(
                "Muy pocas filas con supervivencia: no se entrenó el modelo de "
                "viabilidad."
            )

    artefacto = {
        "modelo": pipeline,
        "modelo_viabilidad": modelo_viabilidad,
        "columnas_entrada": FEATURE_COLUMNS,
        "columnas_salida": TARGET_COLUMNS,
        "columnas_viabilidad": columnas_viabilidad if modelo_viabilidad else [],
        "metricas": asdict(metricas),
        "datos_simulados": datos_simulados,
        "origen_datos": origen_datos,
        "entrenado_en": datetime.now(timezone.utc).isoformat(),
        "version_esquema": 1,
    }

    salida = Path(salida)
    salida.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artefacto, salida)

    # Un resumen legible junto al binario, para poder revisarlo sin cargar
    # el artefacto ni tener scikit-learn instalado.
    salida.with_suffix(".json").write_text(
        json.dumps(
            {
                "metricas": asdict(metricas),
                "datos_simulados": datos_simulados,
                "origen_datos": origen_datos,
                "entrenado_en": artefacto["entrenado_en"],
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    logger.info(
        "Modelo guardado en %s · %d muestras · R² validación proteína=%s",
        salida,
        metricas.n_muestras,
        f"{metricas.cv_r2_proteina:.3f}" if metricas.cv_r2_proteina else "n/d",
    )

    return metricas
