-- Kritik Yayınları Supabase Entegrasyon Çözümü
-- Bu dosya tüm performans ve güvenlik sorunlarını çözer

-- =====================================================
-- 1. PERFORMANS SORUNLARINI ÇÖZME
-- =====================================================

-- Önce tüm RLS politikalarını devre dışı bırak
ALTER TABLE IF EXISTS public.about_page DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_page DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.memory_bank_meta DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_events DISABLE ROW LEVEL SECURITY;

-- Tüm mevcut politikaları temizle
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- 2. EKSIK TABLOLARI OLUŞTURMA
-- =====================================================

-- Admin kullanıcıları tablosu
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Yazarlar tablosu
CREATE TABLE IF NOT EXISTS public.authors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    biography TEXT,
    photo_url TEXT,
    birth_date DATE,
    death_date DATE,
    nationality TEXT,
    website TEXT,
    social_media JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Kitaplar tablosu
CREATE TABLE IF NOT EXISTS public.books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author_id INTEGER REFERENCES public.authors(id),
    isbn TEXT UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    page_count INTEGER,
    publication_date DATE,
    price DECIMAL(10,2),
    category TEXT,
    language TEXT DEFAULT 'tr',
    is_new BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bannerlar tablosu
CREATE TABLE IF NOT EXISTS public.banners (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    order_number INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 3. İNDEKSLER VE PERFORMANS İYİLEŞTİRMELERİ
-- =====================================================

-- Kitaplar için indeksler
CREATE INDEX IF NOT EXISTS idx_books_author_id ON public.books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_is_new ON public.books(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_books_is_bestseller ON public.books(is_bestseller) WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_books_is_active ON public.books(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_books_publication_date ON public.books(publication_date);

-- Yazarlar için indeksler
CREATE INDEX IF NOT EXISTS idx_authors_name ON public.authors(name);
CREATE INDEX IF NOT EXISTS idx_authors_is_active ON public.authors(is_active) WHERE is_active = true;

-- Bannerlar için indeksler
CREATE INDEX IF NOT EXISTS idx_banners_order_number ON public.banners(order_number);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active) WHERE is_active = true;

-- Admin kullanıcıları için indeksler
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);

-- =====================================================
-- 4. OPTİMİZE EDİLMİŞ RLS POLİTİKALARI
-- =====================================================

-- RLS'yi yeniden etkinleştir
ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_page ENABLE ROW LEVEL SECURITY;

-- Admin kontrolü için fonksiyon
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optimize edilmiş politikalar
-- Books tablosu
CREATE POLICY "books_public_read" ON public.books
    FOR SELECT USING (is_active = true);

CREATE POLICY "books_admin_all" ON public.books
    FOR ALL USING (public.is_admin());

-- Authors tablosu
CREATE POLICY "authors_public_read" ON public.authors
    FOR SELECT USING (is_active = true);

CREATE POLICY "authors_admin_all" ON public.authors
    FOR ALL USING (public.is_admin());

-- Banners tablosu
CREATE POLICY "banners_public_read" ON public.banners
    FOR SELECT USING (is_active = true);

CREATE POLICY "banners_admin_all" ON public.banners
    FOR ALL USING (public.is_admin());

-- Contact messages tablosu
CREATE POLICY "contact_messages_insert" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_admin_read" ON public.contact_messages
    FOR SELECT USING (public.is_admin());

-- About page tablosu
CREATE POLICY "about_page_public_read" ON public.about_page
    FOR SELECT USING (true);

CREATE POLICY "about_page_admin_all" ON public.about_page
    FOR ALL USING (public.is_admin());

-- Contact page tablosu
CREATE POLICY "contact_page_public_read" ON public.contact_page
    FOR SELECT USING (true);

CREATE POLICY "contact_page_admin_all" ON public.contact_page
    FOR ALL USING (public.is_admin());

-- Admin users tablosu
CREATE POLICY "admin_users_self_read" ON public.admin_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "admin_users_admin_all" ON public.admin_users
    FOR ALL USING (public.is_admin());

-- =====================================================
-- 5. TRİGGERLAR VE OTOMATIK GÜNCELLEME
-- =====================================================

-- Updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggerleri ekle
DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_authors_updated_at ON public.authors;
CREATE TRIGGER update_authors_updated_at
    BEFORE UPDATE ON public.authors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_banners_updated_at ON public.banners;
CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON public.banners
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. ÖRNEK VERİLER
-- =====================================================

-- Örnek yazar verisi
INSERT INTO public.authors (name, biography, nationality) VALUES 
('Orhan Pamuk', 'Nobel Edebiyat Ödülü sahibi Türk yazar', 'Türk'),
('Sabahattin Ali', 'Türk edebiyatının önemli isimlerinden', 'Türk'),
('Yaşar Kemal', 'Türk edebiyatının usta kalemi', 'Türk')
ON CONFLICT DO NOTHING;

-- Örnek kitap verisi
INSERT INTO public.books (title, author_id, description, category, is_new, is_bestseller) VALUES 
('Kar', 1, 'Orhan Pamuk''un ünlü romanı', 'Roman', false, true),
('Kürk Mantolu Madonna', 2, 'Sabahattin Ali''nin klasik eseri', 'Roman', false, true),
('İnce Memed', 3, 'Yaşar Kemal''in ünlü romanı', 'Roman', false, true)
ON CONFLICT DO NOTHING;

-- Örnek banner verisi
INSERT INTO public.banners (title, description, image_url, order_number) VALUES 
('Yeni Kitaplar', 'En yeni yayınlarımızı keşfedin', '/images/banner1.jpg', 1),
('Çok Satanlar', 'En çok satan kitaplarımız', '/images/banner2.jpg', 2)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. KONTROL VE DOĞRULAMA
-- =====================================================

-- Politikaları kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Tablo sayılarını kontrol et
SELECT 
    'books' as table_name, COUNT(*) as record_count FROM public.books
UNION ALL
SELECT 
    'authors' as table_name, COUNT(*) as record_count FROM public.authors
UNION ALL
SELECT 
    'banners' as table_name, COUNT(*) as record_count FROM public.banners;

-- İndeksleri kontrol et
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname; 