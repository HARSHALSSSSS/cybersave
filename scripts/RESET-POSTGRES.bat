@echo off
title Cybersave Postgres Reset
cd /d "%~dp0"

echo.
echo Starting Postgres password reset...
echo If a yellow/blue window asks for Administrator, click Yes.
echo.

powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0reset-postgres-password.ps1"

echo.
pause
