"""Contrato de la API de predicción.

Es la frontera entre el modelo y la plataforma. Lo que entra aquí son las
condiciones de cría; lo que sale, la composición esperada de la harina y las
advertencias que la aplicación debe mostrar junto al número.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from ml.features import ESPECIE_POR_DEFECTO


class CondicionesCria(BaseModel):
    """Una combinación de dieta y condiciones."""

    tipo_dieta: str = Field(..., examples=["D1"], description="Código de dieta")
    alimento_g_dia: float = Field(..., ge=0, le=100, examples=[2.5])
    temperatura: float = Field(..., ge=0, le=50, examples=[28])
    humedad_ambiental: float = Field(..., ge=0, le=100, examples=[65])
    especie: str = Field(default=ESPECIE_POR_DEFECTO, examples=[ESPECIE_POR_DEFECTO])
    tiempo_desarrollo: int = Field(..., ge=1, le=365, examples=[45])


class SolicitudPrediccion(BaseModel):
    """Varias combinaciones de una vez.

    El asistente pregunta siempre por las tres dietas con las mismas
    condiciones, así que se resuelven en una sola llamada en lugar de tres.
    """

    condiciones: list[CondicionesCria] = Field(..., min_length=1, max_length=50)


class ResultadoDieta(BaseModel):
    tipo_dieta: str
    proteina_harina: float = Field(..., description="% de materia seca")
    lipidos_harina: float = Field(..., description="% de materia seca")
    margen_proteina: float = Field(
        ...,
        description=(
            "Margen a cada lado, en puntos de porcentaje, según cuánto "
            "discrepan los árboles del bosque entre sí."
        ),
    )
    margen_lipidos: float
    tasa_supervivencia: float | None = None
    fuera_de_rango: list[str] | None = Field(
        default=None,
        description=(
            "Variables de la petición que caen fuera del rango del estudio. "
            "Si trae algo, la predicción es una extrapolación."
        ),
    )


class InfoModeloSalida(BaseModel):
    """De dónde viene lo que se está respondiendo.

    Viaja en cada respuesta a propósito: la aplicación necesita poder decirle
    al productor que el número sale de un modelo entrenado con datos
    simulados, en vez de presentarlo como si fuera definitivo.
    """

    datos_simulados: bool
    origen_datos: str
    n_muestras: int
    entrenado_en: str
    advertencias: list[str] = Field(default_factory=list)


class RespuestaPrediccion(BaseModel):
    resultados: list[ResultadoDieta]
    modelo: InfoModeloSalida


class EstadoModelo(BaseModel):
    """Respuesta de `/api/v1/modelo`.

    Que no haya modelo es el estado normal del proyecto hasta que lleguen los
    análisis bromatológicos. La aplicación consulta este endpoint para saber
    si puede pedir predicciones o debe seguir mostrando "por confirmar".
    """

    entrenado: bool
    datos_simulados: bool = False
    origen_datos: str = ""
    n_muestras: int = 0
    entrenado_en: str = ""
    advertencias: list[str] = Field(default_factory=list)
    mensaje: str = ""
