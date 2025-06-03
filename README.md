# Kritik Yayınları Web Sitesi

Bu proje, Kritik Yayınları için geliştirilen web sitesinin kaynak kodlarını içermektedir. Bu temiz kopyada, gereksiz dosyalar çıkarılmış, proje yapısı sadeleştirilmiştir.

## Proje Yapısı

```
Kritik/
├── admin/                # Admin paneli dosyaları
│   ├── css/              # Admin panel stil dosyaları
│   ├── js/               # Admin panel JavaScript dosyaları
│   └── *.html            # Admin panel sayfaları
├── css/                  # Web sitesi stil dosyaları
├── images/               # Resim dosyaları
├── js/                   # JavaScript dosyaları
├── sql/                  # SQL şema dosyaları
└── *.html                # Web sitesi sayfaları
```

## Sayfalar

### Kullanıcı Sayfaları
- `anasayfa.html` - Ana sayfa
- `kitaplar.html` - Kitaplar listesi
- `yazarlar.html` - Yazarlar listesi
- `kitap-detay.html` - Kitap detay sayfası
- `yazar-detay.html` - Yazar detay sayfası
- `iletisim.html` - İletişim sayfası
- `hakkimizda.html` - Hakkımızda sayfası
- `Kitap-Kataloğu.html` - Kitap kataloğu sayfası

### Admin Sayfaları
- `admin/login.html` - Admin giriş sayfası
- `admin/reset-password.html` - Şifre sıfırlama sayfası
- `admin/index.html` - Admin dashboard sayfası
- `admin/kitaplar.html` - Kitap yönetimi
- `admin/yazarlar.html` - Yazar yönetimi
- `admin/bannerlar.html` - Banner yönetimi
- `admin/iletisim.html` - İletişim bilgileri yönetimi
- `admin/hakkimizda.html` - Hakkımızda içerik yönetimi
- `admin/kullanicilar.html` - Admin kullanıcıları yönetimi

## Admin Özellikleri

### Oturum Yönetimi
- Güvenli login sayfası
- Oturum kontrolü ve doğrulama
- Şifre sıfırlama
- Magic link ile giriş
- Çıkış yapma

### Admin Kullanıcı Yönetimi
- Admin kullanıcıları listeleme
- Yeni admin ekleme
- Admin kullanıcılarını düzenleme
- Admin kullanıcılarını silme
- Şifre sıfırlama bağlantısı gönderme

### İçerik Yönetimi
- LocalStorage tabanlı içerik kayıt desteği
- Çevrimdışı çalışabilme desteği

## Veritabanı

Proje Supabase üzerinde PostgreSQL veritabanı kullanmaktadır. Veritabanı tabloları:

- `books` - Kitaplar tablosu
- `authors` - Yazarlar tablosu
- `banners` - Banner görselleri tablosu
- `admin_users` - Admin kullanıcıları tablosu
- `contact` - İletişim bilgileri tablosu
- `about` - Hakkımızda içeriği tablosu

## Teknolojiler

- HTML5, CSS3, JavaScript
- TailwindCSS (Stil kütüphanesi)
- RemixIcon (İkon kütüphanesi)
- Supabase (Backend ve Auth)
- PostgreSQL (Veritabanı)

## Kurulum Talimatları

### Yerel Geliştirme Ortamı Kurulumu

1. Projeyi indirin ve bir klasöre çıkarın
2. Basit bir HTTP sunucusu başlatın (örneğin VS Code ile Live Server eklentisi kullanabilirsiniz)
3. Tarayıcınızda `http://localhost:5500` adresini açın (port numarası kullandığınız sunucuya göre değişebilir)
4. Çevrimdışı modda test için admin paneline `admin/kritik2023` kullanıcı adı ve şifresiyle giriş yapabilirsiniz

### Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun ve veritabanı bilgilerini not alın
3. SQL editörünü açın ve `sql/` klasöründeki SQL dosyalarını sırasıyla çalıştırın:
   - Önce tablo oluşturma scriptlerini çalıştırın
   - Ardından RLS (Row Level Security) politikalarını çalıştırın
4. Authentication > Settings bölümünde:
   - Email auth'u etkinleştirin
   - Site URL'i düzenleyin (örn: `https://kritikyayinlari.com`)
   - Redirect URL'leri ekleyin (örn: `https://kritikyayinlari.com/admin/reset-password.html`)

### Supabase Bağlantısı Yapılandırma

1. `js/supabase-config.js` dosyasını açın
2. Supabase proje URL'nizi ve anonim anahtarınızı güncelleyin:
   ```javascript
   const SUPABASE_URL = 'https://sizin-proje-id.supabase.co';
   const SUPABASE_ANON_KEY = 'sizin-anonim-anahtar';
   ```

### Canlı Sunucuya Yükleme

1. FTP istemcisi kullanarak tüm dosyaları web sunucunuza yükleyin
2. Sunucunuzda `.htaccess` dosyası oluşturarak HTTPS yönlendirmesini yapılandırın:
   ```
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

## Domain ve Supabase Entegrasyonu

### Özel Domain Ayarları

1. Domain sağlayıcınızın DNS yönetim paneline gidin
2. Web sitesi için A kaydı ekleyin:
   - Host: `@` veya `www`
   - IP: Web sunucunuzun IP adresi
3. Supabase için CNAME kaydı ekleyin:
   - Host: `supabase` (veya tercihinize göre alt domain)
   - Hedef: `sizin-proje-id.supabase.co`

### Supabase Auth Yapılandırması

1. Supabase projenizin Dashboard'una gidin
2. Authentication > Settings > URL Configuration bölümünde:
   - Site URL: `https://kritikyayinlari.com`
   - Redirect URLs:
     - `https://kritikyayinlari.com/admin/login.html`
     - `https://kritikyayinlari.com/admin/reset-password.html`

### Email Servis Ayarları

1. Supabase projesinde Authentication > Email Templates bölümüne gidin
2. Email şablonlarını özelleştirin:
   - Gönderen adı: "Kritik Yayınları"
   - Magic Link ve Şifre Sıfırlama e-postalarını Türkçeye çevirin
   - Şirket logosu ve renklerini ekleyin

### SSL Sertifikası

1. Sunucunuzda Let's Encrypt veya başka bir SSL sağlayıcısından sertifika alın
2. Web sunucunuzu SSL sertifikasını kullanacak şekilde yapılandırın
3. Periyodik olarak sertifikanın yenilenmesini sağlayın

## Çalışma Modları

Sistem iki modda çalışabilir:

1. **Çevrimiçi Mod**: Supabase veritabanı bağlantısı ile çalışır, tüm veriler bulut tabanlı veritabanında saklanır
2. **Çevrimdışı Mod**: LocalStorage kullanarak yerel olarak çalışır, demo kullanıcı (admin/kritik2023) ile giriş yapılabilir

## Güvenlik

Gerçek bir üretim ortamına geçmeden önce:

1. API anahtarlarını güvenli şekilde yönetin
2. RLS (Row Level Security) politikalarını düzgün şekilde yapılandırın
3. Üretim sürümünde tüm JS dosyalarını sıkıştırın ve minimize edin
4. HTTPS protokolü kullanın ve güvenlik başlıklarını yapılandırın
5. Kullanıcı şifreleri için güçlü şifreleme ve doğrulama kuralları uygulayın

## İletişim

Bu projeyle ilgili sorularınız için Kritik Yayınları ile iletişime geçebilirsiniz. 