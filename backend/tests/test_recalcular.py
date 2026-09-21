"""Pruebas del recálculo de variables derivadas de la plantilla.

Se arma una plantilla mínima con la misma distribución de columnas que la real.
openpyxl guarda las fórmulas SIN su valor calculado, que es justo la falla que
motivó el recálculo: una plantilla guardada en un Excel que no pudo calcular
MAXIFS llegó con el tiempo de desarrollo y el alimento vacíos.
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from pathlib import Path

import pytest

openpyxl = pytest.importorskip("openpyxl")

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))

from cargar_plantilla import leer_lotes  # noqa: E402

DIA0 = datetime(2026, 6, 1)

# Columnas A..Y de "Registro de ensayos", en el orden de la plantilla real.
TITULOS = [
    "ID Ensayo", "Fecha de emergencia", "V01\nCódigo de dieta", "V02a\nCantidad",
    "V02b\nDías", "V02\nAlimento (g/día)", "Alimento total (g)", "V03\nTemperatura",
    "V04\nHumedad", "V05\nFotoperiodo", "V06a\nÁrea", "V06\nDensidad",
    "V07\nEspecie", "V08\nTiempo de desarrollo", "V09\nGrillos al inicio",
    "V10\nProteína", "V11\nLípidos", "V12\nSupervivencia", "Vivos al final",
    "V13\nLongitud final", "V14\nBiomasa", "V15\nDestino", "V16\nEtapa",
    "V17\nRequerimiento", "Observaciones",
]


def plantilla(tmp_path: Path, *, temperatura_escrita=None, texto=False, ceros_al_final=False) -> Path:
    libro = openpyxl.Workbook()
    reg = libro.active
    reg.title = "Registro de ensayos"
    reg.append(["Registro de ensayos"])
    reg.append(TITULOS)
    fila = [None] * len(TITULOS)
    # El espacio al final del identificador es a propósito: una fórmula de
    # Excel no lo empareja con "LOTE 1" y deja el lote sin datos.
    fila[0] = "LOTE 1 "
    fila[1] = DIA0
    fila[2] = "D1"
    fila[5] = "=G3/N3"          # V02: fórmula sin valor calculado
    fila[7] = temperatura_escrita if temperatura_escrita is not None else "=AVERAGEIFS(x)"
    fila[8] = "=AVERAGEIFS(x)"
    fila[9] = 12
    fila[10] = 0.05              # área del contenedor, m²
    fila[11] = "=O3/K3"
    fila[12] = "Gryllidae"
    fila[13] = "=_xludf.MAXIFS(x)"  # V08: la función que el Excel no conocía
    fila[14] = 50                # grillos al inicio
    fila[17] = "=R3"
    fila[19] = "=_xludf.MAXIFS(x)"
    reg.append(fila)

    ali = libro.create_sheet("Alimentacion")
    ali.append(["Alimentación"])
    ali.append(["ID Ensayo", "Fecha", "Día", "Alimento (g)"])
    for dia, gramos in ((0, 2), (5, 3), (10, 5)):
        ali.append(["LOTE 1", DIA0 + timedelta(days=dia), None, gramos])

    seg = libro.create_sheet("Seguimiento cada 3 dias")
    seg.append(["Seguimiento"])
    seg.append(["ID Ensayo", "Fecha", "Día"])
    medidas = [
        (0, [3.0] * 10, 0, 26.0, 70),
        (10, [4.0] * 10, 5, "28.0" if texto else 28.0, 72),
        (20, [0] * 10 if ceros_al_final else [5.0] * 10, 5, 27.0, 74),
    ]
    for dia, largos, muertes, temp, hum in medidas:
        seg.append(["LOTE 1", DIA0 + timedelta(days=dia), dia, *largos, None, muertes, None, temp, hum])

    ruta = tmp_path / "plantilla.xlsx"
    libro.save(ruta)
    return ruta


def lote(ruta: Path) -> tuple[dict, list[str]]:
    lotes, avisos = leer_lotes(ruta)
    assert len(lotes) == 1
    return lotes[0], avisos


def test_recalcula_lo_que_la_formula_no_trae(tmp_path):
    datos, _ = lote(plantilla(tmp_path))
    assert datos["id_ensayo"] == "LOTE 1"  # sin el espacio sobrante
    assert datos["tiempo_desarrollo"] == 20  # última fecha - día 0
    assert datos["alimento_g_dia"] == pytest.approx(10 / 20)  # total / días
    assert datos["temperatura"] == pytest.approx(27.0)
    assert datos["densidad"] == pytest.approx(50 / 0.05)
    assert datos["tasa_supervivencia"] == pytest.approx((50 - 10) / 50 * 100)
    assert datos["longitud_final"] == pytest.approx(5.0)


def test_cuenta_los_numeros_escritos_como_texto(tmp_path):
    datos, avisos = lote(plantilla(tmp_path, texto=True))
    # '28.0' escrito como texto entra en el promedio, que es lo correcto...
    assert datos["temperatura"] == pytest.approx(27.0)
    # ...y se avisa, porque las fórmulas de Excel lo dejan fuera.
    assert any("escritos como texto" in a for a in avisos)


def test_longitud_en_cero_no_es_una_medida(tmp_path):
    datos, avisos = lote(plantilla(tmp_path, ceros_al_final=True))
    assert datos["longitud_final"] is None
    assert any("longitudes están en 0" in a for a in avisos)


def test_respeta_lo_escrito_a_mano(tmp_path):
    datos, avisos = lote(plantilla(tmp_path, temperatura_escrita=25.0))
    assert datos["temperatura"] == 25.0
    assert any("escrito a mano" in a for a in avisos)
