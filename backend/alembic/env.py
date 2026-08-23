"""Alembic environment configuration.

Importa los modelos SQLAlchemy del proyecto para que
``alembic revision --autogenerate`` detecte cambios de esquema, y toma la URL
de la base de datos de la variable de entorno ``GRILLOSIA_DATABASE_URL``.
"""

import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# -- project imports ---------------------------------------------------
from db.models import Base  # noqa: E402  (DeclarativeBase)
# ----------------------------------------------------------------------

# Alembic Config object — da acceso a los valores del .ini.
config = context.config

# Override de sqlalchemy.url con la variable de entorno (si esta definida).
# Permite que la misma migracion se ejecute en local, CI y produccion sin
# editar el archivo .ini.
DATABASE_URL = os.environ.get(
    "GRILLOSIA_DATABASE_URL", "postgresql://localhost:5432/grillia"
)
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Configuracion de logging de Python.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata usada por autogenerate.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Genera el SQL sin conectarse a la base de datos."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Crea un Engine y ejecuta las migraciones contra la base real."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
