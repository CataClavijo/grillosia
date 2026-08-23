-- ============================================================================
-- GrillosIA · esquema de la aplicación web
--
-- Dos grupos de tablas:
--
--   1. Las cuatro que exige Auth.js (users, accounts, sessions,
--      verification_token). Los nombres de columna en comillas son
--      obligatorios: el adaptador los consulta en camelCase y Postgres
--      plegaría a minúsculas sin ellas.
--
--   2. Las del dominio (projects, chat_messages), que guardan las consultas
--      del productor y sus conversaciones.
--
-- Este esquema es independiente de la tabla `experiments` del backend, que
-- gestiona Alembic y guarda los datos de los ensayos.
--
-- Aplicar con:
--   psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================================

-- ─────────────────────────── Auth.js ───────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255),
  email           VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image           TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email);

CREATE TABLE IF NOT EXISTS accounts (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type                VARCHAR(255) NOT NULL,
  provider            VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  id_token            TEXT,
  scope               TEXT,
  session_state       TEXT,
  token_type          TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS accounts_provider_account_key
  ON accounts (provider, "providerAccountId");
CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts ("userId");

CREATE TABLE IF NOT EXISTS sessions (
  id             SERIAL PRIMARY KEY,
  "userId"       INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires        TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_key ON sessions ("sessionToken");
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions ("userId");

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  token      TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ─────────────────────────── Dominio ───────────────────────────

-- Una consulta del productor: el animal al que va destinada la harina, su
-- etapa y las condiciones de cría que indicó. Se llama `projects` en la base
-- por coherencia con el código; en la interfaz el usuario ve "consulta".
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  animal_id   TEXT,
  stage_id    TEXT,
  temp        INTEGER,
  humidity    INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_user_idx
  ON projects (user_id, updated_at DESC);

-- Los mensajes del asistente dentro de una consulta. `links` guarda los
-- accesos que el asistente ofrece con su respuesta.
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  text       TEXT NOT NULL,
  links      JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_project_idx
  ON chat_messages (project_id, created_at);

-- `updated_at` de projects se refresca solo: la lista de consultas se ordena
-- por ese campo y es fácil olvidarlo al escribir un UPDATE.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_touch_updated_at ON projects;
CREATE TRIGGER projects_touch_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
