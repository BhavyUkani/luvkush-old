# Database Seed / Transfer Kit

This folder is a complete snapshot of the live `luvkush_natural` MySQL database
(all 22 tables, every row) plus the uploaded product/category images, so you can
recreate the exact same data on another PC.

## What's in here

- `dump.sql` — full database export (schema + data, generated with `mysqldump`)
- `uploads/` — copy of `backend/uploads` (product, category, hair-solution images)
- `docker-compose.yml` — spins up a MySQL 8.0 container identical to the dev one
- `restore.ps1` — Windows (PowerShell) restore script
- `restore.sh` — Mac/Linux/Git-Bash restore script

## How to use on the other PC

1. Copy this whole `luvkush-old` project folder (or at least `backend/seed/`)
   to the other PC.
2. Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   is installed and running. (If you don't want Docker, a local MySQL 8 install
   with an empty root password also works — the script auto-detects either.)
3. Open a terminal in `backend/seed/` and run:

   **Windows (PowerShell):**
   ```powershell
   .\restore.ps1
   ```

   **Mac/Linux/Git Bash:**
   ```bash
   ./restore.sh
   ```

That single command will:
- Create (or reuse) a `luvkush-mysql` Docker container with database `luvkush_natural`
- Import all the data from `dump.sql`
- Copy the images from `uploads/` into `backend/uploads/`

4. Make sure `backend/.env` on the new PC has the same DB settings as this project:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=luvkush_natural
   DB_USER=root
   DB_PASS=
   ```
5. Run the backend as usual (`npm run dev` inside `backend/`) — it will connect
   to this restored data automatically.

## Re-generating this snapshot later

If you make more changes and want to refresh this snapshot, run from the project root:

```bash
docker exec luvkush-mysql mysqldump -uroot --databases luvkush_natural \
  --routines --triggers --events \
  --single-transaction --set-gtid-purged=OFF \
  --add-drop-database --add-drop-table \
  --complete-insert --default-character-set=utf8mb4 \
  > backend/seed/dump.sql
```

and re-copy `backend/uploads` into `backend/seed/uploads`.
