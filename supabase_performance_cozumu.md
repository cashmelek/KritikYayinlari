# Supabase Performance Advisor Sorunları Nasıl Çözülür

Performance Advisor'da hala 24 adet uyarı görünüyorsa, bu kılavuz size sorunu adım adım çözmenize yardımcı olacaktır.

## Sorun Nedir?

Supabase Performance Advisor'da iki temel performans sorunu tespit edildi:

1. **Auth RLS Initialization Plan sorunu**: RLS politikalarında `auth.role()` ve `auth.jwt()` gibi fonksiyonların her satır için tekrar değerlendirilmesi
2. **Multiple Permissive Policies sorunu**: Aynı tablo, rol ve işlem için birden fazla izin politikası tanımlanması

## Çözüm Adımları

### 1. Supabase Dashboard'a Giriş Yapın

- https://app.supabase.com adresine gidin
- Hesabınıza giriş yapın ve Kritik Yayınları projesini seçin

### 2. SQL Editor'ü Açın

- Sol menüden "SQL Editor" seçeneğine tıklayın
- Yeni bir SQL sorgusu oluşturmak için "New Query" butonuna tıklayın

### 3. Revize Edilmiş SQL Komutlarını Yapıştırın

Aşağıdaki SQL komutlarını editöre yapıştırın:

```sql
/* 
 * Performance Advisor Sorunlarını Düzeltme - Revize Edilmiş Versiyon
 */

-- Tüm mevcut RLS politikalarını yeniden düzenliyoruz

/* =============================================
 * 1. Auth RLS Initialization Plan Sorunu Çözümü
 * ============================================= */

-- books tablosu için politikaları yeniden düzenleme
DROP POLICY IF EXISTS "Adminler kitapları yönetebilir" ON public.books;
DROP POLICY IF EXISTS "Herkes kitapları görebilir" ON public.books;

CREATE POLICY "Adminler kitapları yönetebilir" ON public.books
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com'))
    );
    
CREATE POLICY "Herkes kitapları görebilir" ON public.books
    FOR SELECT USING (true);

-- authors tablosu için politikaları yeniden düzenleme
DROP POLICY IF EXISTS "Adminler yazarları yönetebilir" ON public.authors;
DROP POLICY IF EXISTS "Herkes yazarları görebilir" ON public.authors;

CREATE POLICY "Adminler yazarları yönetebilir" ON public.authors
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com'))
    );
    
CREATE POLICY "Herkes yazarları görebilir" ON public.authors
    FOR SELECT USING (true);

-- banners tablosu için politikaları yeniden düzenleme
DROP POLICY IF EXISTS "Adminler bannerları yönetebilir" ON public.banners;
DROP POLICY IF EXISTS "Herkes bannerları görebilir" ON public.banners;

CREATE POLICY "Adminler bannerları yönetebilir" ON public.banners
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com'))
    );
    
CREATE POLICY "Herkes bannerları görebilir" ON public.banners
    FOR SELECT USING (true);

-- about_page tablosu için politikaları yeniden düzenleme
DROP POLICY IF EXISTS "Adminler hakkımızda sayfasını yönetebilir" ON public.about_page;
DROP POLICY IF EXISTS "Herkes hakkımızda sayfasını görebilir" ON public.about_page;
DROP POLICY IF EXISTS "Allow public read access" ON public.about_page;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON public.about_page;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.about_page;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public.about_page;

CREATE POLICY "Adminler hakkımızda sayfasını yönetebilir" ON public.about_page
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com'))
    );
    
CREATE POLICY "Herkes hakkımızda sayfasını görebilir" ON public.about_page
    FOR SELECT USING (true);

-- contact_messages tablosu için politikaları yeniden düzenleme
DROP POLICY IF EXISTS "Adminler iletişim mesajlarını görebilir" ON public.contact_messages;

CREATE POLICY "Adminler iletişim mesajlarını görebilir" ON public.contact_messages
    FOR SELECT USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com'))
    );

-- admin_profiles tablosu için politikaları yeniden düzenleme
DROP POLICY IF EXISTS "Adminler admin_profiles tablosunu yönetebilir" ON public.admin_profiles;

CREATE POLICY "Adminler admin_profiles tablosunu yönetebilir" ON public.admin_profiles
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com'))
    );

-- memory_bank_meta tablosu için politikaları yeniden düzenleme
DROP POLICY IF EXISTS "Adminler memory_bank_meta tablosunu yönetebilir" ON public.memory_bank_meta;

CREATE POLICY "Adminler memory_bank_meta tablosunu yönetebilir" ON public.memory_bank_meta
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com'))
    );

-- sync_events tablosu için politikaları yeniden düzenleme
DROP POLICY IF EXISTS "Adminler sync_events tablosunu yönetebilir" ON public.sync_events;

CREATE POLICY "Adminler sync_events tablosunu yönetebilir" ON public.sync_events
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com'))
    );
```

### 4. SQL Komutlarını Çalıştırın

- "Run" veya "Çalıştır" butonuna tıklayın ve SQL komutlarının çalışmasını bekleyin
- Komutların başarıyla çalıştığına dair bir onay mesajı görünmelidir

### 5. Dikkat Edilmesi Gereken Noktalar

- Önceki SQL komutlarımızda `::boolean` kısmı sorun yaratmış olabilir, bu revize edilmiş versiyonda bunu kaldırdık
- Tüm politikaları önce kaldırıp sonra yeniden oluşturuyoruz, böylece çakışma olmayacak
- About_page tablosu için tüm eski politikaları kaldırdık ve sadece gerekli iki politikayı yeniden oluşturduk

### 6. Değişiklikleri Kontrol Edin

- SQL komutlarını çalıştırdıktan sonra, sol menüden "Advisors" seçeneğine tıklayın
- "Performance Advisor" sekmesine geçin
- "Refresh" butonuna tıklayarak uyarıları yeniden kontrol edin

### 7. Hata Durumunda Yapılacaklar

Eğer hala uyarılar görünüyorsa:

1. Hata mesajlarını kontrol edin ve hangi SQL komutlarının başarısız olduğunu tespit edin
2. Tablolar veya politikalar değişmiş olabilir, "Table" sekmesinde mevcut tabloları ve politikaları kontrol edin
3. Gerekirse her politikayı ayrı ayrı güncellemeyi deneyin
4. Supabase destek ekibiyle iletişime geçin

## Açıklama

Bu çözüm iki ana performans iyileştirmesi sağlar:

1. **Auth fonksiyonlarını bir kez çalıştırma**: `(SELECT ...)` içine alınan auth fonksiyonları artık her satır için değil, sorgu başına sadece bir kez değerlendirilecek.

2. **Tekrarlayan politikaları birleştirme**: Aynı işlemi yapan birden fazla politika yerine, her tablo için sadece gerekli politikaları tanımladık.

Bu değişiklikler, veritabanı performansını önemli ölçüde artıracak ve ölçeklenebilirliği iyileştirecektir. 