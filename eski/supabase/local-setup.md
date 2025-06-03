# Kritik Yayınları - Supabase Localhost Kurulum Kılavuzu

Bu kılavuz, Kritik Yayınları web sitesini Supabase'in yerel bir örneğinde çalıştırmak için gerekli adımları içerir.

## Gereksinimler

Başlamadan önce aşağıdaki yazılımların kurulu olduğundan emin olun:

1. **Docker Desktop** - [İndirme Linki](https://www.docker.com/products/docker-desktop/)
2. **Node.js** (v14 veya üzeri) - [İndirme Linki](https://nodejs.org/)
3. **Git** - [İndirme Linki](https://git-scm.com/downloads)

## Kurulum Adımları

### 1. Supabase CLI Kurulumu

```bash
# NPM ile Supabase CLI kurulumu
npm install -g supabase
```

### 2. Projeyi Hazırlama

```bash
# Proje dizinine gidin
cd c:\Users\PC\CascadeProjects\kritik_yayınları

# Supabase projesini başlatın
supabase init
```

### 3. Yerel Supabase Örneğini Başlatma

```bash
# Supabase'i başlatın
supabase start
```

Bu komut çalıştığında, aşağıdaki gibi bir çıktı göreceksiniz:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

Bu bilgileri not edin, özellikle API URL ve anon key değerlerini kullanacağız.

### 4. Veritabanı Şemasını Oluşturma

```bash
# Veritabanı şemasını oluşturmak için SQL dosyasını çalıştırın
supabase db reset
```

Alternatif olarak, SQL dosyasını doğrudan Supabase Studio'da çalıştırabilirsiniz:

1. Tarayıcınızda `http://localhost:54323` adresini açın
2. Sol menüden "SQL Editor" seçeneğine tıklayın
3. `supabase/Veritabanı.sql` dosyasının içeriğini kopyalayıp yapıştırın ve çalıştırın

### 5. Supabase Yapılandırma Dosyasını Güncelleme

Yerel Supabase örneğini kullanmak için, `js/supabase-config.js` dosyasını geçici olarak değiştirin veya `js/supabase-config-local.js` dosyasını kullanın.

```javascript
// Supabase Yapılandırma Dosyası (Localhost)

// Supabase istemcisini global olarak tanımla
if (typeof supabaseClient === 'undefined') {
  // Localhost için Supabase URL ve ANON KEY
  const SUPABASE_URL = 'http://localhost:54321';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase Localhost bağlantısı kuruldu');
}
```

### 6. HTML Dosyalarını Güncelleme

Tüm HTML dosyalarında Supabase yapılandırma dosyasının yolunu güncelleyin:

```html
<!-- Supabase Yapılandırma -->
<script src="js/supabase-config-local.js"></script>
```

Veya geçici olarak mevcut yapılandırma dosyasını değiştirin.

### 7. Örnek Verileri Yükleme

Veritabanına örnek veriler eklemek için:

1. Supabase Studio'da (`http://localhost:54323`) "Table Editor" seçeneğine tıklayın
2. "authors" ve "books" tablolarını seçin ve "Insert Row" ile örnek veriler ekleyin

Alternatif olarak, SQL ile veri ekleyebilirsiniz:

```sql
-- Örnek yazarlar
INSERT INTO authors (name, bio, photo_url) 
VALUES 
('Victor Hugo', 'Fransız yazar ve şair', 'site_resimleri/author1.jpg'),
('Fyodor Dostoyevski', 'Rus yazar ve düşünür', 'site_resimleri/author2.jpg');

-- Örnek kitaplar
INSERT INTO books (title, author_id, description, cover_url, price, category, year, pages, is_new, is_bestseller) 
VALUES 
('Sefiller', 1, 'Fransız Devrimi sonrası Fransa''da geçen epik bir roman', 'site_resimleri/1.png', '0', 'Genel', 1862, 1232, true, true),
('Suç ve Ceza', 2, 'Bir öğrencinin işlediği cinayetin psikolojik sonuçlarını anlatan roman', 'site_resimleri/2.png', '0', 'Genel', 1866, 576, false, true);
```

### 8. Web Sunucusu Başlatma

Basit bir web sunucusu başlatmak için:

```bash
# Node.js http-server kullanarak
npx http-server -p 8080
```

Ardından tarayıcınızda `http://localhost:8080` adresini açın.

## Sorun Giderme

### Docker Bağlantı Hataları

Docker'ın çalıştığından emin olun. Docker Desktop uygulamasını açın ve durumunu kontrol edin.

### Veritabanı Bağlantı Hataları

Supabase'in başarıyla başlatıldığından emin olun:

```bash
supabase status
```

### Supabase'i Durdurma

İşiniz bittiğinde Supabase'i durdurmak için:

```bash
supabase stop
```

## Canlı Ortama Geçiş

Yerel geliştirme tamamlandığında, canlı Supabase yapılandırmasına geri dönmek için `js/supabase-config.js` dosyasını kullanmaya devam edin.
