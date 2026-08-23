"""Pruebas del contrato de la API.

Es la frontera entre el modelo y la aplicación web. Lo que se prueba aquí es
lo que la aplicación da por hecho al dibujar el resultado en pantalla.
"""

from __future__ import annotations

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from ml.features import ESPECIE_POR_DEFECTO
from ml.trainer import entrenar

CONDICION = {
    "tipo_dieta": "D1",
    "alimento_g_dia": 2.5,
    "temperatura": 28,
    "humedad_ambiental": 65,
    "tiempo_desarrollo": 45,
}


def _datos() -> pd.DataFrame:
    base = {"D1": 55.0, "D2": 58.0, "D3": 61.0}
    return pd.DataFrame(
        [
            {
                "tipo_dieta": ["D1", "D2", "D3"][i % 3],
                "alimento_g_dia": 1 + (i % 4),
                "temperatura": 26 + (i % 5),
                "humedad_ambiental": 60 + (i % 3),
                "especie": ESPECIE_POR_DEFECTO,
                "tiempo_desarrollo": 45,
                "proteina_harina": base[["D1", "D2", "D3"][i % 3]],
                "lipidos_harina": 30.0,
                "tasa_supervivencia": 88.0,
            }
            for i in range(36)
        ]
    )


@pytest.fixture
def cliente_con_modelo(tmp_path, monkeypatch):
    ruta = tmp_path / "modelo.joblib"
    entrenar(
        _datos(),
        salida=ruta,
        n_estimators=40,
        origen_datos="prueba",
        datos_simulados=True,
    )
    monkeypatch.setenv("GRILLOSIA_MODEL_PATH", str(ruta))

    import ml.predictor as predictor_mod

    monkeypatch.setattr(predictor_mod, "RUTA_MODELO", str(ruta))

    from main import app

    return TestClient(app)


@pytest.fixture
def cliente_sin_modelo(tmp_path, monkeypatch):
    ruta = tmp_path / "no-existe.joblib"
    monkeypatch.setenv("GRILLOSIA_MODEL_PATH", str(ruta))

    import ml.predictor as predictor_mod

    monkeypatch.setattr(predictor_mod, "RUTA_MODELO", str(ruta))

    from main import app

    return TestClient(app)


def test_salud(cliente_con_modelo):
    assert cliente_con_modelo.get("/salud").json() == {"estado": "ok"}


def test_estado_del_modelo_entrenado(cliente_con_modelo):
    d = cliente_con_modelo.get("/api/v1/modelo").json()
    assert d["entrenado"] is True
    assert d["datos_simulados"] is True
    assert d["n_muestras"] == 36
    assert d["mensaje"]


def test_estado_sin_modelo_no_es_un_error(cliente_sin_modelo):
    """La aplicación consulta esto al abrir el resultado. Que no haya modelo
    es el estado normal del proyecto, así que responde 200 y lo explica."""
    r = cliente_sin_modelo.get("/api/v1/modelo")
    assert r.status_code == 200
    assert r.json()["entrenado"] is False


def test_predecir_las_tres_dietas(cliente_con_modelo):
    cuerpo = {
        "condiciones": [
            {**CONDICION, "tipo_dieta": d} for d in ("D1", "D2", "D3")
        ]
    }
    r = cliente_con_modelo.post("/api/v1/predict", json=cuerpo)
    assert r.status_code == 200

    d = r.json()
    assert [x["tipo_dieta"] for x in d["resultados"]] == ["D1", "D2", "D3"]
    for x in d["resultados"]:
        assert 0 < x["proteina_harina"] < 100
        assert x["margen_proteina"] >= 0


def test_cada_respuesta_dice_de_donde_sale(cliente_con_modelo):
    """El aviso de datos simulados viaja en la respuesta a propósito: la
    aplicación tiene que poder mostrarlo junto al número."""
    r = cliente_con_modelo.post(
        "/api/v1/predict", json={"condiciones": [CONDICION]}
    )
    modelo = r.json()["modelo"]
    assert modelo["datos_simulados"] is True
    assert modelo["origen_datos"]
    assert modelo["entrenado_en"]
    assert modelo["advertencias"]


def test_sin_modelo_responde_503_y_no_500(cliente_sin_modelo):
    """503 y no 500: no es una avería, es que esa pieza todavía no existe."""
    r = cliente_sin_modelo.post(
        "/api/v1/predict", json={"condiciones": [CONDICION]}
    )
    assert r.status_code == 503
    assert "bromatológicos" in r.json()["detail"]


def test_la_especie_tiene_valor_por_defecto(cliente_con_modelo):
    r = cliente_con_modelo.post(
        "/api/v1/predict", json={"condiciones": [CONDICION]}
    )
    assert r.status_code == 200


def test_una_condicion_imposible_se_rechaza(cliente_con_modelo):
    malo = {**CONDICION, "temperatura": 500}
    r = cliente_con_modelo.post("/api/v1/predict", json={"condiciones": [malo]})
    assert r.status_code == 422


def test_falta_un_campo_obligatorio(cliente_con_modelo):
    incompleto = {k: v for k, v in CONDICION.items() if k != "temperatura"}
    r = cliente_con_modelo.post(
        "/api/v1/predict", json={"condiciones": [incompleto]}
    )
    assert r.status_code == 422


def test_lista_vacia_se_rechaza(cliente_con_modelo):
    r = cliente_con_modelo.post("/api/v1/predict", json={"condiciones": []})
    assert r.status_code == 422


def test_avisa_cuando_la_consulta_sale_del_estudio(cliente_con_modelo):
    lejos = {**CONDICION, "temperatura": 45}
    r = cliente_con_modelo.post(
        "/api/v1/predict", json={"condiciones": [lejos]}
    )
    assert r.status_code == 200
    assert r.json()["resultados"][0]["fuera_de_rango"] == ["temperatura"]
