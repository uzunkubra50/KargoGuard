@echo off
TITLE KargoGuard - Master Runner
CHCP 65001 > nul
COLOR 0B

echo ====================================================
echo    KargoGuard - TIKLA VE CALISTIR (Full System)
echo ====================================================
echo.

echo [1/4] Docker Altyapisi Baslatiliyor (Postgres, RabbitMQ, MinIO)...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [!] HATA: Docker calismiyor olabilir! Lutfen Docker Desktop'i acin.
    pause
    exit /b
)
echo [OK] Docker Servisleri Ayakta.
echo.

echo [2/4] .NET API Servisi Baslatiliyor...
start "KargoGuard - .NET API" cmd /k "cd KargoGuard.API && dotnet run --launch-profile http"
timeout /t 5 > nul

echo [3/4] Python AI Consumer (Gemini + YOLO) Baslatiliyor...
start "KargoGuard - AI Consumer" cmd /k "cd KargoGuard.AI && .\venv\Scripts\python.exe -u consumer.py"
timeout /t 3 > nul

echo [4/4] React Frontend (Vite) Baslatiliyor...
start "KargoGuard - Frontend" cmd /k "cd vite-project && npm run dev"

echo.
echo ====================================================
echo    SISTEM BASLATILDI! 
echo    - Dashboard: http://localhost:5173
echo    - API Swagger: http://localhost:5229/swagger
echo ====================================================
echo.
echo Bu pencereyi kapatabilirsiniz, diger terminaller acik kalacaktir.
pause
