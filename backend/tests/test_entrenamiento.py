"""Pruebas del entrenamiento y la inferencia.

Se entrena de verdad, con un conjunto pequeño generado al vuelo. Es lento
comparado con una prueba unitaria, pero es lo único que comprueba que las
piezas encajan: preprocesamiento, ajuste, guardado y carga.
"""

from __future__ import annotations

import pandas as pd
import pytest

from ml.features import ESPECIE_POR_DEFECTO
from ml.predictor import Predictor, obtener_predictor
from ml.trainer import entrenar


@pytest.fixture(scope="module")
def datos(tmp_path_factory) -> "pd.DataFrame":
    """Un conjunto chico pero con señal: la proteína depende de la dieta."""
    base = {"D1": 55.0, "D2": 58.0, "D3": 61.0}
    filas = []
    for i in range(45):
        dieta = ["D1", "D2", "D3"][i % 3]
        temperatura = 26 + (i % 5)
        proteina = base[dieta] - 0.4 * (temperatura - 28)
        filas.append(
            {
                "tipo_dieta": dieta,
                "alimento_g_dia": 1 + (i % 4),
                "temperatura": temperatura,
                "humedad_ambiental": 60 + (i % 3),
                "especie": ESPECIE_POR_DEFECTO,
                "tiempo_desarrollo": 40 + (i % 10),
                "proteina_harina": proteina,
                "lipidos_harina": 78 - proteina * 0.8,
                "tasa_supervivencia": 90 - abs(temperatura - 28),
            }
        )
    return pd.DataFrame(filas)


@pytest.fixture(scope="module")
def modelo(datos, tmp_path_factory):
    ruta = tmp_path_factory.mktemp("modelo") / "modelo.joblib"
    metricas = entrenar(
        datos,
        salida=ruta,
        n_estimators=60,
        origen_datos="prueba",
        datos_simulados=True,
    )
    return ruta, metricas


def test_entrena_y_guarda(modelo):
    ruta, metricas = modelo
    assert ruta.exists()
    assert metricas.n_muestras == 45
    assert metricas.cv_folds == 5


def test_las_metricas_de_cada_objetivo_son_independientes(modelo):
    """Proteína y lípidos no se predicen igual de bien, y promediar las dos
    en un solo número taparía la diferencia."""
    _, m = modelo
    assert m.cv_r2_proteina is not None
    assert m.cv_r2_lipidos is not None
    assert m.cv_mae_proteina is not None


def test_el_modelo_aprende_algo(modelo):
    """Con señal clara, la validación cruzada tiene que ser decente. Si esto
    falla, el pipeline está roto, no es que falten datos."""
    _, m = modelo
    assert m.cv_r2_proteina > 0.5


def test_la_dieta_pesa(modelo):
    """La dieta es lo que genera la diferencia en los datos de prueba."""
    _, m = modelo
    assert m.importancia_variables["tipo_dieta"] > 0.3


def test_queda_marcado_como_simulado(modelo):
    ruta, _ = modelo
    predictor = obtener_predictor(ruta)
    assert predictor is not None
    assert predictor.info.datos_simulados is True
    assert any("SIMULADOS" in a for a in predictor.info.advertencias)


def test_predice_las_tres_dietas(modelo):
    ruta, _ = modelo
    predictor = obtener_predictor(ruta)

    condiciones = [
        {
            "tipo_dieta": d,
            "alimento_g_dia": 2.5,
            "temperatura": 28,
            "humedad_ambiental": 65,
            "tiempo_desarrollo": 45,
        }
        for d in ("D1", "D2", "D3")
    ]
    salida = predictor.predecir(condiciones)

    assert [p.tipo_dieta for p in salida] == ["D1", "D2", "D3"]
    for p in salida:
        assert 0 < p.proteina_harina < 100
        assert p.margen_proteina >= 0
        assert p.tasa_supervivencia is not None
        assert p.fuera_de_rango is None


def test_la_especie_se_puede_omitir(modelo):
    """Mientras la identificación taxonómica no esté cerrada, exigir el campo
    solo sería ruido para quien llama."""
    ruta, _ = modelo
    predictor = obtener_predictor(ruta)
    salida = predictor.predecir(
        [
            {
                "tipo_dieta": "D1",
                "alimento_g_dia": 2.5,
                "temperatura": 28,
                "humedad_ambiental": 65,
                "tiempo_desarrollo": 45,
            }
        ]
    )
    assert salida[0].proteina_harina > 0


def test_avisa_cuando_la_consulta_sale_del_estudio(modelo):
    ruta, _ = modelo
    predictor = obtener_predictor(ruta)
    salida = predictor.predecir(
        [
            {
                "tipo_dieta": "D1",
                "alimento_g_dia": 2.5,
                "temperatura": 41,
                "humedad_ambiental": 65,
                "tiempo_desarrollo": 45,
            }
        ]
    )
    assert salida[0].fuera_de_rango == ["temperatura"]


def test_faltar_una_condicion_es_un_error_claro(modelo):
    ruta, _ = modelo
    predictor = obtener_predictor(ruta)
    with pytest.raises(ValueError, match="temperatura"):
        predictor.predecir([{"tipo_dieta": "D1", "alimento_g_dia": 2.5}])


def test_sin_archivo_no_hay_predictor(tmp_path):
    """Que no haya modelo entrenado es el estado normal del proyecto hasta que
    lleguen los análisis, no una avería."""
    assert obtener_predictor(tmp_path / "no-existe.joblib") is None


def test_pocas_muestras_deja_advertencia(tmp_path):
    filas = [
        {
            "tipo_dieta": "D1",
            "alimento_g_dia": 2.0,
            "temperatura": 28,
            "humedad_ambiental": 65,
            "especie": ESPECIE_POR_DEFECTO,
            "tiempo_desarrollo": 45,
            "proteina_harina": 55 + i * 0.1,
            "lipidos_harina": 30,
        }
        for i in range(8)
    ]
    metricas = entrenar(
        pd.DataFrame(filas),
        salida=tmp_path / "m.joblib",
        n_estimators=20,
        origen_datos="prueba",
    )
    assert any("muestras" in a.lower() for a in metricas.advertencias)


def test_predictor_se_construye_desde_ruta(modelo):
    ruta, _ = modelo
    assert isinstance(obtener_predictor(ruta), Predictor)
