#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER_NAME="${1:-luvkush-mysql}"

echo "Luv Kush Natural - Database Restore"
echo "======================================"

if command -v docker &> /dev/null; then
  if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "MySQL container '$CONTAINER_NAME' not found. Creating it with docker compose..."
    docker compose -f "$DIR/docker-compose.yml" up -d
    echo "Waiting for MySQL to start..."
    sleep 15
  elif ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Starting existing container '$CONTAINER_NAME'..."
    docker start "$CONTAINER_NAME" > /dev/null
    sleep 8
  fi

  echo "Importing dump.sql into container '$CONTAINER_NAME'..."
  docker exec -i "$CONTAINER_NAME" mysql -uroot --default-character-set=utf8mb4 < "$DIR/dump.sql"
  echo "Database import complete."
else
  if command -v mysql &> /dev/null; then
    echo "Docker not found, using local mysql client..."
    mysql -uroot --default-character-set=utf8mb4 < "$DIR/dump.sql"
    echo "Database import complete."
  else
    echo "Neither Docker nor a local mysql client was found on this PC."
    echo "Install Docker (recommended) or MySQL, then re-run this script."
    exit 1
  fi
fi

echo "Copying uploaded images..."
mkdir -p "$DIR/../uploads"
cp -r "$DIR/uploads/." "$DIR/../uploads/"

echo ""
echo "Done! Database 'luvkush_natural' and product images now match the original machine."
echo "You can now run the backend normally (npm run dev) and it will connect to this data."
