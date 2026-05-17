<div align="center">

<p><a href="./README.md">🇬🇧 English</a> &nbsp;|&nbsp; <a href="./README.tr.md">🇹🇷 Türkçe</a></p>

<img src="https://img.shields.io/badge/KargoGuard-AI%20Destekli%20Kargo%20Güvenliği-002E6D?style=for-the-badge&logo=shield&logoColor=white" alt="KargoGuard" height="40"/>

<br/>
<br/>

**Yapay zeka destekli kargo hasar tespit platformu — blockchain ile kanıtlanmış durum kaydı.**  
*Gerçek zamanlı analiz · Değiştirilemez kayıtlar · Çok rollü erişim*

<br/>

[![Canlı Demo](https://img.shields.io/badge/Canlı%20Demo-kargo--guard.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://kargo-guard.vercel.app)

<br/>

![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.10-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum_Sepolia-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat-square&logo=rabbitmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=flat-square&logo=redis&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## Genel Bakış

KargoGuard; bilgisayarlı görü, IoT sensör verisi ve blockchain teknolojisini bir araya getirerek kargo lojistiğindeki hasar anlaşmazlıklarını ortadan kaldırır. Her kargo, teslim alım ve teslimat anında otomatik olarak analiz edilir — hasar anında tespit edilir, sorumluluk belirlenir ve sonuç Ethereum'a değiştirilemez biçimde işlenir.

| KargoGuard Olmadan | KargoGuard ile |
|---|---|
| Manuel hasar kontrolü | Saniyeler içinde yapay zeka analizi |
| Çözülemeyen anlaşmazlıklar | Blockchain ile kanıtlanmış kayıt |
| Kaybolan evrak zinciri | Kalıcı zincir üstü kayıt |
| Geciken sorumluluk kararları | Anında otomatik karar |

---

## Özellikler

**Yapay Zeka Destekli Hasar Tespiti**  
YOLOv8 nesne tespiti ve Google Gemini görü analizi, tek bir fotoğraftan hasar türünü, şiddetini ve konumunu sınıflandırır.

**Blockchain Denetim İzi**  
Her analiz sonucu hashlenerek bir Solidity akıllı kontratı aracılığıyla Ethereum Sepolia'ya kaydedilir. Kayıtlar Etherscan üzerinden herkese açık doğrulanabilir — sonradan değiştirilemez.

**Asenkron İşlem Hattı**  
C# API işleri RabbitMQ'ya iletir. Python yapay zeka işçisi bunları bağımsız olarak tüketir ve işler; yüksek hacimde API'yi bloke etmeden çalışır.

**Çok Rollü Erişim**  
Üç farklı rol — Admin (tam dashboard), Kurye (mobil uygulama ile saha operasyonu), Müşteri (self-servis kargo takibi) — her biri kapsamlı JWT izinleriyle ayrılmıştır.

**IoT Sensör Entegrasyonu**  
Darbe anında kaydedilen G-Force sensör verisi, görsel kayıtların yanında fiziksel kanıt olarak saklanır.

---

## Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                        İSTEMCİ KATMANI                      │
│  React Dashboard (:5173)          React Native Mobil Uygulama│
└────────────────────┬────────────────────────────────────────┘
                     │ REST + JWT
┌────────────────────▼────────────────────────────────────────┐
│                    KargoGuard.API  (:5229)                   │
│              C# .NET 10  ·  Dapper  ·  Swagger              │
└──────┬────────────────────────────────────┬─────────────────┘
       │ AMQP                               │ SQL / S3
┌──────▼──────────┐              ┌──────────▼──────────────────┐
│  KargoGuard.AI  │              │  PostgreSQL  │  MinIO        │
│  Python İşçisi  │              │  (kayıtlar)  │  (görseller)  │
│  YOLOv8 + Gemini│              └─────────────────────────────┘
└──────┬──────────┘
       │ JSON-RPC
┌──────▼──────────┐
│    Ethereum     │
│  Sepolia Testnet│
│  Akıllı Kontrat │
└─────────────────┘
```

| Katman | Teknoloji |
|---|---|
| Backend API | C# .NET 10, Dapper, JWT Bearer, Swashbuckle, API Versiyonlama |
| Yapay Zeka | Python 3.10, YOLOv8, Roboflow, Google Gemini 2.5 Flash |
| Frontend | React 18, Vite, TailwindCSS, Recharts — Vercel'de yayında |
| Mobil | React Native, Expo |
| Mesaj Kuyruğu | RabbitMQ 3 |
| Veritabanı | PostgreSQL 15 |
| Nesne Depolama | MinIO (S3 uyumlu) |
| Önbellek / Güvenlik | Redis 7 — token kara liste, hız sınırı |
| Blockchain | Solidity, Hardhat, Nethereum, Ethereum Sepolia |
| Altyapı | Docker Compose, ngrok (tünel) |

---

## Başlarken

### Gereksinimler

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — çalışır durumda olmalı
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

### Hızlı Başlatma (Windows)

```bash
start-all.bat
```

Bu script dört servisi sırasıyla başlatır: Docker altyapısı → .NET API → Python yapay zeka işçisi → React dashboard.

### Manuel Başlatma

Her adımı ayrı bir terminal penceresinde çalıştırın.

**1. Altyapı**
```bash
docker-compose up -d
```

**2. API**
```bash
cd backend/KargoGuard.API
dotnet run
```

**3. Yapay Zeka İşçisi**
```bash
cd backend/KargoGuard.AI
venv\Scripts\python.exe consumer.py
```
> İlk kurulumda: `python -m venv venv && venv\Scripts\pip install -r requirements.txt`

**4. Dashboard**
```bash
cd frontend
npm install && npm run dev
```

Tüm servisler çalışmaya başladıktan sonra **http://localhost:5173** adresini açın ya da canlı demoyu **https://kargo-guard.vercel.app** adresinde ziyaret edin.

### Mobil Kurulum

Mobil uygulama API adresini ortam değişkeninden okur. Örnek dosyayı kopyalayıp adresinizi girin:

```bash
cp mobile/.env.example mobile/.env
# mobile/.env dosyasını düzenleyin — EXPO_PUBLIC_API_URL değerini girin
```

Demo için yerel API'yi ngrok ile dışarıya açın:

```bash
ngrok http --domain=mycologic-overdistantly-iva.ngrok-free.dev 5229
```

Statik domain hiç değişmez — `mobile/.env` kalıcı olarak `https://mycologic-overdistantly-iva.ngrok-free.dev` değerine ayarlı kalır.

---

## Proje Yapısı

```
KargoGuard/
├── backend/
│   ├── KargoGuard.API/          # C# .NET Web API
│   │   ├── Controllers/         # AuthController, CargoController
│   │   ├── Services/            # Auth, Blockchain, MinIO, RabbitMQ, TokenKaraListe
│   │   └── Models/
│   └── KargoGuard.AI/           # Python yapay zeka işçisi
│       ├── consumer.py          # RabbitMQ tüketici + çıkarım hattı
│       └── yolov8n.pt           # YOLOv8 model ağırlıkları
├── frontend/                    # React dashboard (Vercel'de yayında)
│   ├── .env.example             # VITE_API_URL şablonu
│   └── src/
│       ├── App.jsx              # Kimlik doğrulama + rol yönlendirme
│       └── CargoDashboard.jsx   # Admin paneli
├── mobile/                      # React Native uygulama (Expo)
│   ├── .env.example             # EXPO_PUBLIC_API_URL şablonu
│   └── config.js                # API adresini env'den okur
├── web3/                        # Solidity akıllı kontrat + Hardhat
│   └── contracts/CargoGuard.sol
└── docker-compose.yml           # PostgreSQL · RabbitMQ · MinIO · Redis
```

---

<div align="center">
  <sub>Geliştirici: <a href="https://github.com/uzunkubra50"><b>Kübra Uzun</b></a></sub>
</div>
