<div align="center">
  <h1>🚀 KargoGuard</h1>
  <p><strong>Yapay Zeka Destekli Akıllı Kargo Güvenlik ve Takip Platformu</strong></p>
</div>

<br />

KargoGuard, kargo taşıma süreçlerindeki hasarları yapay zeka ile tespit eden, Web3 teknolojileri ile şeffaf takip sağlayan ve kargo güvenliğini en üst düzeye çıkaran modern bir platformdur.

## 🌟 Öne Çıkan Özellikler

- 🧠 **Yapay Zeka Destekli Hasar Tespiti**: Kargoların fotoğrafları çekilir çekilmez yapay zeka tarafından analiz edilerek hasar durumu anında tespit edilir.
- ⛓️ **Web3 ve Akıllı Kontratlar**: Kargo durumları ve analiz sonuçları blokzinciri üzerinde değiştirilemez şekilde kayıt altına alınır.
- 📊 **Gerçek Zamanlı Dashboard**: Yönetim paneli üzerinden tüm kargolar, hasar oranları ve sistem durumu anlık olarak izlenebilir.
- 📱 **Mobil Uygulama**: Kuryeler ve müşteriler için optimize edilmiş mobil arayüz ile kolay fotoğraf yükleme ve takip.
- ⚡ **Mikroservis Mimarisi**: RabbitMQ tabanlı asenkron iletişim sayesinde yüksek performans ve kesintisiz hizmet.

---

## 🏗️ Sistem Mimarisi ve Teknolojiler

Proje, modern ve ölçeklenebilir bir mimari ile farklı teknolojileri bir araya getirmektedir:

- **Backend (API)**: C# .NET Core Web API
- **Yapay Zeka (AI)**: Python (Roboflow & Gemini Entegrasyonu)
- **Frontend (Dashboard)**: React + Vite + TailwindCSS
- **Mobil (App)**: JavaScript / React Native
- **Altyapı (Docker)**:
  - 🗄️ **PostgreSQL**: İlişkisel veritabanı yönetimi
  - 📨 **RabbitMQ**: C# ve Python servisleri arası asenkron mesajlaşma
  - ☁️ **MinIO**: Amazon S3 muadili yerel obje (fotoğraf) depolama
- **Web3**: Solidity, Hardhat

---

## 🚀 Başlangıç Rehberi (Kurulum)

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayınız.
> **DİKKAT:** İşlemlere başlamadan önce bilgisayarınızda **Docker Desktop** uygulamasının açık ve çalışır durumda olduğundan emin olun!

### 1. Altyapıyı Başlatma (Docker)
Bu adım veritabanını, mesaj kuyruğunu ve resim sunucusunu ayağa kaldırır.
```bash
docker-compose up -d
```

### 2. Merkezi API'yi Başlatma (C#)
Veritabanı ile iletişim kuran ve arayüze veri sağlayan ana yapıyı çalıştırır. Yeni bir terminalde:
```bash
cd KargoGuard.API
dotnet run
```

### 3. Yapay Zeka İşçisini Başlatma (Python)
Kargo fotoğraflarını kuyruktan alıp analiz eden Python servisini çalıştırır. Yeni bir terminalde:
```bash
cd KargoGuard.AI
venv\Scripts\python.exe consumer.py
```

### 4. Yönetim Panelini Başlatma (React)
Kargo istatistiklerini görebileceğiniz web arayüzünü başlatır. Yeni bir terminalde:
```bash
cd vite-project
npm run dev
```

Tüm servisler başarıyla ayağa kalktıktan sonra tarayıcınızdan [**http://localhost:5173**](http://localhost:5173) adresine giderek yönetim panelini kullanabilirsiniz. 🎉

---

## 🛠️ Arka Plan Yönetim Panelleri

Sistem çalışırken arka plandaki servisleri izlemek için aşağıdaki adresleri kullanabilirsiniz.

**Ortak Giriş Bilgileri:**
- **Kullanıcı Adı:** `kargo_admin`
- **Şifre:** `kargo_password`

| Servis | Adres | Açıklama |
| :--- | :--- | :--- |
| **MinIO (Bulut Depolama)** | [http://localhost:9001](http://localhost:9001) | Yüklenen fotoğrafları ve `kargo-images` bucket'ını yönetin. |
| **RabbitMQ (Mesaj Kuyruğu)** | [http://localhost:15672](http://localhost:15672) | C# ve Python arasındaki anlık mesaj trafiğini izleyin. |

---

<div align="center">
  <p>Geliştirici: <b>Kübra Uzun</b></p>
</div>
