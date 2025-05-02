#!/bin/bash
set -e

# Wait for PostgreSQL to start
echo "Waiting for PostgreSQL to start..."
until npx wait-on -t 60000 tcp:db:5432; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

echo "Migrating database..."
npx prisma migrate deploy

echo "Database initialization complete!"