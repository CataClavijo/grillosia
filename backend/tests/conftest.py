"""Configuración común de las pruebas.

Las pruebas se corren desde la raíz del proyecto:

    pytest backend/tests
"""

from __future__ import annotations

import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))
