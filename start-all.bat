@echo off
title KargoGuard - Tum Servisleri Baslat
color 0A

echo ============================================
echo   KargoGuard - Servis Baslatici
echo ============================================
echo.

REM -- Docker kontrolu --
echo [1/4] Docker servisleri baslatiliyor...
docker-compose up -d
if %errorlevel% neq 0 (
    echo HATA: Docker compose calistiirilamiadi.
    echo Docker Desktop'in acik oldugunu kontrol edin.
    pause
    exit /b 1
)
echo Docker servisleri baslatildi.
echo.

REM -- Backend API --
echo [2/4] Backend API baslatiliyor...
start "KargoGuard API" cmd /k "cd /d %~dp0backend\KargoGuard.API && dotnet run"
timeout /t 3 /nobreak >nul
echo.

REM -- Python AI Worker --
echo [3/4] Yapay Zeka servisi baslatiliyor...
start "KargoGuard AI" cmd /k "cd /d %~dp0backend\KargoGuard.AI && venv\Scripts\python.exe consumer.py"
timeout /t 2 /nobreak >nul
echo.

REM -- Frontend --
echo [4/4] Frontend dashboard baslatiliyor...
start "KargoGuard Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.

echo ============================================
echo   Tum servisler baslatildi!
echo ============================================
echo.
echo   Dashboard:  http://localhost:5173
echo   API:        http://localhost:5229
echo   Swagger:    http://localhost:5229/swagger
echo   MinIO:      http://localhost:9001
echo   RabbitMQ:   http://localhost:15672
echo.
echo   Giris: admin@kargoguard.com / admin123
echo.
echo Bu pencereyi kapatin veya bir tusa basin.
pause >nul
