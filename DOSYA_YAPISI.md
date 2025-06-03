# Dosya Yapısı ve Açıklamaları

Bu belge, Kritik Yayınları web sitesi projesinin dosya yapısını ve dosyaların işlevlerini detaylı olarak açıklar.

## Ana Dizin

- `anasayfa.html`: Sitenin ana sayfası, banner görüntüleri ve öne çıkan kitaplar burada sergilenir.
- `kitaplar.html`: Tüm kitapların listelendiği sayfa.
- `yazarlar.html`: Tüm yazarların listelendiği sayfa.
- `kitap-detay.html`: Seçilen kitabın detaylı bilgilerinin görüntülendiği sayfa.
- `yazar-detay.html`: Seçilen yazarın detaylı bilgilerinin ve kitaplarının görüntülendiği sayfa.
- `iletisim.html`: İletişim bilgilerinin ve formunun bulunduğu sayfa.
- `hakkimizda.html`: Yayınevi hakkında bilgilerin bulunduğu sayfa.
- `Kitap-Kataloğu.html`: Katalog formatında kitapların listelendiği sayfa.

## JS Dizini

- `anasayfa.js`: Ana sayfa için özel JavaScript fonksiyonları ve Supabase bağlantıları.
- `banner-display.js`: Banner görüntülerinin gösterilmesi için gerekli fonksiyonlar.
- `banners-client.js`: Banner verilerinin Supabase'den çekilmesi ve işlenmesi.
- `hakkimizda-client.js`: Hakkımızda sayfası için Supabase bağlantıları ve veri işleme.
- `iletisim-client.js`: İletişim sayfası için Supabase bağlantıları, form işleme ve veri gösterme.
- `image-scaler.js`: Görüntülerin ölçeklendirilmesi için yardımcı fonksiyonlar.
- `main.js`: Tüm sayfalarda kullanılan ana JavaScript fonksiyonları ve Supabase bağlantıları.
- `supabase-api.js`: Supabase veritabanı işlemleri için API yardımcı fonksiyonları.
- `supabase-config.js`: Supabase bağlantı konfigürasyonu ve API anahtarları.
- `supabase-realtime.js`: Supabase realtime özelliği için konfigürasyon ve fonksiyonlar.
- `supabase.js`: Supabase temel fonksiyonları ve yardımcı metodlar.

## CSS Dizini

- `style.css`: Tüm sayfalarda kullanılan genel CSS stilleri.

## Admin Dizini

### HTML Dosyaları
- `index.html`: Admin paneline giriş sayfası, kimlik doğrulama içerir.
- `kitaplar.html`: Kitapların eklenmesi, düzenlenmesi ve silinmesi için yönetim sayfası.
- `yazarlar.html`: Yazarların eklenmesi, düzenlenmesi ve silinmesi için yönetim sayfası.
- `bannerlar.html`: Banner görüntülerinin yönetimi için sayfa.
- `iletisim.html`: İletişim bilgilerinin yönetimi için sayfa.
- `hakkimizda.html`: Hakkımızda içeriğinin yönetimi için sayfa.

### JS Dizini
- `bannerlar.js`: Banner yönetimi için JavaScript fonksiyonları.
- `dashboard.js`: Admin panel ana sayfası için fonksiyonlar.
- `hakkimizda.js`: Hakkımızda içerik yönetimi için JavaScript fonksiyonları.
- `iletisim.js`: İletişim bilgileri yönetimi için JavaScript fonksiyonları.
- `image-scaler.js`: Görüntü ölçeklendirme fonksiyonları (client-side ile aynı).
- `kitaplar.js`: Kitap yönetimi için JavaScript fonksiyonları.
- `supabase-admin-api.js`: Admin paneli için Supabase API yardımcı fonksiyonları.
- `supabase-admin-realtime.js`: Admin paneli için Supabase realtime fonksiyonları.
- `supabase-admin.js`: Admin kimlik doğrulama ve temel Supabase fonksiyonları.
- `supabase-config.js`: Supabase bağlantı konfigürasyonu (client-side ile aynı).
- `yazarlar.js`: Yazar yönetimi için JavaScript fonksiyonları.

### CSS Dizini
- `admin.css`: Admin paneline özel CSS stilleri.
- `style.css`: Admin panelinde kullanılan genel CSS stilleri.

## SQL Dizini

- `create_tables.sql`: Veritabanı tablolarını oluşturmak için SQL komutları.

## Images Dizini

Kitaplar, yazarlar ve diğer görüntüler için depolama alanı.

## Veri Akışı ve Uygulama Mimarisi

1. **Kullanıcı Tarafı**:
   - Her sayfa ilgili HTML dosyasından yüklenir.
   - `main.js` genel JavaScript fonksiyonlarını ve Supabase bağlantısını sağlar.
   - Her sayfa kendi özel JavaScript dosyasını kullanarak Supabase'den veri çeker.
   - `supabase-realtime.js` veritabanındaki değişiklikleri realtime olarak dinler ve DOM'u günceller.

2. **Admin Tarafı**:
   - `index.html` üzerinden giriş yapılır ve oturum bilgisi localStorage'da saklanır.
   - Admin sayfaları, oturum kontrolü yaparak yetkisiz erişimleri engeller.
   - Her admin sayfası kendi JavaScript dosyası ile Supabase veritabanını yönetir.
   - Realtime özelliği sayesinde birden fazla admin eş zamanlı çalışabilir.

3. **Veritabanı Yapısı**:
   - `books`: Kitap bilgileri
   - `authors`: Yazar bilgileri 
   - `banners`: Banner görüntüleri ve bilgileri
   - `contact_info`: İletişim bilgileri
   - `about_us`: Hakkımızda içerikleri

4. **Güvenlik**:
   - RLS (Row Level Security) politikaları ile veritabanı erişim kontrolü sağlanır.
   - Admin girişi için özel Supabase kimlik doğrulama kullanılır. 