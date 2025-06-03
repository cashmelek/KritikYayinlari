# Supabase Performance Advisor Sorunları Çözümü

Supabase Performance Advisor'da tespit edilen iki temel performans sorunu bulunmaktadır. Bu belge, bu sorunları ve çözüm adımlarını açıklamaktadır.

## 1. Auth RLS Initialization Plan Sorunu

**Sorun:** RLS politikalarında kullanılan `auth.role()` ve `auth.jwt()` gibi fonksiyonlar her satır için tekrar tekrar değerlendiriliyor, bu da performans sorunlarına neden oluyor.

**Çözüm:** Bu fonksiyonları `(SELECT ...)` ifadesi içine alarak, sorgunun yürütülmesi sırasında sadece bir kez değerlendirilmelerini sağlamak.

## 2. Multiple Permissive Policies Sorunu

**Sorun:** Aynı tablo, rol ve işlem için birden fazla izin verici politika tanımlanmış. Her sorgu için tüm politikalar değerlendirildiğinden, bu durum performansı olumsuz etkiliyor.

**Çözüm:** Tekrarlayan politikaları kaldırıp, tek bir politika altında birleştirmek.

## Çözüm Adımları

1. Supabase Dashboard'a giriş yapın: https://supabase.com/dashboard/project/kyqtdtyubmipiwjrudgc
2. Sol menüden "SQL Editor" seçeneğine tıklayın
3. Yeni bir SQL sorgusu oluşturun ve aşağıdaki komutları yapıştırın
4. "Run" düğmesine tıklayarak sorguyu çalıştırın

```sql
/* 
 * Performance Advisor Sorunlarını Düzeltme 
 */

/* =============================================
 * 1. Auth RLS Initialization Plan Sorunu Çözümü
 * ============================================= */

/* books tablosu için politikayı düzeltme */
DROP POLICY IF EXISTS "Adminler kitapları yönetebilir" ON public.books;
CREATE POLICY "Adminler kitapları yönetebilir" ON public.books
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')::boolean)
    );

/* authors tablosu için politikayı düzeltme */
DROP POLICY IF EXISTS "Adminler yazarları yönetebilir" ON public.authors;
CREATE POLICY "Adminler yazarları yönetebilir" ON public.authors
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')::boolean)
    );

/* banners tablosu için politikayı düzeltme */
DROP POLICY IF EXISTS "Adminler bannerları yönetebilir" ON public.banners;
CREATE POLICY "Adminler bannerları yönetebilir" ON public.banners
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')::boolean)
    );

/* about_page tablosu için politikayı düzeltme */
DROP POLICY IF EXISTS "Adminler hakkımızda sayfasını yönetebilir" ON public.about_page;
CREATE POLICY "Adminler hakkımızda sayfasını yönetebilir" ON public.about_page
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')::boolean)
    );

/* contact_messages tablosu için politikayı düzeltme */
DROP POLICY IF EXISTS "Adminler iletişim mesajlarını görebilir" ON public.contact_messages;
CREATE POLICY "Adminler iletişim mesajlarını görebilir" ON public.contact_messages
    FOR SELECT USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')::boolean)
    );

/* admin_profiles tablosu için politikayı düzeltme */
DROP POLICY IF EXISTS "Adminler admin_profiles tablosunu yönetebilir" ON public.admin_profiles;
CREATE POLICY "Adminler admin_profiles tablosunu yönetebilir" ON public.admin_profiles
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')::boolean)
    );

/* memory_bank_meta tablosu için politikayı düzeltme */
DROP POLICY IF EXISTS "Adminler memory_bank_meta tablosunu yönetebilir" ON public.memory_bank_meta;
CREATE POLICY "Adminler memory_bank_meta tablosunu yönetebilir" ON public.memory_bank_meta
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')::boolean)
    );

/* sync_events tablosu için politikayı düzeltme */
DROP POLICY IF EXISTS "Adminler sync_events tablosunu yönetebilir" ON public.sync_events;
CREATE POLICY "Adminler sync_events tablosunu yönetebilir" ON public.sync_events
    FOR ALL USING (
        (SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')::boolean)
    );

/* about_page için authenticated kullanıcı politikalarını temizleme */
DROP POLICY IF EXISTS "Allow authenticated users to update" ON public.about_page;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.about_page;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public.about_page;

/* =============================================
 * 2. Multiple Permissive Policies Sorunu Çözümü
 * ============================================= */

/* about_page için tekrarlayan politikaları düzeltme */
DROP POLICY IF EXISTS "Allow public read access" ON public.about_page;
DROP POLICY IF EXISTS "Herkes hakkımızda sayfasını görebilir" ON public.about_page;
CREATE POLICY "Herkes hakkımızda sayfasını görebilir" ON public.about_page
    FOR SELECT USING (true);

/* authors için tekrarlayan politikaları düzeltme */
DROP POLICY IF EXISTS "Herkes yazarları görebilir" ON public.authors;
CREATE POLICY "Herkes yazarları görebilir" ON public.authors
    FOR SELECT USING (true);

/* banners için tekrarlayan politikaları düzeltme */
DROP POLICY IF EXISTS "Herkes bannerları görebilir" ON public.banners;
CREATE POLICY "Herkes bannerları görebilir" ON public.banners
    FOR SELECT USING (true);

/* books için tekrarlayan politikaları düzeltme */
DROP POLICY IF EXISTS "Herkes kitapları görebilir" ON public.books;
CREATE POLICY "Herkes kitapları görebilir" ON public.books
    FOR SELECT USING (true);
```

## Açıklama

### 1. Auth RLS Initialization Plan Sorunu Çözümü

Supabase'in önerdiği çözüm, `auth.role()` gibi fonksiyonları bir alt sorgu içine almak. Örneğin:

```sql
-- ÖNCE (sorunlu):
CREATE POLICY "policy_name" ON table_name
    FOR ALL USING (auth.role() = 'authenticated');

-- SONRA (düzeltilmiş):
CREATE POLICY "policy_name" ON table_name
    FOR ALL USING ((SELECT auth.role()) = 'authenticated');
```

Bu yaklaşımla, `auth.role()` fonksiyonu sorgu başına yalnızca bir kez değerlendirilir ve her satır için tekrar çağrılmaz.

### 2. Multiple Permissive Policies Sorunu Çözümü

Aynı tablo, rol ve işlem için birden fazla politika yerine, tek bir politika kullanarak performans iyileştirilir:

```sql
-- ÖNCE (sorunlu):
CREATE POLICY "policy1" ON table_name FOR SELECT USING (condition1);
CREATE POLICY "policy2" ON table_name FOR SELECT USING (condition2);

-- SONRA (düzeltilmiş):
CREATE POLICY "combined_policy" ON table_name FOR SELECT USING (condition1 OR condition2);
```

## Düzeltmelerin Doğrulanması

SQL komutlarını çalıştırdıktan sonra, performans danışmanınızı yeniden kontrol etmek için:

1. Supabase Dashboard'da sol menüden "Advisors" bölümüne tıklayın
2. "Performance Advisor" sekmesine gidin
3. Sayfayı yenileyin ("Refresh" düğmesine tıklayın)

Performans uyarıları artık çözülmüş olmalıdır. 