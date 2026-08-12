# Cybersave — Full production test runner (Windows PowerShell)
# Prerequisites: Docker Desktop running, Node 20+

$ErrorActionPreference = "Stop"
$BackendDir = Join-Path $PSScriptRoot "..\backend"

Write-Host "=== Cybersave Production Test Suite ===" -ForegroundColor Cyan

Set-Location $BackendDir

Write-Host "`n[1/6] Starting Postgres + Redis..." -ForegroundColor Yellow
docker compose up -d
Start-Sleep -Seconds 8

Write-Host "`n[2/6] Running migrations..." -ForegroundColor Yellow
npm run prisma:deploy

Write-Host "`n[3/6] Seeding database..." -ForegroundColor Yellow
npm run db:seed

Write-Host "`n[4/6] Building backend..." -ForegroundColor Yellow
npm run build

Write-Host "`n[5/6] Running full platform e2e tests (28 tests)..." -ForegroundColor Yellow
npm run test:e2e -- --testPathPatterns=full-platform

Write-Host "`n[6/6] Running smoke e2e tests..." -ForegroundColor Yellow
npm run test:e2e -- --testPathPatterns=app.e2e

Set-Location (Join-Path $PSScriptRoot "..\admin")
Write-Host "`n[Admin] Production build..." -ForegroundColor Yellow
npm run build

Set-Location (Join-Path $PSScriptRoot "..\mobile")
Write-Host "`n[Mobile] Typecheck..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host "`n=== ALL TESTS COMPLETE ===" -ForegroundColor Green
