"""API de GrillosIA.

Sirve el modelo predictivo a la plataforma web. Se despliega aparte de la web,
que corre en Vercel y no puede ejecutar Python.
"""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import predict

app = FastAPI(
    title="GrillosIA",
    description=(
        "Modelo predictivo de composición de harina de grillo. "
        "Universidad de los Llanos · Convocatoria Minciencias 963 de 2025."
    ),
    version="0.1.0",
)

# La web vive en otro dominio, así que necesita permiso explícito. Se lee de
# una variable de entorno para no dejar dominios escritos en el código.
origenes = [
    o.strip()
    for o in os.environ.get(
        "GRILLOSIA_ALLOWED_ORIGINS",
        "http://localhost:3000,https://grillosia.com,https://www.grillosia.com",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(predict.router)


@app.get("/salud", tags=["estado"])
def salud() -> dict:
    """Comprobación de vida para el proveedor de despliegue."""
    return {"estado": "ok"}
