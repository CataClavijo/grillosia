"""Recalcula las variables derivadas de la plantilla desde sus hojas de origen.

POR QUÉ EXISTE
En la hoja "Registro de ensayos" varias variables no se escriben a mano: son
fórmulas que resumen las hojas "Alimentacion" y "Seguimiento cada 3 dias"
(la temperatura promedio, el tiempo de desarrollo, la supervivencia...).

El cargador lee el VALOR guardado de esas fórmulas, y ese valor depende del
programa con que se abrió el archivo por última vez. Ya pasó: la plantilla se
guardó en una versión de Excel que no conoce MAXIFS ni MINIFS, las fórmulas
quedaron como funciones desconocidas (`_xludf.MAXIFS`) y el tiempo de
desarrollo y el alimento por día llegaron vacíos en todos los lotes. También
aparecieron fórmulas rotas al copiar filas: una apuntaba a la fila de otro
lote y otra a una celda borrada (`#REF!`).

Este módulo no confía en ese valor guardado. Recalcula cada variable con la
MISMA definición que la fórmula de la plantilla, directamente desde los datos
de origen, y compara:

    Celda con fórmula, sin valor o con error   -> se usa el recálculo.
    Celda con fórmula que no coincide          -> se usa el recálculo, y se
                                                  avisa con los dos números.
    Número escrito a mano                      -> se respeta; solo se avisa
                                                  si difiere del recálculo.

La definición de cada variable está en `DEFINICIONES`, al lado de la fórmula
de la plantilla que reproduce. Se valida contra una plantilla cuyas fórmulas sí
tenían valor: el recálculo debe dar exactamente lo mismo.
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from statistics import mean

HOJA_RESUMEN = "Registro de ensayos"
HOJA_ALIMENTO = "Alimentacion"
HOJA_SEGUIMIENTO = "Seguimiento cada 3 dias"

#: Qué calcula cada variable, en palabras, junto a la fórmula que reproduce.
DEFINICIONES = {
    "tiempo_desarrollo": "V08 = última fecha de seguimiento - fecha de emergencia (MAXIFS - B)",
    "alimento_g_dia": "V02 = alimento total suministrado / V08 (G / N)",
    "temperatura": "V03 = promedio de la temperatura del seguimiento (AVERAGEIFS Q)",
    "humedad_ambiental": "V04 = promedio de la humedad del seguimiento (AVERAGEIFS R)",
    "densidad": "V06 = grillos al inicio / área del contenedor (O / K)",
    "tasa_supervivencia": "V12 = (inicio - muertes registradas) / inicio x 100",
    "longitud_final": "V13 = longitud promedio de los diez grillos en la última fecha",
}

#: Diferencia a partir de la cual dos números se consideran distintos. Las
#: fórmulas y este módulo redondean distinto en el último decimal; eso no es
#: una discrepancia.
TOLERANCIA = 1e-3


def _id(valor) -> str:
    """Normaliza el identificador del lote.

    "LOTE 8 " con espacio al final y "LOTE 8" son el mismo lote para una
    persona, pero no para una fórmula de Excel, que los trata como distintos
    y deja el lote sin datos. Aquí se igualan.
    """
    return " ".join(str(valor).split()) if valor is not None else ""


def _num(valor):
    if isinstance(valor, bool) or valor is None:
        return None
    if isinstance(valor, (int, float)):
        return float(valor)
    try:
        return float(str(valor).replace(",", "."))
    except ValueError:
        return None


def _fecha(valor):
    return valor if isinstance(valor, datetime) else None


def _filas_de_datos(hoja, columna_id: int = 1):
    """Filas cuyo primer campo parece un identificador de lote."""
    for fila in hoja.iter_rows(values_only=True):
        if fila and _id(fila[columna_id - 1]).upper().startswith("LOTE"):
            yield fila


def _por_lote(filas) -> dict[str, list[tuple]]:
    grupos: dict[str, list[tuple]] = {}
    for fila in filas:
        grupos.setdefault(_id(fila[0]), []).append(fila)
    return grupos


def calcular(ruta: Path) -> dict[str, dict[str, float]]:
    """Recalcula las variables derivadas de cada lote desde las hojas de origen."""
    return calcular_con_notas(ruta)[0]


def calcular_con_notas(ruta: Path) -> tuple[dict[str, dict[str, float]], dict[str, dict]]:
    """Como `calcular`, y además lo que conviene avisar de cada lote."""
    import openpyxl

    libro = openpyxl.load_workbook(ruta, data_only=True)
    # Sin las hojas de origen no hay con qué recalcular: se dejan los valores
    # tal como vienen. Pasa con plantillas viejas o reducidas.
    if not {HOJA_RESUMEN, HOJA_ALIMENTO, HOJA_SEGUIMIENTO} <= set(libro.sheetnames):
        return {}, {}
    registro = libro[HOJA_RESUMEN]
    alimento = _por_lote(_filas_de_datos(libro[HOJA_ALIMENTO]))
    seguimiento = _por_lote(_filas_de_datos(libro[HOJA_SEGUIMIENTO]))

    # Columnas de la hoja de resumen que se usan como insumo. Son fijas en la
    # plantilla: B fecha de emergencia, K área (V06a), O grillos al inicio (V09).
    resultado: dict[str, dict[str, float]] = {}
    notas: dict[str, dict] = {}
    for fila in _filas_de_datos(registro):
        lote = _id(fila[0])
        emergencia = _fecha(fila[1])
        area = _num(fila[10])
        inicio = _num(fila[14])
        v: dict[str, float] = {}

        seg = seguimiento.get(lote, [])
        fechas = [f for f in (_fecha(s[1]) for s in seg) if f]

        # V08: MAXIFS(fecha de seguimiento) - fecha de emergencia.
        if fechas and emergencia:
            v["tiempo_desarrollo"] = (max(fechas) - emergencia).days

        # V02: total suministrado (SUMIFS) / V08.
        total = [x for x in (_num(a[3]) for a in alimento.get(lote, [])) if x is not None]
        if total and v.get("tiempo_desarrollo"):
            v["alimento_g_dia"] = sum(total) / v["tiempo_desarrollo"]

        # V03 y V04: AVERAGEIFS sobre las columnas Q y R del seguimiento.
        #
        # Aquí se incluyen también los números escritos como TEXTO ('29.7'),
        # que AVERAGEIFS ignora en silencio. Son mediciones reales: dejarlas
        # fuera cambia el promedio sin que nadie lo note. Se cuentan para
        # poder avisarlo.
        temps = [x for x in (_num(s[16]) for s in seg) if x is not None]
        hums = [x for x in (_num(s[17]) for s in seg) if x is not None]
        if temps:
            v["temperatura"] = mean(temps)
        if hums:
            v["humedad_ambiental"] = mean(hums)
        texto = {
            "temperatura": sum(1 for s in seg if isinstance(s[16], str) and _num(s[16]) is not None),
            "humedad_ambiental": sum(1 for s in seg if isinstance(s[17], str) and _num(s[17]) is not None),
        }

        # V06: grillos al inicio / área del contenedor.
        if inicio and area:
            v["densidad"] = inicio / area

        # V12: (inicio - SUMIFS(mortalidad)) / inicio x 100. La plantilla solo
        # la calcula si el lote tiene al menos un registro de seguimiento.
        if inicio and seg:
            muertes = sum(x for x in (_num(s[14]) for s in seg) if x is not None)
            v["tasa_supervivencia"] = (inicio - muertes) / inicio * 100

        # V13: AVERAGEIFS del promedio de los diez grillos (columna N, que es
        # AVERAGE(D:M) de cada fila) en la última fecha de seguimiento.
        #
        # Una longitud de 0 mm no es una medida: es una fila registrada sin
        # medir, a menudo porque ya no quedaban grillos. AVERAGEIFS la
        # promediaría como si fueran grillos de cero milímetros; aquí se
        # descarta, y si la última fecha solo trae ceros la variable queda
        # vacía en lugar de valer 0.
        ceros_al_final = False
        if fechas:
            ultima = max(fechas)
            promedios = []
            for s in seg:
                if _fecha(s[1]) == ultima:
                    medidas = [x for x in (_num(c) for c in s[3:13]) if x]
                    if medidas:
                        promedios.append(mean(medidas))
                    elif any(_num(c) == 0 for c in s[3:13]):
                        ceros_al_final = True
            if promedios:
                v["longitud_final"] = mean(promedios)

        resultado[lote] = v
        notas[lote] = {"texto": texto, "ceros_al_final": ceros_al_final}
    return resultado, notas


def _celdas(ruta: Path) -> dict[str, dict[str, object]]:
    """Por lote y variable: la celda tal como está (fórmula o número escrito)."""
    import openpyxl

    from cargar_plantilla import localizar_encabezado, mapear_columnas

    hoja = openpyxl.load_workbook(ruta, data_only=False)[HOJA_RESUMEN]
    filas = list(hoja.iter_rows(values_only=True))
    inicio = localizar_encabezado(filas)
    mapa = mapear_columnas(filas[inicio])
    celdas: dict[str, dict[str, object]] = {}
    for fila in filas[inicio + 1 :]:
        registro = {col: fila[i] for i, col in mapa.items() if i < len(fila)}
        lote = _id(registro.get("id_ensayo"))
        if lote:
            celdas[lote] = registro
    return celdas


def aplicar(ruta: Path, lotes: list[dict]) -> list[str]:
    """Corrige los lotes ya leídos con el recálculo. Devuelve los avisos."""
    calculado, notas = calcular_con_notas(ruta)
    celdas = _celdas(ruta)
    avisos: list[str] = []

    for lote in lotes:
        ident = _id(lote["id_ensayo"])
        lote["id_ensayo"] = ident
        propios = calculado.get(ident, {})
        crudas = celdas.get(ident, {})
        nota = notas.get(ident, {})

        for columna, n in nota.get("texto", {}).items():
            if n:
                avisos.append(
                    f"{ident}: {n} valores de {columna} están escritos como texto en "
                    "el seguimiento, y las fórmulas de Excel los ignoran. Aquí sí se "
                    "cuentan. Conviene convertirlos a número en la plantilla."
                )
        if nota.get("ceros_al_final") and propios.get("longitud_final") is None:
            avisos.append(
                f"{ident}: en la última fecha de seguimiento las longitudes están "
                "en 0. No se toman como medida: longitud_final queda vacía."
            )
            if lote.get("longitud_final") == 0:
                lote["longitud_final"] = None

        for columna in DEFINICIONES:
            nuevo = propios.get(columna)
            guardado = lote.get(columna)
            celda = crudas.get(columna)
            es_formula = isinstance(celda, str) and celda.startswith("=")

            if nuevo is None:
                continue
            nuevo = round(nuevo, 4)
            if columna == "tiempo_desarrollo":
                nuevo = int(nuevo)

            if not es_formula and celda not in (None, ""):
                # Escrito a mano: se respeta. Si difiere, que se sepa.
                if guardado is not None and abs(guardado - nuevo) > TOLERANCIA:
                    avisos.append(
                        f"{ident}: {columna} escrito a mano = {guardado}; con los "
                        f"datos del seguimiento daría {nuevo}. Se conserva el escrito."
                    )
                continue

            if guardado is None:
                lote[columna] = nuevo
                avisos.append(
                    f"{ident}: {columna} vacío o con error en la plantilla; "
                    f"recalculado = {nuevo}."
                )
            elif abs(guardado - nuevo) > TOLERANCIA:
                lote[columna] = nuevo
                motivo = (
                    "hay valores escritos como texto que la fórmula ignora"
                    if nota.get("texto", {}).get(columna)
                    else "puede ser una fórmula rota o un archivo guardado sin recalcular"
                )
                avisos.append(
                    f"{ident}: {columna} en la plantilla = {guardado}, pero con sus "
                    f"datos de origen da {nuevo} ({motivo}). Se usa {nuevo}."
                )
    return avisos
