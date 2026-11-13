@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"
if not exist ssl mkdir ssl

set "OPENSSL_CMD="
where openssl >nul 2>nul
if %errorlevel% equ 0 (
    set "OPENSSL_CMD=openssl"
) else if exist "C:\Program Files\Git\usr\bin\openssl.exe" (
    set "OPENSSL_CMD=C:\Program Files\Git\usr\bin\openssl.exe"
) else if exist "%LOCALAPPDATA%\Programs\Git\usr\bin\openssl.exe" (
    set "OPENSSL_CMD=%LOCALAPPDATA%\Programs\Git\usr\bin\openssl.exe"
)

if defined OPENSSL_CMD (
    echo [INFO] Generating valid SSL certificate with OpenSSL using ssl/openssl.cnf...
    "%OPENSSL_CMD%" req -x509 -nodes -days 365 -newkey rsa:2048 -config ssl\openssl.cnf -keyout ssl\server.key -out ssl\server.crt
    goto :done
)

echo [INFO] Using Docker alpine/openssl...
docker run --rm -v "%cd%\ssl:/ssl" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -config /ssl/openssl.cnf -keyout /ssl/server.key -out /ssl/server.crt

:done
echo [OK] SSL certificate successfully generated in ssl/ directory.
endlocal
