"""Actualiza todo a partir de la plantilla de recolección, en un solo paso.

Es lo que se corre cada vez que llega una plantilla nueva del laboratorio:

    python backend/scripts/actualizar.py --excel "Plantilla_recoleccion.xlsx"

Hace, en orden:

    1. Lee y valida la plantilla, y deja el CSV consolidado
       (data/experimentos.csv).
    2. Genera el anexo de la base de datos en Excel
       (entregables/base-datos-consolidada.xlsx).
    3. Si ya hay lotes con proteína y lípidos medidos, entrena un modelo
       CANDIDATO con esos datos reales y muestra sus métricas.
    4. Corre las pruebas automáticas.

El candidato NO reemplaza al modelo en uso. Eso solo pasa con `--publicar`, y a
propósito: un modelo entrenado con pocos lotes reales puede ser peor que no
tener ninguno, y esa decisión la toma una persona mirando las métricas, no un
script. Mientras no se publique, la plataforma sigue diciendo que opera con
datos simulados, que es la verdad.

Después de publicar hay que subir el servicio para que el cambio llegue a la
plataforma (ver docs/manual-tecnico.md):

    railway up --ci --service grillosia-api
"""

from __future__ import annotations

import argparse
import csv
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ_BACKEND = Path(__file__).resolve().parents[1]
RAIZ = RAIZ_BACKEND.parent
if str(RAIZ_BACKEND) not in sys.path:
    sys.path.insert(0, str(RAIZ_BACKEND))

from cargar_plantilla import entrenables, exportar_csv, leer_lotes, revisar  # noqa: E402
from exportar_anexo import generar as generar_anexo  # noqa: E402
from ml.trainer import MINIMO_PARA_CONFIAR, entrenar  # noqa: E402

CSV_CONSOLIDADO = RAIZ / "data" / "experimentos.csv"
CSV_ENTRENAMIENTO = RAIZ / "data" / "entrenamiento.csv"
ANEXO = RAIZ / "entregables" / "base-datos-consolidada.xlsx"
MODELO = RAIZ_BACKEND / "ml" / "modelo.joblib"
CANDIDATO = RAIZ_BACKEND / "ml" / "modelo-candidato.joblib"


def titulo(texto: str) -> None:
    print(f"\n{texto}\n{'─' * len(texto)}")


def paso_plantilla(excel: Path) -> list[dict]:
    titulo("1. Plantilla de recolección")
    lotes, avisos = leer_lotes(excel)
    if not lotes:
        raise SystemExit("La plantilla no tiene ningún lote registrado.")
    exportar_csv(lotes, CSV_CONSOLIDADO)
    print(f"  Lotes leídos: {len(lotes)}")
    print(f"  CSV consolidado: {CSV_CONSOLIDADO.relative_to(RAIZ)}")
    for aviso in avisos:
        print(f"  Aviso: {aviso}")
    for problema in revisar(lotes):
        print(f"  Revisar: {problema}")
    return lotes


def paso_anexo() -> None:
    titulo("2. Anexo de la base de datos")
    completitud = generar_anexo(CSV_CONSOLIDADO, ANEXO)
    print(f"  Generado: {ANEXO.relative_to(RAIZ)}")
    faltantes = [f"{c[0]} ({c[5].lower()})" for c in completitud if c[5] not in ("Completa", "No aplica a la cría")]
    if faltantes:
        print(f"  Variables incompletas: {', '.join(faltantes)}")


def paso_modelo(lotes: list[dict], publicar: bool) -> None:
    titulo("3. Modelo")
    listos = entrenables(lotes)
    print(f"  Lotes con proteína y lípidos medidos: {len(listos)} de {len(lotes)}")

    if not listos:
        print(
            "  Todavía no se puede entrenar con datos reales: faltan los "
            "resultados del análisis bromatológico.\n"
            "  El modelo en uso no se toca y sigue marcado como entrenado con "
            "datos simulados."
        )
        if publicar:
            print("  --publicar no tiene efecto: no hay candidato que publicar.")
        return

    # Solo los lotes completos: el entrenador descarta los demás de todas
    # formas, pero así el archivo deja constancia de con qué se entrenó.
    exportar_csv(listos, CSV_ENTRENAMIENTO)
    m = entrenar(
        datos=CSV_ENTRENAMIENTO,
        salida=CANDIDATO,
        origen_datos=str(CSV_ENTRENAMIENTO.relative_to(RAIZ)),
        datos_simulados=False,
    )
    print(f"  Candidato entrenado con {m.n_muestras} lotes reales: {CANDIDATO.relative_to(RAIZ)}")
    if m.cv_r2_proteina is not None:
        print(
            f"  Validación cruzada: R² proteína {m.cv_r2_proteina:.3f} "
            f"(error medio {m.cv_mae_proteina:.2f} puntos), "
            f"R² lípidos {m.cv_r2_lipidos:.3f} (error medio {m.cv_mae_lipidos:.2f})"
        )
    else:
        print("  Validación cruzada: no hay lotes suficientes para calcularla.")
    for advertencia in m.advertencias:
        print(f"  Advertencia: {advertencia}")

    if m.n_muestras < MINIMO_PARA_CONFIAR:
        print(
            f"  Con menos de {MINIMO_PARA_CONFIAR} lotes las métricas son poco "
            "fiables. Publicar este candidato debe decidirse con cuidado."
        )

    if publicar:
        shutil.copyfile(CANDIDATO, MODELO)
        print(f"  Publicado: reemplaza a {MODELO.relative_to(RAIZ)}.")
        print("  Falta subir el servicio: railway up --ci --service grillosia-api")
    else:
        print("  No se publicó. Para reemplazar el modelo en uso: --publicar")


def paso_pruebas() -> bool:
    titulo("4. Pruebas automáticas")
    r = subprocess.run(
        [sys.executable, "-m", "pytest", "-q"],
        cwd=RAIZ_BACKEND,
        capture_output=True,
        text=True,
    )
    ultima = (r.stdout.strip().splitlines() or ["(sin salida)"])[-1]
    print(f"  {ultima}")
    return r.returncode == 0


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--excel", required=True, help="Plantilla de recolección")
    p.add_argument(
        "--publicar",
        action="store_true",
        help="Reemplaza el modelo en uso por el candidato entrenado con datos reales.",
    )
    p.add_argument("--sin-pruebas", action="store_true", help="No corre las pruebas al final.")
    args = p.parse_args()

    excel = Path(args.excel)
    if not excel.exists():
        raise SystemExit(f"No existe el archivo: {excel}")

    lotes = paso_plantilla(excel)
    paso_anexo()
    paso_modelo(lotes, args.publicar)
    bien = True if args.sin_pruebas else paso_pruebas()
    print()
    sys.exit(0 if bien else 1)


if __name__ == "__main__":
    main()
