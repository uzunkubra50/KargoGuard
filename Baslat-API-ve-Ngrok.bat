@echo off
color 0B
title KargoGuard - API Baslatici (WiFi Modu)

echo ========================================================
echo        KARGO GUARD API BASLATICI (WiFi MODU)
echo ========================================================
echo.
echo [!] UYARI: Bilgisayarinizda 'ngrok' bulunamadigi icin 
echo     ozel bir 'WiFi Baglanti Modu' aktif edildi.
echo.
echo [1] KargoGuard.API baslatiliyor... (Port: 5229)
cd KargoGuard.API
start "KargoGuard API (C#)" cmd /k "dotnet run --launch-profile http"
cd ..

echo.
echo [2] TELEFON BAGLANTISI ICIN:
echo.
echo Telefonunuz ve bilgisayariniz AYNI WiFi'ye bagliysa 
echo App.js icindeki linki senin icin su adresle guncelledim:
echo.
echo 🔗 http://172.31.134.101:5229
echo.
echo Islem tamam! Uygulamayi telefonunda EXPO GO ile ac ve dene.
echo ========================================================

pause
