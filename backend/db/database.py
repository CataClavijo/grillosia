"""Database connection setup.

La URL de la base de datos se toma de la variable de entorno
``GRILLOSIA_DATABASE_URL``. Si no esta definida, se usa el valor por defecto
``postgresql://localhost:5432/grillia`` para facilitar el desarrollo local.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get(
    "GRILLOSIA_DATABASE_URL", "postgresql://localhost:5432/grillia"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency-style helper que entrega una sesion por uso."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
