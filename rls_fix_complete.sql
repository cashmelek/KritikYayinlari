/*
 * RLS Politikalarını Tamamen Sıfırlayıp Yeniden Yapılandıran SQL
 * Bu script, mevcut tüm politikaları silip temiz bir şekilde yeniden oluşturur.
 */

-- Önce tüm RLS politikalarını devre dışı bırakalım
ALTER TABLE public.about_page DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_bank_meta DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_events DISABLE ROW LEVEL SECURITY;

-- Tüm mevcut politikaları temizleyelim
DROP POLICY IF EXISTS "Adminler hakkımızda sayfasını yönetebilir" ON public.about_page;
DROP POLICY IF EXISTS "Herkes hakkımızda sayfasını görebilir" ON public.about_page;
DROP POLICY IF EXISTS "Allow public read access" ON public.about_page;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON public.about_page;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.about_page;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public.about_page;

DROP POLICY IF EXISTS "Adminler admin_profiles tablosunu yönetebilir" ON public.admin_profiles;

DROP POLICY IF EXISTS "Adminler yazarları yönetebilir" ON public.authors;
DROP POLICY IF EXISTS "Herkes yazarları görebilir" ON public.authors;

DROP POLICY IF EXISTS "Adminler bannerları yönetebilir" ON public.banners;
DROP POLICY IF EXISTS "Herkes bannerları görebilir" ON public.banners;

DROP POLICY IF EXISTS "Adminler kitapları yönetebilir" ON public.books;
DROP POLICY IF EXISTS "Herkes kitapları görebilir" ON public.books;

DROP POLICY IF EXISTS "Adminler iletişim mesajlarını görebilir" ON public.contact_messages;
DROP POLICY IF EXISTS "Herkes iletişim mesajı gönderebilir" ON public.contact_messages;

DROP POLICY IF EXISTS "Adminler memory_bank_meta tablosunu yönetebilir" ON public.memory_bank_meta;

DROP POLICY IF EXISTS "Adminler sync_events tablosunu yönetebilir" ON public.sync_events;

-- RLS'yi tüm tablolar için yeniden aktifleştirelim
ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_bank_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_events ENABLE ROW LEVEL SECURITY;

-- Şimdi yeni optimizasyonlu politikaları oluşturalım
-- Tek seferde değerlendirilecek auth fonksiyonları için (SELECT ...) kullanılıyor

-- 1. About Page Tablosu için
CREATE POLICY "Admin_about_page_yonetim" ON public.about_page
    FOR ALL 
    USING ((SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')));

CREATE POLICY "Herkes_about_page_goruntuleme" ON public.about_page
    FOR SELECT 
    USING (true);

-- 2. Admin Profiles Tablosu için
CREATE POLICY "Admin_admin_profiles_yonetim" ON public.admin_profiles
    FOR ALL 
    USING ((SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')));

-- 3. Authors Tablosu için
CREATE POLICY "Admin_authors_yonetim" ON public.authors
    FOR ALL 
    USING ((SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')));

CREATE POLICY "Herkes_authors_goruntuleme" ON public.authors
    FOR SELECT 
    USING (true);

-- 4. Banners Tablosu için
CREATE POLICY "Admin_banners_yonetim" ON public.banners
    FOR ALL 
    USING ((SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')));

CREATE POLICY "Herkes_banners_goruntuleme" ON public.banners
    FOR SELECT 
    USING (true);

-- 5. Books Tablosu için
CREATE POLICY "Admin_books_yonetim" ON public.books
    FOR ALL 
    USING ((SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')));

CREATE POLICY "Herkes_books_goruntuleme" ON public.books
    FOR SELECT 
    USING (true);

-- 6. Contact Messages Tablosu için
CREATE POLICY "Admin_contact_messages_goruntuleme" ON public.contact_messages
    FOR SELECT 
    USING ((SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')));

CREATE POLICY "Herkes_contact_messages_ekleme" ON public.contact_messages
    FOR INSERT 
    WITH CHECK (true);

-- 7. Memory Bank Meta Tablosu için
CREATE POLICY "Admin_memory_bank_meta_yonetim" ON public.memory_bank_meta
    FOR ALL 
    USING ((SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')));

-- 8. Sync Events Tablosu için
CREATE POLICY "Admin_sync_events_yonetim" ON public.sync_events
    FOR ALL 
    USING ((SELECT (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com')));

-- Politikaların doğru uygulandığını kontrol etmek için
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename, policyname; 