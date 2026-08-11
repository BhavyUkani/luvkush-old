param(
    [string]$ContainerName = "luvkush-mysql"
)

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot

Write-Host "Luv Kush Natural - Database Restore" -ForegroundColor Cyan
Write-Host "======================================"

$dockerAvailable = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)

if ($dockerAvailable) {
    $exists  = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^$ContainerName$"
    $running = docker ps --format "{{.Names}}" | Select-String -Pattern "^$ContainerName$"

    if (-not $exists) {
        Write-Host "MySQL container '$ContainerName' not found. Creating it with docker compose..." -ForegroundColor Yellow
        docker compose -f "$dir\docker-compose.yml" up -d
        Write-Host "Waiting for MySQL to start..."
        Start-Sleep -Seconds 15
    }
    elseif (-not $running) {
        Write-Host "Starting existing container '$ContainerName'..."
        docker start $ContainerName | Out-Null
        Start-Sleep -Seconds 8
    }

    Write-Host "Importing dump.sql into container '$ContainerName'..."
    cmd /c "docker exec -i $ContainerName mysql -uroot --default-character-set=utf8mb4 < `"$dir\dump.sql`""
    if ($LASTEXITCODE -ne 0) { throw "Database import failed (exit code $LASTEXITCODE)" }
    Write-Host "Database import complete." -ForegroundColor Green
}
else {
    $mysqlAvailable = $null -ne (Get-Command mysql -ErrorAction SilentlyContinue)
    if (-not $mysqlAvailable) {
        Write-Host "Neither Docker nor a local 'mysql' client was found on this PC." -ForegroundColor Red
        Write-Host "Install Docker Desktop (recommended) or MySQL, then re-run this script." -ForegroundColor Red
        exit 1
    }
    Write-Host "Docker not found, using local mysql client..." -ForegroundColor Yellow
    cmd /c "mysql -uroot --default-character-set=utf8mb4 < `"$dir\dump.sql`""
    if ($LASTEXITCODE -ne 0) { throw "Database import failed (exit code $LASTEXITCODE)" }
    Write-Host "Database import complete." -ForegroundColor Green
}

$uploadsTarget = Join-Path $dir "..\uploads"
Write-Host "Copying uploaded images to $uploadsTarget ..."
New-Item -ItemType Directory -Force -Path $uploadsTarget | Out-Null
Copy-Item -Path "$dir\uploads\*" -Destination $uploadsTarget -Recurse -Force

Write-Host ""
Write-Host "Done! Database 'luvkush_natural' and product images now match the original machine." -ForegroundColor Green
Write-Host "You can now run the backend normally (npm run dev) and it will connect to this data." -ForegroundColor Green
