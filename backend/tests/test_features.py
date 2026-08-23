"""Pruebas de la definición de variables.

Estas comprueban los acuerdos que el resto del sistema da por hechos: si una
de ellas falla, hay algo desalineado entre el modelo, la API y la plantilla.
"""

from ml.features import (
    CATEGORICAL_FEATURES,
    FEATURE_COLUMNS,
    NUMERIC_FEATURES,
    RANGOS,
    REQUIRED_COLUMNS,
    TARGET_COLUMNS,
    fuera_de_rango,
)


def test_las_seis_entradas_estan_cubiertas():
    """Cada entrada del modelo tiene que ser categórica o numérica, no las dos
    ni ninguna: el preprocesamiento se arma a partir de esas dos listas."""
    assert set(CATEGORICAL_FEATURES) | set(NUMERIC_FEATURES) == set(
        FEATURE_COLUMNS
    )
    assert not set(CATEGORICAL_FEATURES) & set(NUMERIC_FEATURES)


def test_las_columnas_obligatorias_incluyen_los_objetivos():
    """Un CSV sin proteína y lípidos no sirve para entrenar."""
    for objetivo in TARGET_COLUMNS:
        assert objetivo in REQUIRED_COLUMNS


def test_dentro_del_rango_no_avisa():
    valores = {
        "temperatura": 28,
        "humedad_ambiental": 65,
        "alimento_g_dia": 2.5,
        "tiempo_desarrollo": 45,
    }
    assert fuera_de_rango(valores) == []


def test_fuera_del_rango_nombra_la_variable():
    fuera = fuera_de_rango({"temperatura": 41, "humedad_ambiental": 65})
    assert fuera == ["temperatura"]


def test_una_variable_ausente_no_se_reporta():
    """Que no venga un dato no es lo mismo que venga mal."""
    assert fuera_de_rango({"temperatura": 28}) == []


def test_los_limites_cuentan_como_dentro():
    minimo, maximo = RANGOS["temperatura"]
    assert fuera_de_rango({"temperatura": minimo}) == []
    assert fuera_de_rango({"temperatura": maximo}) == []
