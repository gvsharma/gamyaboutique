#!/usr/bin/env bash
# Creates gamya_couture database/user and relies on Spring Boot Flyway for schema + seeds.
set -euo pipefail

DB_NAME="${DB_NAME:-gamya_couture}"
DB_USER="${DB_USER:-gamya}"
DB_PASSWORD="${DB_PASSWORD:-gamya_secret}"

echo "==> Ensuring PostgreSQL is running..."
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  echo "PostgreSQL is not running. Start it with: brew services start postgresql@14"
  exit 1
fi

echo "==> Creating role and database (if missing)..."
psql -h localhost -d postgres -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "==> Current tables in ${DB_NAME}:"
psql -h localhost -U "${DB_USER}" -d "${DB_NAME}" -c "\dt" || true

echo ""
echo "==> Next: run the API once so Flyway creates/updates schema:"
echo "    mvn spring-boot:run -Dspring-boot.run.profiles=local"
echo ""
echo "Then verify:"
echo "    psql -h localhost -U ${DB_USER} -d ${DB_NAME} -c \"SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;\""
echo "    curl http://localhost:8080/api/v1/products"
