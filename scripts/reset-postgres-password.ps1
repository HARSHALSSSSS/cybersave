$ErrorActionPreference = "Continue"

function Pause-End {
  Write-Host ""
  Write-Host "Window will stay open. Read the message above." -ForegroundColor Yellow
  Read-Host "Press Enter to close"
}

try {
  $PgHba = "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
  $Psql  = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
  $NewPassword = "cybersave123"
  $DbName = "cybersave"

  Write-Host ""
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host " Cybersave Postgres password reset"
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "New password will be: $NewPassword" -ForegroundColor Yellow
  Write-Host ""

  $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
  )
  if (-not $isAdmin) {
    Write-Host "ERROR: This must run as Administrator." -ForegroundColor Red
    Write-Host "Right-click RESET-POSTGRES.bat -> Run as administrator" -ForegroundColor Yellow
    Pause-End
    exit 1
  }

  if (-not (Test-Path $PgHba)) {
    Write-Host "ERROR: Postgres config not found:" -ForegroundColor Red
    Write-Host $PgHba
    Pause-End
    exit 1
  }
  if (-not (Test-Path $Psql)) {
    Write-Host "ERROR: psql not found:" -ForegroundColor Red
    Write-Host $Psql
    Pause-End
    exit 1
  }

  Write-Host "[1/5] Backing up pg_hba.conf..."
  Copy-Item $PgHba "$PgHba.bak-cybersave" -Force

  Write-Host "[2/5] Allowing local login without old password..."
  $hba = Get-Content $PgHba
  $hba = $hba -replace 'scram-sha-256', 'trust'
  $hba = $hba -replace '\bmd5\b', 'trust'
  Set-Content $PgHba $hba

  Write-Host "[3/5] Restarting PostgreSQL service..."
  Restart-Service postgresql-x64-16 -ErrorAction Stop
  Start-Sleep -Seconds 4

  Write-Host "[4/5] Setting new password and creating database..."
  & $Psql -U postgres -h 127.0.0.1 -d postgres -c "ALTER USER postgres WITH PASSWORD '$NewPassword';"
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to change postgres password"
  }

  & $Psql -U postgres -h 127.0.0.1 -d postgres -c "SELECT 'CREATE DATABASE $DbName' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DbName')\gexec"

  Write-Host "[5/5] Restoring password login..."
  Copy-Item "$PgHba.bak-cybersave" $PgHba -Force
  Restart-Service postgresql-x64-16 -ErrorAction Stop
  Start-Sleep -Seconds 4

  $EnvFile = Join-Path $PSScriptRoot "..\backend\.env"
  if (Test-Path $EnvFile) {
    $content = Get-Content $EnvFile -Raw
    $newUrl = "DATABASE_URL=postgresql://postgres:$NewPassword@localhost:5432/$DbName" + "?schema=public"
    if ($content -match 'DATABASE_URL=.*') {
      $content = $content -replace 'DATABASE_URL=.*', $newUrl
    } else {
      $content += "`r`n$newUrl`r`n"
    }
    Set-Content -Path $EnvFile -Value $content -NoNewline
    Write-Host "Updated backend\.env" -ForegroundColor Green
  }

  Write-Host ""
  Write-Host "DONE" -ForegroundColor Green
  Write-Host "Username : postgres"
  Write-Host "Password : $NewPassword"
  Write-Host "Database : $DbName"
  Write-Host ""
  Write-Host "Next commands:"
  Write-Host "  cd c:\cybersave\backend"
  Write-Host "  npm run prisma:deploy"
  Write-Host "  npm run db:seed"
  Write-Host "  npm run start:dev"
}
catch {
  Write-Host ""
  Write-Host "FAILED" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ""
  Write-Host "Full error:" -ForegroundColor DarkRed
  Write-Host $_
}

Pause-End
