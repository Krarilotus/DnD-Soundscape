@echo off
setlocal
title DnD-Soundscape Audio Manager v1.0.0

cd /d "%~dp0"

echo ======================================================================
echo   DnD-Soundscape - Adventure Audio Management System (v1.0.0)
echo   Published by Krarilotus
echo ======================================================================
echo.

:: Check for Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Python 3 wurde nicht gefunden. Bitte installiere Python oder starte mit einem beliebigen Webserver.
    echo Versuche Fallback mit Windows Edge / Default Browser direkt auf index.html...
    start "" index.html
    pause
    exit /b 1
)

:: Start browser after short delay
start "" cmd /c "timeout /t 1 /nobreak >nul && start http://localhost:8777"

:: Start threaded range server
python tools\serve.py 8777

pause
