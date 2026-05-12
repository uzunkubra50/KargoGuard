<div align="center">
  <h1>KargoGuard</h1>
  <p><strong>Yapay Zeka Destekli Akıllı Kargo Güvenlik ve Takip Platformu</strong></p>
</div>

<br />

KargoGuard, kargo taşıma süreçlerindeki hasarları yapay zeka ile tespit eden, Web3 teknolojileri ile şeffaf takip sağlayan ve kargo güvenliğini en üst düzeye çıkaran modern bir platformdur.

---

## Öne Çıkan Özellikler

- **Yapay Zeka Destekli Hasar Tespiti** — Kargo fotoğrafları çekilir çekilmez YOLOv8 + Gemini ile analiz edilir.
- **Web3 ve Akıllı Kontratlar** — Kargo durumları Ethereum Sepolia üzerinde değiştirilemez şekilde kayıt altına alınır.
- **Gerçek Zamanlı Dashboard** — Admin panelinden tüm kargolar, hasar oranları ve sistem durumu anlık izlenir.
- **Mobil Uygulama** — Kuryeler ve müşteriler için React Native tabanlı saha uygulaması.
- **Mikroservis Mimarisi** — RabbitMQ tabanlı asenkron işlem hattı.

---

## Sistem Mimarisi

```
frontend (React/Vite :5173)
        │
        ▼ REST + JWT
backend/KargoGuard.API (.NET 10 :5229)
        │                │
        ▼ RabbitMQ       ▼ Dapper
backend/KargoGuard.AI   PostgreSQL (:5432)
  (Python, YOLOv8 +     MinIO (:9000)
   Gemini)
```

| Katman | Teknoloji |
|---|---|
| Backend API | C# .NET 10 |
| Yapay Zeka | Python, YOLOv8, Roboflow, Google Gemini |
| Frontend | React 18, Vite, TailwindCSS |
| Mobil | React Native / Expo |
| Veritabanı | PostgreSQL 15 |
| Mesaj Kuyruğu | RabbitMQ 3 |
| Dosya Depolama | MinIO |
| Blockchain | Solidity, Hardhat, Ethereum Sepolia |

---

## Gereksinimler

Başlamadan önce aşağıdaki araçların kurulu olması gerekmektedir:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (çalışır durumda olmalı)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

---

## Kurulum ve Başlatma

Proje kök dizinindeki `start-all.bat` dosyasını çalıştırın. Tüm servisler otomatik sırayla başlar.

```
start-all.bat
```

Servisleri tek tek başlatmak isterseniz her adımı **ayrı bir terminal penceresinde** çalıştırın.

#### 1. Altyapı Servisleri (Docker)

```bash
docker-compose up -d
```

Bu komut PostgreSQL, RabbitMQ ve MinIO konteynerlerini arka planda başlatır.

Başarı kontrolü:

```bash
docker ps
```

Üç konteynerin (kargoguard-postgres, kargoguard-rabbitmq, kargoguard-minio) `Up` durumunda olması gerekir.

#### 2. Backend API (C# .NET)

```bash
cd backend/KargoGuard.API
dotnet run
```

API `http://localhost:5229` adresinde çalışmaya başlar.  
Swagger: `http://localhost:5229/swagger`

#### 3. Yapay Zeka Servisi (Python)

```bash
cd backend/KargoGuard.AI
venv\Scripts\python.exe consumer.py
```

Servis RabbitMQ kuyruğunu dinlemeye başlar. "Waiting for messages..." mesajı görünmesi beklenir.

> **Not:** İlk kurulumda sanal ortam oluşturmak için:
> ```bash
> cd backend/KargoGuard.AI
> python -m venv venv
> venv\Scripts\pip install -r requirements.txt
> ```

#### 4. Frontend Dashboard (React)

```bash
cd frontend
npm install    # ilk kurulumda
npm run dev
```

Dashboard `http://localhost:5173` adresinde açılır.

---

## Giriş Bilgileri

| Kullanıcı | Şifre | Rol |
|---|---|---|
| `admin@kargoguard.com` | `admin123` | Admin (yönetim paneli) |
| `KRY-00142` | `kurye123` | Kurye |
| `KRY-00215` | `kurye123` | Kurye |

---

## Servis Adresleri

| Servis | Adres | Açıklama |
|---|---|---|
| Frontend Dashboard | http://localhost:5173 | Ana yönetim paneli |
| Backend API | http://localhost:5229 | REST API |
| Swagger UI | http://localhost:5229/swagger | API dokümantasyonu |
| MinIO Konsolu | http://localhost:9001 | Fotoğraf yönetimi |
| RabbitMQ Yönetimi | http://localhost:15672 | Mesaj kuyruğu izleme |

MinIO ve RabbitMQ için giriş: `kargo_admin` / `kargo_password`

---

## Sorun Giderme

**"Veri gelmiyor / 0 kayıt"**  
→ Docker servislerinin çalıştığını `docker ps` ile doğrulayın.  
→ API'nin `http://localhost:5229/swagger` adresinde açıldığını kontrol edin.

**"Şifre yanlış" / Giriş yapılamıyor**  
→ Tarayıcı konsolunda `localStorage.clear(); location.reload();` çalıştırın.

**"Port kullanımda" hatası**  
→ `start-all.bat` yerine servisleri tek tek başlatın ve hangi servisin çakıştığını bulun.

**Python "ModuleNotFoundError"**  
→ `venv\Scripts\pip install -r requirements.txt` komutuyla bağımlılıkları yükleyin.

---

<div align="center">
  <p>Geliştirici: <b>Kübra Uzun</b></p>
</div>
