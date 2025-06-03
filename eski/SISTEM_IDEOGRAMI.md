# 🏗️ KRİTİK YAYINLARI - SİSTEM İDEOGRAMI VE MİMARİ DOKUMANTTASYONU

## 📊 GENEL SİSTEM YAPISI

```
╔══════════════════════════════════════════════════════════════╗
║                    KRİTİK YAYINLARI WEB SİSTEMİ              ║
╚══════════════════════════════════════════════════════════════╝

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   KULLANICI KATMANI │    │  UYGULAMA KATMANI   │    │    VERİ KATMANI     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                          │                          │
           ▼                          ▼                          ▼

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  👤 Ziyaretçiler    │───▶│  🌐 Web Sitesi     │───▶│  🗄️ PostgreSQL     │
│  📚 Kitap Arayanlar │    │  • Ana Sayfa        │    │  • books            │
│  📖 Okuyucular      │    │  • Kitaplar         │    │  • authors          │
│                     │    │  • Yazarlar         │    │  • banners          │
└─────────────────────┘    │  • Detay Sayfaları  │    │                     │
                           └─────────────────────┘    └─────────────────────┘
                                     │                          ▲
                                     ▼                          │
┌─────────────────────┐    ┌─────────────────────┐              │
│  👨‍💼 Admin Kullanıcı │───▶│  ⚙️ Admin Paneli   │──────────────┘
│  📊 İçerik Yöneticisi│    │  • Dashboard        │
│  🔧 Sistem Yöneticisi│    │  • Kitap Yönetimi   │
│                     │    │  • Yazar Yönetimi   │
└─────────────────────┘    │  • Banner Yönetimi  │
                           │  • İstatistikler     │
                           └─────────────────────┘
```

## 🔄 VERİ AKIŞ DİYAGRAMI

```
        KULLANICI AKSİYONLARI              VERİ İŞLEME                SUPABASE OPERASYONLARI
                                                                             
┌─────────────────────┐                 ┌─────────────────────┐           ┌─────────────────────┐
│                     │                 │                     │           │                     │
│  📱 Frontend        │    HTTP/WS      │  🔄 API Layer       │   SQL     │  🗄️ Database       │
│                     │ ◀──────────────▶│                     │ ◀────────▶│                     │
│  • anasayfa.html    │                 │  • supabase-api.js  │           │  • books table      │
│  • kitaplar.html    │                 │  • main.js          │           │  • authors table    │
│  • admin/dashboard  │                 │  • sync-manager.js  │           │  • banners table    │
│                     │                 │                     │           │                     │
└─────────────────────┘                 └─────────────────────┘           └─────────────────────┘
          │                                       │                                 │
          ▼                                       ▼                                 ▼
┌─────────────────────┐                 ┌─────────────────────┐           ┌─────────────────────┐
│                     │                 │                     │           │                     │
│  🎨 UI Components   │   JavaScript    │  📡 Real-time       │  WebSocket│  🔔 Notifications   │
│                     │ ◀──────────────▶│     Subscriptions   │ ◀────────▶│                     │
│  • Book Cards       │                 │                     │           │  • INSERT events    │
│  • Author Profiles  │                 │  • Book changes     │           │  • UPDATE events    │
│  • Admin Forms      │                 │  • Author changes   │           │  • DELETE events    │
│  • Data Tables      │                 │  • Banner updates   │           │                     │
│                     │                 │                     │           │                     │
└─────────────────────┘                 └─────────────────────┘           └─────────────────────┘
```

## 🏗️ DOSYA HİYERAŞİSİ VE SORUMLULUKLAR

```
kritik-yayinlari/
├── 📁 FRONTEND (Kullanıcı Arayüzü)
│   ├── 📄 anasayfa.html              # Ana sayfa - hero slider, öne çıkan kitaplar
│   ├── 📄 kitaplar.html              # Kitap kataloğu - filtreleme, arama
│   ├── 📄 yazarlar.html              # Yazar listesi - profil kartları
│   ├── 📄 kitap-detay.html           # Kitap detayları - açıklama, yazar bilgisi
│   ├── 📄 yazar-detay.html           # Yazar profili - biyografi, kitapları
│   │
│   ├── 📁 css/                       # Stil dosyaları
│   │   ├── 🎨 main.css              # Ana stil tanımları
│   │   ├── 🎨 components.css        # Bileşen stilleri
│   │   └── 🎨 responsive.css        # Mobil uyumluluk
│   │
│   ├── 📁 js/                        # JavaScript dosyaları
│   │   ├── ⚡ main.js               # Ana uygulama mantığı
│   │   ├── 🔄 sync-manager.js       # Real-time senkronizasyon
│   │   ├── 📡 supabase-api.js       # Veritabanı işlemleri
│   │   ├── 💾 cache-manager.js      # Önbellek yönetimi
│   │   └── 🛡️ auth.js               # Kimlik doğrulama
│   │
│   ├── 📁 images/                    # Görseller
│   │   ├── 🖼️ site_resimleri/       # Kitap kapakları
│   │   ├── 👤 author_photos/        # Yazar fotoğrafları
│   │   └── 🎨 banners/              # Ana sayfa görselleri
│   │
│   └── 📁 admin/                     # Admin paneli
│       ├── 📄 index.html            # Giriş sayfası
│       ├── 📄 dashboard.html        # Ana dashboard
│       ├── 📄 kitaplar.html         # Kitap yönetimi
│       ├── 📄 yazarlar.html         # Yazar yönetimi
│       ├── 📄 bannerlar.html        # Banner yönetimi
│       │
│       ├── 📁 js/                   # Admin JavaScript
│       │   ├── ⚙️ admin.js         # Admin paneli mantığı
│       │   ├── 📊 dashboard.js      # Dashboard işlemleri
│       │   └── 🔧 crud-operations.js # CRUD işlemleri
│       │
│       └── 📁 css/                  # Admin stilleri
│           └── 🎨 admin.css         # Admin panel stilleri
│
├── 📁 BACKEND (Veri Katmanı)
│   ├── 📁 supabase/                 # Supabase konfigürasyonu
│   │   ├── 🗄️ Veritabanı.sql       # Tablo tanımları
│   │   ├── 📋 local-setup.md        # Yerel kurulum rehberi
│   │   ├── ⬆️ import_data.js        # Veri aktarım scripti
│   │   └── 🔄 update_books.sql      # Güncelleme sorguları
│   │
│   └── 📁 data/                     # JSON veri dosyaları
│       ├── 📚 books.json            # Kitap verileri
│       ├── 👤 authors.json          # Yazar verileri
│       └── 🖼️ banners.json          # Banner verileri
│
└── 📁 DOCUMENTATION (Dokümantasyon)
    ├── 📖 README.md                 # Proje açıklaması
    ├── 🧠 MEMORY_BANK.md            # Sistem bellek bankası
    ├── 🔄 SYNC_CONFIG.md            # Senkronizasyon konfigürasyonu
    └── 🏗️ SISTEM_IDEOGRAMI.md       # Bu dosya
```

## 🔗 BİLEŞEN İLİŞKİLERİ VE BAĞIMLILIKLAR

```
                           FRONTEND COMPONENTS
                           
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  📱 Web Pages   │    │  ⚙️ Admin Panel │    │  🎨 UI Elements │
    │                 │    │                 │    │                 │
    │ • Ana Sayfa     │    │ • Dashboard     │    │ • Book Cards    │
    │ • Kitap Listesi │    │ • Kitap CRUD    │    │ • Author Cards  │
    │ • Yazar Listesi │    │ • Yazar CRUD    │    │ • Search Bar    │
    │ • Detay Sayfası │    │ • Banner CRUD   │    │ • Filter Menu   │
    │                 │    │                 │    │ • Pagination    │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │   CORE SERVICES     │
                         │                     │
                         │ ⚡ Main Controller   │
                         │ 🔄 Sync Manager     │
                         │ 📡 API Manager      │
                         │ 💾 Cache Manager    │
                         │ 🛡️ Auth Manager     │
                         └─────────────────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │   DATA LAYER        │
                         │                     │
                         │ 🗄️ Supabase Client │
                         │ 📊 PostgreSQL DB   │
                         │ 📡 Real-time API    │
                         │ 🔐 Auth Service     │
                         │ 💾 Storage Bucket   │
                         └─────────────────────┘
```

## 📊 VERİ TABANI İLİŞKİ DİYAGRAMI (ERD)

```sql
    ┌─────────────────────────────────────────────────┐
    │                   AUTHORS                       │
    ├─────────────────────────────────────────────────┤
    │ 🔑 id (SERIAL PRIMARY KEY)                     │
    │ 📝 name (TEXT NOT NULL)                        │
    │ 📄 bio (TEXT)                                  │
    │ 🖼️ photo_url (TEXT)                           │
    │ 📊 book_count (INTEGER DEFAULT 0)              │
    │ 📅 created_at (TIMESTAMP)                      │
    │ 🔄 updated_at (TIMESTAMP)                      │
    └─────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
    ┌─────────────────────────────────────────────────┐
    │                    BOOKS                        │
    ├─────────────────────────────────────────────────┤
    │ 🔑 id (SERIAL PRIMARY KEY)                     │
    │ 📚 title (TEXT NOT NULL)                       │
    │ 🔗 author_id (INTEGER → AUTHORS.id)            │
    │ 📄 description (TEXT)                          │
    │ 🖼️ cover_url (TEXT)                           │
    │ 💰 price (TEXT)                               │
    │ 💰 original_price (TEXT)                      │
    │ 🏷️ discount (INTEGER)                         │
    │ 📂 category (TEXT)                            │
    │ 📅 year (INTEGER)                             │
    │ 📖 pages (INTEGER)                            │
    │ 🏢 publisher (TEXT)                           │
    │ 🌐 language (TEXT)                            │
    │ 📘 isbn (TEXT)                                │
    │ ⭐ rating (DECIMAL)                           │
    │ 💬 review_count (INTEGER)                     │
    │ 🆕 is_new (BOOLEAN)                           │
    │ 🔥 is_bestseller (BOOLEAN)                    │
    │ 📦 stock (INTEGER)                            │
    │ 📄 excerpt (TEXT)                             │
    │ 📅 created_at (TIMESTAMP)                     │
    │ 🔄 updated_at (TIMESTAMP)                     │
    └─────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────┐
    │                  BANNERS                        │
    ├─────────────────────────────────────────────────┤
    │ 🔑 id (SERIAL PRIMARY KEY)                     │
    │ 📝 title (TEXT)                                │
    │ 📝 subtitle (TEXT)                             │
    │ 📄 description (TEXT)                          │
    │ 🖼️ image_url (TEXT NOT NULL)                  │
    │ 🔗 link (TEXT)                                 │
    │ ✅ active (BOOLEAN DEFAULT true)               │
    │ 🔢 order_number (INTEGER)                      │
    │ 📅 created_at (TIMESTAMP)                      │
    │ 🔄 updated_at (TIMESTAMP)                      │
    └─────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────┐
    │               ADMIN_PROFILES                    │
    ├─────────────────────────────────────────────────┤
    │ 🔑 id (UUID → auth.users.id)                   │
    │ 👤 role (TEXT DEFAULT 'admin')                 │
    │ 🔐 permissions (JSONB)                         │
    │ 📅 created_at (TIMESTAMP)                      │
    └─────────────────────────────────────────────────┘
```

## 🔄 REAL-TIME OLAY AKIŞI

```
   ADMIN PANELİ                    SUPABASE                     WEB SİTESİ
        │                            │                            │
        │ 1️⃣ CRUD İşlemi            │                            │
        │ • Kitap Ekle              │                            │
        │ • Yazar Güncelle          │                            │
        │ • Banner Aktifleştir      │                            │
        ▼                            │                            │
   ┌──────────────┐                 │                            │
   │ Form Submit  │────────────────▶│                            │
   └──────────────┘                 │                            │
        │                           ▼                            │
        │                    ┌─────────────────┐                 │
        │                    │ 2️⃣ DB Operation │                 │
        │                    │ • INSERT        │                 │
        │                    │ • UPDATE        │                 │
        │                    │ • DELETE        │                 │
        │                    └─────────────────┘                 │
        │                           │                            │
        │                           ▼                            │
        │                    ┌─────────────────┐                 │
        │ 6️⃣ Success Message │ 3️⃣ Trigger     │                 │
        ◀───────────────────┤    Event        │                 │
        │                    └─────────────────┘                 │
        │                           │                            │
        │                           ▼                            │
        │                    ┌─────────────────┐                 │
        │                    │ 4️⃣ WebSocket    │                 │
        │                    │    Broadcast    │                 │
        │                    └─────────────────┘                 │
        │                           │                            │
        │                           ▼                            │
        │                           │                            ▼
        │                           │                    ┌─────────────────┐
        │                           │                    │ 5️⃣ UI Update    │
        │                           │                    │ • Add Card      │
        │                           └───────────────────▶│ • Update Element│
        │                                                │ • Remove Item   │
        │                                                │ • Refresh Count │
        │                                                └─────────────────┘
        │                                                        │
        │                                                        ▼
        │                                                ┌─────────────────┐
        │                                                │ 7️⃣ User Sees    │
        │                                                │    Changes      │
        │                                                │ • Real-time!    │
        │                                                └─────────────────┘
        │
        ▼
   ┌──────────────┐
   │ Next Action  │
   │ Ready        │
   └──────────────┘
```

## 🔐 GÜVENLİK KATMANLARI

```
    ┌─────────────────────────────────────────────────────────────┐
    │                    GÜVENLİK KATMANLARI                      │
    └─────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  🌐 FRONTEND    │    │  🔐 AUTH LAYER  │    │  🗄️ DATABASE   │
    │   SECURITY      │    │                 │    │   SECURITY      │
    │                 │    │ • JWT Tokens    │    │                 │
    │ • Input Valid.  │    │ • Session Mgmt  │    │ • RLS Policies  │
    │ • XSS Protection│    │ • Role Check    │    │ • Data Encrypt. │
    │ • CSRF Tokens   │    │ • Permission    │    │ • SQL Injection │
    │ • HTTPS Only    │    │   Control       │    │   Protection    │
    │                 │    │                 │    │                 │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📱 RESPONSIVE TASARIM BREAKPOINT'LERİ

```
    📱 MOBILE                    💻 TABLET                    🖥️ DESKTOP
    (320px - 767px)             (768px - 1023px)            (1024px+)
    
    ┌─────────────┐             ┌─────────────────────┐      ┌─────────────────────────────┐
    │             │             │                     │      │                             │
    │ Single      │             │ 2-Column Layout     │      │ 3-4 Column Layout           │
    │ Column      │             │                     │      │                             │
    │             │             │ ┌─────────┬─────────┐      │ ┌──────┬──────┬──────┬──────┐│
    │ ┌─────────┐ │             │ │ Content │ Content │      │ │ Card │ Card │ Card │ Card ││
    │ │ Content │ │             │ │         │         │      │ │      │      │      │      ││
    │ │         │ │             │ └─────────┴─────────┘      │ └──────┴──────┴──────┴──────┘│
    │ └─────────┘ │             │                     │      │                             │
    │             │             │ ┌─────────┬─────────┐      │ ┌──────┬──────┬──────┬──────┐│
    │ ┌─────────┐ │             │ │ Content │ Content │      │ │ Card │ Card │ Card │ Card ││
    │ │ Content │ │             │ │         │         │      │ │      │      │      │      ││
    │ │         │ │             │ └─────────┴─────────┘      │ └──────┴──────┴──────┴──────┘│
    │ └─────────┘ │             │                     │      │                             │
    │             │             └─────────────────────┘      └─────────────────────────────┘
    └─────────────┘
    
    • Stack Layout              • Grid 2x2                   • Grid 4x4
    • Touch Friendly            • Mixed Content              • Rich Content
    • Swipe Navigation          • Tablet Optimized           • Desktop Features
```

## 🚀 DEPLOYMENT PIPELINE

```
    GELIŞTIRME                    TEST                        PRODUCTION
    
    ┌─────────────────┐         ┌─────────────────┐          ┌─────────────────┐
    │ 💻 Local Dev    │         │ 🧪 Staging      │          │ 🌍 Live Site    │
    │                 │         │                 │          │                 │
    │ • localhost     │  git    │ • staging.site  │  deploy  │ • kritikyayin   │
    │ • Supabase      │ ──────▶ │ • Test DB       │ ───────▶ │   lari.com      │
    │   Local         │  push   │ • CI/CD         │  manual  │ • Production    │
    │ • Hot Reload    │         │ • Auto Tests    │          │   DB            │
    │                 │         │                 │          │ • CDN           │
    └─────────────────┘         └─────────────────┘          └─────────────────┘
             │                           │                           │
             ▼                           ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐          ┌─────────────────┐
    │ 🔧 Development  │         │ 🔍 Quality      │          │ 📊 Monitoring   │
    │ Tools           │         │ Assurance       │          │ & Analytics     │
    │                 │         │                 │          │                 │
    │ • VS Code       │         │ • Automated     │          │ • Performance   │
    │ • Git           │         │   Testing       │          │ • Error Logs    │
    │ • Node.js       │         │ • Code Review   │          │ • User Analytics│
    │ • Chrome Dev    │         │ • Performance   │          │ • Uptime        │
    │   Tools         │         │   Testing       │          │   Monitoring    │
    └─────────────────┘         └─────────────────┘          └─────────────────┘
```

## 🎯 PERFORMANS OPTİMİZASYONU STRATEJİSİ

```
                            PERFORMANS KATMANLARI
                            
    ┌─────────────────────────────────────────────────────────────┐
    │                    CLIENT-SIDE                              │
    ├─────────────────────────────────────────────────────────────┤
    │ 🖼️ Image Lazy Loading     │ 💾 Browser Caching            │
    │ 📦 Code Splitting         │ 🗜️ Asset Compression          │
    │ ⚡ Virtual Scrolling      │ 🔄 Service Worker Caching     │
    └─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   NETWORK LAYER                             │
    ├─────────────────────────────────────────────────────────────┤
    │ 🌍 CDN Distribution       │ 📡 HTTP/2 Push                │
    │ 🗜️ Gzip Compression       │ 🔐 SSL/TLS Optimization       │
    │ 📊 Request Batching       │ ⚡ Keep-Alive Connections     │
    └─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   SERVER-SIDE                               │
    ├─────────────────────────────────────────────────────────────┤
    │ 💾 Database Indexing      │ 🔄 Query Optimization          │
    │ 📊 Connection Pooling     │ 💾 Redis Caching              │
    │ 🚀 Edge Functions         │ 📈 Load Balancing             │
    └─────────────────────────────────────────────────────────────┘
```

## 📊 SİSTEM İZLEME VE ANALİTİK

```
                              MONITORING DASHBOARD
                              
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │ 👥 USER         │    │ 🏃‍♂️ PERFORMANCE  │    │ 🔧 SYSTEM       │
    │ ANALYTICS       │    │ METRICS         │    │ HEALTH          │
    │                 │    │                 │    │                 │
    │ • Page Views    │    │ • Load Time     │    │ • CPU Usage     │
    │ • User Sessions │    │ • API Response  │    │ • Memory Usage  │
    │ • Bounce Rate   │    │ • DB Queries    │    │ • Disk Space    │
    │ • Conversions   │    │ • Error Rate    │    │ • Network I/O   │
    │                 │    │                 │    │                 │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │ 📊 REPORTING        │
                         │ DASHBOARD           │
                         │                     │
                         │ • Daily Reports     │
                         │ • Weekly Summaries  │
                         │ • Monthly Analytics │
                         │ • Custom Alerts     │
                         │ • Performance KPIs  │
                         └─────────────────────┘
```

Bu kapsamlı sistem ideogramı ve mimari dokümantasyonu ile:

✅ **Proje yapısı** tamamen anlaşılabilir
✅ **Bileşen ilişkileri** net bir şekilde görülüyor  
✅ **Veri akışı** adım adım takip edilebiliyor
✅ **Güvenlik katmanları** detaylandırılmış
✅ **Performans stratejileri** belirlenmiş
✅ **Deployment süreci** tanımlanmış
✅ **İzleme ve analitik** yapısı kurgulanmış

Bu dosyalar birlikte, Kritik Yayınları projesinin tüm teknik detaylarını ve çalışma prensiplerini kapsamlı bir şekilde dokümante ediyor. 