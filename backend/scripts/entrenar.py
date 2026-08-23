"""Entrena el modelo desde la línea de comandos.

    # con los datos simulados, para comprobar que el pipeline corre
    python backend/scripts/entrenar.py --datos data/sintetico/experimentos_simulados.csv --simulados

    # cuando lleguen los análisis bromatológicos
    python backend/scripts/entrenar.py --datos data/experimentos.csv
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# Permite ejecutarlo como `python backend/scripts/entrenar.py` sin instalar
# el paquete.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ml.trainer import entrenar  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--datos", required=True, help="CSV de entrenamiento")
    parser.add_argument("--salida", default="backend/ml/modelo.joblib")
    parser.add_argument("--arboles", type=int, default=300)
    parser.add_argument(
        "--simulados",
        action="store_true",
        help="Marca el modelo como entrenado con datos inventados.",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(message)s")

    m = entrenar(
        datos=args.datos,
        salida=args.salida,
        n_estimators=args.arboles,
        origen_datos=args.datos,
        datos_simulados=args.simulados,
    )

    print()
    print("═" * 62)
    print(f"  Muestras usadas         {m.n_muestras}")
    print("─" * 62)
    print("  Validación cruzada  (la métrica que cuenta)")
    if m.cv_r2_proteina is not None:
        print(f"    Particiones ......... {m.cv_folds}")
        print(
            f"    R² proteína ......... {m.cv_r2_proteina:.3f}"
            f"   error medio {m.cv_mae_proteina:.2f} puntos"
        )
        print(
            f"    R² lípidos .......... {m.cv_r2_lipidos:.3f}"
            f"   error medio {m.cv_mae_lipidos:.2f} puntos"
        )
    else:
        print("    sin datos suficientes")
    print("─" * 62)
    print("  Sobre los datos de entrenamiento  (solo para detectar sobreajuste)")
    print(f"    R² proteína ......... {m.r2_entrenamiento_proteina:.3f}")
    print(f"    R² lípidos .......... {m.r2_entrenamiento_lipidos:.3f}")
    print("─" * 62)
    print("  Peso de cada variable")
    for nombre, peso in m.importancia_variables.items():
        barra = "█" * max(1, round(peso * 40))
        print(f"    {nombre:<20} {peso:>5.1%}  {barra}")
    if m.advertencias:
        print("─" * 62)
        print("  Advertencias")
        for a in m.advertencias:
            print(f"    · {a}")
    print("═" * 62)


if __name__ == "__main__":
    main()
