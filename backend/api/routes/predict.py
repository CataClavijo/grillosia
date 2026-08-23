"""Endpoint de predicción: la costura entre el modelo y la plataforma."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ml.predictor import obtener_predictor
from schemas.prediction import (
    EstadoModelo,
    InfoModeloSalida,
    RespuestaPrediccion,
    ResultadoDieta,
    SolicitudPrediccion,
)

router = APIRouter(prefix="/api/v1", tags=["prediccion"])


@router.get("/modelo", response_model=EstadoModelo)
def estado_modelo() -> EstadoModelo:
    """Dice si hay modelo entrenado y con qué se entrenó.

    La aplicación lo consulta al abrir el resultado del asistente: si no hay
    modelo, deja los tres huecos en "por confirmar" en lugar de pedir una
    predicción que no puede darse.
    """
    predictor = obtener_predictor()

    if predictor is None:
        return EstadoModelo(
            entrenado=False,
            mensaje=(
                "Todavía no hay modelo entrenado. Faltan los análisis "
                "bromatológicos que dan la proteína y los lípidos de la harina."
            ),
        )

    info = predictor.info
    return EstadoModelo(
        entrenado=True,
        datos_simulados=info.datos_simulados,
        origen_datos=info.origen_datos,
        n_muestras=info.n_muestras,
        entrenado_en=info.entrenado_en,
        advertencias=info.advertencias or [],
        mensaje=(
            "Modelo entrenado con datos simulados: sirve para probar el "
            "sistema, no para sugerir dietas."
            if info.datos_simulados
            else "Modelo entrenado con datos del proyecto."
        ),
    )


@router.post("/predict", response_model=RespuestaPrediccion)
def predecir(solicitud: SolicitudPrediccion) -> RespuestaPrediccion:
    """Predice la composición de la harina para cada combinación recibida."""
    predictor = obtener_predictor()

    if predictor is None:
        # 503 y no 500: no es una avería, es que esta pieza todavía no existe.
        raise HTTPException(
            status_code=503,
            detail=(
                "Todavía no hay modelo entrenado. Faltan los análisis "
                "bromatológicos."
            ),
        )

    predicciones = predictor.predecir(
        [c.model_dump() for c in solicitud.condiciones]
    )
    info = predictor.info

    return RespuestaPrediccion(
        resultados=[
            ResultadoDieta(
                tipo_dieta=p.tipo_dieta,
                proteina_harina=p.proteina_harina,
                lipidos_harina=p.lipidos_harina,
                margen_proteina=p.margen_proteina,
                margen_lipidos=p.margen_lipidos,
                tasa_supervivencia=p.tasa_supervivencia,
                fuera_de_rango=p.fuera_de_rango,
            )
            for p in predicciones
        ],
        modelo=InfoModeloSalida(
            datos_simulados=info.datos_simulados,
            origen_datos=info.origen_datos,
            n_muestras=info.n_muestras,
            entrenado_en=info.entrenado_en,
            advertencias=info.advertencias or [],
        ),
    )
