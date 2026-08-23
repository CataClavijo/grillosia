"""Pruebas del cargador de la plantilla de recolección.

La plantilla se llena a mano en una hoja de cálculo, así que cambia: alguien
mueve una columna, agrega una fila de encabezado, escribe un valor imposible.
El cargador tiene que aguantar eso y avisar, no romperse en silencio.
"""

from __future__ import annotations

import openpyxl
import pytest

from scripts.cargar_plantilla import (
    entrenables,
    exportar_csv,
    leer_lotes,
    revisar,
)

TITULOS = [
    "ID Ensayo",
    "Fecha de emergencia",
    "V01\nCódigo de dieta",
    "V02a\nCantidad por reposición",  # columna de apoyo: no es la variable
    "V02\nAlimento promedio (g/día)",
    "V03\nTemperatura promedio (°C)",
    "V04\nHumedad promedio (%)",
    "V07\nEspecie de grillo",
    "V08\nTiempo de desarrollo (días)",
    "V10\nProteína harina (%)",
    "V11\nLípidos harina (%)",
    "V12\nSupervivencia (%)",
    "Observaciones",
]


def _plantilla(tmp_path, filas):
    """Arma un Excel con la misma estructura que la plantilla real: dos filas
    de portada, una de grupos y luego los títulos."""
    libro = openpyxl.Workbook()
    hoja = libro.active
    hoja.title = "Registro de ensayos"

    hoja.append(["Plantilla de Recolección"])
    hoja.append(["Convocatoria Minciencias 963 de 2025"])
    hoja.append(["Identificacion", "", "V01-V02 · Dieta y alimento"])
    hoja.append(TITULOS)
    for fila in filas:
        hoja.append(fila)

    ruta = tmp_path / "plantilla.xlsx"
    libro.save(ruta)
    return ruta


def _fila(ident, dieta="D1", temp=28, hum=65, proteina=None, lipidos=None,
          superv=90):
    return [
        ident, "2026-05-31", dieta, 1, 2.5, temp, hum,
        "Acheta domesticus", 45, proteina, lipidos, superv, "",
    ]


def test_lee_los_lotes(tmp_path):
    ruta = _plantilla(tmp_path, [_fila("LOTE 1"), _fila("LOTE 2", "D2")])
    lotes, _ = leer_lotes(ruta)

    assert [l["id_ensayo"] for l in lotes] == ["LOTE 1", "LOTE 2"]
    assert lotes[0]["tipo_dieta"] == "D1"
    assert lotes[0]["temperatura"] == 28


def test_ignora_la_fila_de_grupos(tmp_path):
    """La fila que dice 'V01-V02 · Dieta y alimento' está por encima de los
    títulos y no es la fila de títulos. Confundirlas desalinea todo."""
    ruta = _plantilla(tmp_path, [_fila("LOTE 1")])
    lotes, _ = leer_lotes(ruta)
    assert lotes[0]["alimento_g_dia"] == 2.5


def test_ignora_las_columnas_de_apoyo(tmp_path):
    """'V02a' es un insumo del cálculo; la variable es 'V02'."""
    ruta = _plantilla(tmp_path, [_fila("LOTE 1")])
    lotes, _ = leer_lotes(ruta)
    assert lotes[0]["alimento_g_dia"] == 2.5


def test_salta_las_filas_en_blanco_del_final(tmp_path):
    ruta = _plantilla(
        tmp_path, [_fila("LOTE 1"), [None] * len(TITULOS), [None] * len(TITULOS)]
    )
    lotes, _ = leer_lotes(ruta)
    assert len(lotes) == 1


def test_la_especie_se_normaliza_a_familia(tmp_path):
    """Mientras la identificación taxonómica no esté cerrada, todos los
    ejemplares se reportan a nivel de familia, y se avisa."""
    ruta = _plantilla(tmp_path, [_fila("LOTE 1")])
    lotes, avisos = leer_lotes(ruta)

    assert lotes[0]["especie"] == "Gryllidae"
    assert any("Acheta domesticus" in a for a in avisos)
    assert "Acheta domesticus" in lotes[0]["observaciones"]


def test_un_lote_sin_bromatologia_no_sirve_para_entrenar(tmp_path):
    ruta = _plantilla(tmp_path, [_fila("LOTE 1")])
    lotes, _ = leer_lotes(ruta)
    assert entrenables(lotes) == []


def test_un_lote_con_bromatologia_si_sirve(tmp_path):
    ruta = _plantilla(
        tmp_path, [_fila("LOTE 1", proteina=58.0, lipidos=30.0)]
    )
    lotes, _ = leer_lotes(ruta)
    assert len(entrenables(lotes)) == 1


def test_avisa_de_una_dieta_desconocida(tmp_path):
    ruta = _plantilla(tmp_path, [_fila("LOTE 1", dieta="D9")])
    lotes, _ = leer_lotes(ruta)
    problemas = revisar(lotes)
    assert any("D9" in p for p in problemas)


def test_avisa_de_una_temperatura_fuera_del_estudio(tmp_path):
    ruta = _plantilla(tmp_path, [_fila("LOTE 1", temp=45)])
    lotes, _ = leer_lotes(ruta)
    assert any("temperatura" in p for p in revisar(lotes))


def test_avisa_de_una_supervivencia_imposible(tmp_path):
    ruta = _plantilla(tmp_path, [_fila("LOTE 1", superv=150)])
    lotes, _ = leer_lotes(ruta)
    assert any("imposible" in p for p in revisar(lotes))


def test_una_plantilla_correcta_no_deja_problemas(tmp_path):
    ruta = _plantilla(tmp_path, [_fila("LOTE 1")])
    lotes, _ = leer_lotes(ruta)
    assert revisar(lotes) == []


def test_exporta_el_csv_con_encabezado(tmp_path):
    ruta = _plantilla(tmp_path, [_fila("LOTE 1")])
    lotes, _ = leer_lotes(ruta)

    destino = tmp_path / "salida" / "experimentos.csv"
    exportar_csv(lotes, destino)

    lineas = destino.read_text(encoding="utf-8").splitlines()
    assert lineas[0].startswith("id_ensayo,tipo_dieta")
    assert lineas[1].startswith("LOTE 1,D1")


def test_una_hoja_que_no_es_la_plantilla_da_un_mensaje_claro(tmp_path):
    libro = openpyxl.Workbook()
    libro.active.title = "Otra cosa"
    ruta = tmp_path / "otro.xlsx"
    libro.save(ruta)

    with pytest.raises(SystemExit, match="Registro de ensayos"):
        leer_lotes(ruta)
