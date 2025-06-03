# 📚 KRİTİK YAYINLARI - MEMORY BANK DOKÜMANI

## 🏗️ SİSTEM MİMARİSİ

### Genel Yapı Hiyerarşisi

```
┌─────────────────────────────────────────────────────────────┐
│                    KRİTİK YAYINLARI SİSTEMİ                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   SUPABASE DB   │
                    │   (PostgreSQL)  │
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐   ┌──────────────────┐
        │   WEB SİTESİ      │   │   ADMİN PANELİ   │
        │   (Frontend)      │   │   (Backend UI)   │
        └───────────────────┘   └──────────────────┘
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐   ┌──────────────────┐
        │ • Ana Sayfa       │   │ • Kitap Yönetimi │
        │ • Kitap Listesi   │   │ • Yazar Yönetimi │
        │ • Yazar Profili   │   │ • Banner Yönetimi│
        │ • Arama/Filtre    │   │ • İstatistikler  │
        │ • Kitap Detayı    │   │ • Ayarlar        │
        └───────────────────┘   └──────────────────┘
```

## 🔄 SENKRONİZASYON AKIŞI

### Real-time Veri Güncellemesi

```
ADMİN PANELİ                    SUPABASE                    WEB SİTESİ
     │                             │                          │
     │ 1. Kitap Ekle/Düzenle      │                          │
     ├─────────────────────────────▶│                          │
     │                             │ 2. Veritabanı Güncelle  │
     │                             ├──────────────────────────▶│
     │                             │                          │ 3. Real-time Listen
     │                             │ 4. WebSocket Notification │
     │                             ├──────────────────────────▶│
     │                             │                          │ 5. UI Güncelle
     │ 6. Başarı Mesajı           │                          │
     ◀─────────────────────────────┤                          │
```

## 📊 VERİTABANI ŞEMASI

### Tablolar ve İlişkiler

```sql
-- YAZARLAR TABLOSU
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  book_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KİTAPLAR TABLOSU  
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER REFERENCES authors(id),
  description TEXT,
  cover_url TEXT,
  price TEXT,
  original_price TEXT,
  discount INTEGER,
  category TEXT,
  year INTEGER,
  pages INTEGER,
  publisher TEXT DEFAULT 'Kritik Yayınları',
  language TEXT DEFAULT 'Türkçe',
  isbn TEXT,
  rating DECIMAL,
  review_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BANNERLAR TABLOSU
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true,
  order_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 API ENDPOİNTLERİ

### Supabase API Yapısı

```javascript
// KİTAP İŞLEMLERİ
const BOOK_OPERATIONS = {
  // Tüm kitapları getir
  getAllBooks: () => supabase.from('books').select('*, authors(name)'),
  
  // Kitap ekle
  addBook: (bookData) => supabase.from('books').insert([bookData]),
  
  // Kitap güncelle
  updateBook: (id, bookData) => supabase.from('books').update(bookData).eq('id', id),
  
  // Kitap sil
  deleteBook: (id) => supabase.from('books').delete().eq('id', id),
  
  // Kategoriye göre filtrele
  getBooksByCategory: (category) => supabase.from('books').select('*').eq('category', category),
  
  // Yeni çıkanlar
  getNewBooks: () => supabase.from('books').select('*').eq('is_new', true),
  
  // Çok satanlar
  getBestsellerBooks: () => supabase.from('books').select('*').eq('is_bestseller', true)
};

// YAZAR İŞLEMLERİ
const AUTHOR_OPERATIONS = {
  // Tüm yazarları getir
  getAllAuthors: () => supabase.from('authors').select('*'),
  
  // Yazar ekle
  addAuthor: (authorData) => supabase.from('authors').insert([authorData]),
  
  // Yazar güncelle
  updateAuthor: (id, authorData) => supabase.from('authors').update(authorData).eq('id', id),
  
  // Yazarın kitaplarını getir
  getAuthorBooks: (authorId) => supabase.from('books').select('*').eq('author_id', authorId)
};

// BANNER İŞLEMLERİ
const BANNER_OPERATIONS = {
  // Aktif bannerları getir
  getActiveBanners: () => supabase.from('banners').select('*').eq('active', true).order('order_number'),
  
  // Banner ekle
  addBanner: (bannerData) => supabase.from('banners').insert([bannerData]),
  
  // Banner güncelle
  updateBanner: (id, bannerData) => supabase.from('banners').update(bannerData).eq('id', id)
};
```

## 🔄 REAL-TIME SENKRONİZASYON

### WebSocket Bağlantıları

```javascript
// Real-time dinleyiciler kurulumu
class RealtimeSync {
  constructor() {
    this.setupBookSubscription();
    this.setupAuthorSubscription();
    this.setupBannerSubscription();
  }

  // Kitap değişikliklerini dinle
  setupBookSubscription() {
    supabase
      .channel('books_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'books'
      }, (payload) => {
        console.log('Kitap değişikliği:', payload);
        this.updateBookUI(payload);
      })
      .subscribe();
  }

  // Yazar değişikliklerini dinle
  setupAuthorSubscription() {
    supabase
      .channel('authors_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'authors'
      }, (payload) => {
        console.log('Yazar değişikliği:', payload);
        this.updateAuthorUI(payload);
      })
      .subscribe();
  }

  // Banner değişikliklerini dinle
  setupBannerSubscription() {
    supabase
      .channel('banners_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'banners'
      }, (payload) => {
        console.log('Banner değişikliği:', payload);
        this.updateBannerUI(payload);
      })
      .subscribe();
  }

  // UI güncellemeleri
  updateBookUI(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch(eventType) {
      case 'INSERT':
        this.addBookToUI(newRecord);
        break;
      case 'UPDATE':
        this.updateBookInUI(newRecord);
        break;
      case 'DELETE':
        this.removeBookFromUI(oldRecord.id);
        break;
    }
  }
}

// Senkronizasyon başlat
const realtimeSync = new RealtimeSync();
```

## 📱 RESPONSIVE DİZAYN PRENSİPLERİ

### Breakpoint'ler ve Grid Sistemi

```css
/* Tailwind CSS Breakpoints */
.responsive-grid {
  /* Mobile First */
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 🎨 TASARIM SİSTEMİ

### Renk Paleti

```javascript
const DESIGN_TOKENS = {
  colors: {
    primary: '#d4af37',      // Altın sarısı (ana renk)
    secondary: '#1a1a1a',    // Koyu gri (ikincil renk)
    success: '#10B981',      // Yeşil (başarı)
    error: '#EF4444',        // Kırmızı (hata)
    background: '#ffffff',   // Beyaz (arka plan)
    text: {
      primary: '#1a1a1a',   // Ana metin
      secondary: '#6b7280'   // İkincil metin
    }
  },
  
  typography: {
    fontFamily: {
      logo: 'Pacifico',     // Logo fontu
      body: 'Inter'         // Gövde metni
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  borderRadius: {
    button: '8px',
    card: '12px',
    modal: '16px'
  }
};
```

## 🔐 GÜVENLİK YÖNETİMİ

### Admin Authentication

```javascript
// Admin giriş kontrolü
class AdminAuth {
  constructor() {
    this.checkAuthStatus();
  }

  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) throw error;
      
      // Admin rolü kontrolü
      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();
      
      if (profile?.role === 'admin') {
        this.redirectToDashboard();
        return { success: true };
      } else {
        throw new Error('Yetkisiz erişim');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  }

  checkAuthStatus() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        // Giriş sayfasına yönlendir (admin sayfası değilse)
        if (window.location.pathname.includes('/admin/') && 
            !window.location.pathname.includes('index.html')) {
          window.location.href = 'index.html';
        }
      }
    });
  }
}
```

## 📊 PERFORMANS OPTİMİZASYONU

### Lazy Loading ve Caching

```javascript
// Görsel lazy loading
class ImageLazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src]');
    this.imageObserver = new IntersectionObserver(this.onIntersection.bind(this));
    this.init();
  }

  init() {
    this.images.forEach(img => this.imageObserver.observe(img));
  }

  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        this.imageObserver.unobserve(img);
      }
    });
  }
}

// Veri cache yönetimi
class DataCache {
  constructor() {
    this.cache = new Map();
    this.expireTime = 5 * 60 * 1000; // 5 dakika
  }

  set(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.expireTime) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}
```

## 🔄 DEPLOYMENT AKIŞI

### Canlı Yayına Alma Süreci

```
1. GELIŞTIRME ORTAMI
   ├── Yerel Supabase (Docker)
   ├── Test verileri
   └── Geliştirme sunucusu (localhost:8080)

2. STAGING ORTAMI  
   ├── Supabase Staging Project
   ├── Test domain (staging.kritikyayinlari.com)
   └── Production benzeri veriler

3. PRODUCTION ORTAMI
   ├── Supabase Production Project
   ├── Ana domain (kritikyayinlari.com)
   ├── CDN (Cloudflare)
   └── SSL Sertifikası

DEPLOYMENT KOMUTLARI:
├── git push origin main
├── supabase db push --linked
├── npm run build
└── netlify deploy --prod
```

## 📈 ANALİTİK VE İZLEME

### Kullanıcı Davranışı Takibi

```javascript
// Google Analytics 4 entegrasyonu
class Analytics {
  constructor() {
    this.initGA4();
    this.trackPageViews();
    this.trackBookViews();
    this.trackSearches();
  }

  trackBookView(bookId, bookTitle) {
    gtag('event', 'view_item', {
      currency: 'TRY',
      value: 1,
      items: [{
        item_id: bookId,
        item_name: bookTitle,
        category: 'Kitap',
        quantity: 1
      }]
    });
  }

  trackSearch(searchTerm, resultCount) {
    gtag('event', 'search', {
      search_term: searchTerm,
      search_results: resultCount
    });
  }

  trackAuthorView(authorId, authorName) {
    gtag('event', 'view_item', {
      item_category: 'Yazar',
      item_id: authorId,
      item_name: authorName
    });
  }
}
```

## 🚀 ÖZELLİK ROADMAP'İ

### Gelecek Geliştirmeler

```
PHASE 1 (Tamamlandı)
├── ✅ Temel web sitesi
├── ✅ Admin paneli
├── ✅ Supabase entegrasyonu
└── ✅ Responsive tasarım

PHASE 2 (Geliştirilmekte)
├── 🔄 E-ticaret entegrasyonu
├── 🔄 Ödeme sistemi
├── 🔄 Kullanıcı hesapları
└── 🔄 Sipariş takibi

PHASE 3 (Planlanıyor)
├── 📋 Kitap yorumları ve değerlendirmeler
├── 📋 Wishlist (İstek listesi)
├── 📋 Newsletter sistemi
└── 📋 Sosyal medya entegrasyonu

PHASE 4 (Gelecek)
├── 💭 AI kitap önerileri
├── 💭 Chatbot desteği
├── 💭 Mobil uygulama
└── 💭 Çoklu dil desteği
```

## 🛠️ SORUN GİDERME KILAVUZU

### Sık Karşılaşılan Problemler

```
1. SUPABASE BAĞLANTI SORUNU
   ├── Çözüm: API anahtarlarını kontrol et
   ├── Çözüm: URL doğruluğunu kontrol et
   └── Çözüm: Network bağlantısını kontrol et

2. REAL-TIME GÜNCELLEME ÇALIŞMIYOR
   ├── Çözüm: WebSocket bağlantısını kontrol et
   ├── Çözüm: RLS politikalarını kontrol et
   └── Çözüm: Subscription'ları yeniden başlat

3. ADMIN PANELİ ERİŞİM SORUNU
   ├── Çözüm: Kimlik doğrulama kontrolü
   ├── Çözüm: Session durumu kontrolü
   └── Çözüm: Admin rolü kontrolü

4. GÖRSEL YÜKLEME SORUNU
   ├── Çözüm: Dosya boyutu kontrolü
   ├── Çözüm: Dosya formatı kontrolü
   └── Çözüm: Storage bucket izinleri
```

## 📞 DESTEK VE DOKÜMANTASYON

### Faydalı Linkler

- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [Tailwind CSS Referansı](https://tailwindcss.com/docs)
- [JavaScript ES6+ Referansı](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [PostgreSQL Dokümantasyonu](https://www.postgresql.org/docs/)

### İletişim

- **Geliştirici**: Kritik Yayınları Web Ekibi
- **E-posta**: dev@kritikyayinlari.com
- **Proje Deposu**: GitHub/kritik-yayinlari

---

*Bu doküman sürekli güncellenmektedir. Son güncelleme: 2025* 