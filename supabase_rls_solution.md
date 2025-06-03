# Supabase Row Level Security (RLS) Çözümü

Supabase güvenlik panelinde tespit edilen sorun, veritabanı tablolarınızda Row Level Security (RLS) politikalarının etkinleştirilmemiş olmasıdır. Bu, veritabanınıza yetkisiz erişimlere karşı savunmasız kalmanıza neden olabilir.

## Çözüm Adımları

1. Supabase Dashboard'a giriş yapın: https://supabase.com/dashboard/project/kyqtdtyubmipiwjrudgc
2. Sol menüden "SQL Editor" seçeneğine tıklayın
3. Yeni bir SQL sorgusu oluşturun ve aşağıdaki komutları yapıştırın
4. "Run" düğmesine tıklayarak sorguyu çalıştırın

```sql
-- RLS Politikalarını Etkinleştirme

-- books tablosu için RLS etkinleştirme
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- authors tablosu için RLS etkinleştirme
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- banners tablosu için RLS etkinleştirme
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- about_page tablosu için RLS etkinleştirme
ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;

-- contact_messages tablosu için RLS etkinleştirme
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- admin_profiles tablosu için RLS etkinleştirme
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- memory_bank_meta tablosu için RLS etkinleştirme
ALTER TABLE public.memory_bank_meta ENABLE ROW LEVEL SECURITY;

-- sync_events tablosu için RLS etkinleştirme
ALTER TABLE public.sync_events ENABLE ROW LEVEL SECURITY;

-- Okuma Politikaları (Anonim/Genel Kullanıcılar İçin)
-- Herkesin kitapları, yazarları ve bannerları görmesine izin ver
CREATE POLICY "Herkes kitapları görebilir" ON public.books
    FOR SELECT USING (true);

CREATE POLICY "Herkes yazarları görebilir" ON public.authors
    FOR SELECT USING (true);

CREATE POLICY "Herkes bannerları görebilir" ON public.banners
    FOR SELECT USING (true);

CREATE POLICY "Herkes hakkımızda sayfasını görebilir" ON public.about_page
    FOR SELECT USING (true);

-- İletişim mesajları için ekleme politikası (ziyaretçiler mesaj bırakabilir)
CREATE POLICY "Ziyaretçiler iletişim mesajı gönderebilir" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Admin Politikaları (Sadece Admin Kullanıcılar İçin)
-- Admin kullanıcıları tüm tablolara tam erişim
CREATE POLICY "Adminler kitapları yönetebilir" ON public.books
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com');

CREATE POLICY "Adminler yazarları yönetebilir" ON public.authors
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com');

CREATE POLICY "Adminler bannerları yönetebilir" ON public.banners
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com');

CREATE POLICY "Adminler hakkımızda sayfasını yönetebilir" ON public.about_page
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com');

CREATE POLICY "Adminler iletişim mesajlarını görebilir" ON public.contact_messages
    FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com');

CREATE POLICY "Adminler admin_profiles tablosunu yönetebilir" ON public.admin_profiles
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com');

CREATE POLICY "Adminler memory_bank_meta tablosunu yönetebilir" ON public.memory_bank_meta
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com');

CREATE POLICY "Adminler sync_events tablosunu yönetebilir" ON public.sync_events
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' LIKE '%@kritikyayinlari.com');
```

## Açıklama

Bu SQL komutları şunları yapacaktır:

1. Tüm tablolar için RLS'yi etkinleştirir
2. Genel kullanıcıların sadece okuma yapabileceği politikalar oluşturur
3. Admin kullanıcılarının (kritikyayinlari.com uzantılı e-posta ile giriş yapanlar) tüm verilere tam erişim sağlaması için politikalar oluşturur

## RLS Politikalarını Doğrulama

SQL komutlarını çalıştırdıktan sonra, güvenlik danışmanınızı yeniden kontrol etmek için:

1. Supabase Dashboard'da sol menüden "Advisors" bölümüne tıklayın
2. "Security Advisor" sekmesine gidin
3. Sayfayı yenileyin

RLS ile ilgili hatalar artık çözülmüş olmalıdır.

## Ek Güvenlik Önerileri

1. **Güçlü Şifre Politikası**: Supabase Auth ayarlarından güçlü şifre politikası oluşturun
2. **JWT Süresi**: Uzun JWT token sürelerini kısaltarak güvenliği artırın
3. **E-posta Doğrulama**: Kullanıcı kayıtları için e-posta doğrulamasını zorunlu hale getirin
4. **API Anahtarları Rotasyonu**: API anahtarlarınızı düzenli olarak yenileyin 