-- Kritik Yayınları Supabase Veritabanı Tabloları

-- authors tablosu (yazarlar)
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- books tablosu (kitaplar)
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author_id UUID REFERENCES authors(id),
  description TEXT,
  isbn TEXT,
  pages INTEGER,
  year INTEGER,
  cover_url TEXT,
  is_new BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Hakkımızda sayfası tablosu
CREATE TABLE IF NOT EXISTS about_page (
  id SERIAL PRIMARY KEY,
  page_title TEXT NOT NULL DEFAULT 'Hakkımızda',
  page_subtitle TEXT DEFAULT 'Kritik Yayınları''nın hikayesi ve vizyonu',
  about_section_title TEXT DEFAULT 'Biz Kimiz?',
  about_content TEXT,
  vision_content TEXT,
  mission_content TEXT,
  timeline_items JSONB DEFAULT '[]'::jsonb,
  team_members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- İletişim sayfası tablosu
CREATE TABLE IF NOT EXISTS contact_page (
  id SERIAL PRIMARY KEY,
  address TEXT,
  phone_numbers JSONB DEFAULT '[]'::jsonb,
  email_addresses JSONB DEFAULT '[]'::jsonb,
  map_iframe TEXT,
  office_hours JSONB DEFAULT '[]'::jsonb,
  bookstore_hours JSONB DEFAULT '[]'::jsonb,
  hours_additional_info TEXT,
  enable_contact_form BOOLEAN DEFAULT true,
  contact_form_title TEXT DEFAULT 'Bize Mesaj Gönderin',
  privacy_text TEXT,
  notification_email TEXT,
  success_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- İletişim mesajları tablosu
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Temel örnek veri ekleme
INSERT INTO authors (name, bio) VALUES
('George Orwell', 'İngiliz yazar, gazeteci ve eleştirmen.'),
('Paulo Coelho', 'Brezilyalı romancı ve şair.'),
('Fyodor Dostoyevski', 'Rus roman yazarı, kısa öykü yazarı, gazeteci ve filozof.'),
('J.K. Rowling', 'İngiliz yazar, senarist ve film yapımcısı.')
ON CONFLICT (id) DO NOTHING;

-- Örnek kitaplar
INSERT INTO books (title, author_id, description, isbn, pages, year, is_new, is_bestseller, stock) 
SELECT 
  '1984',
  (SELECT id FROM authors WHERE name = 'George Orwell'),
  'Distopik bir gelecek tasviri yapan klasik roman.',
  '9789750719479',
  352,
  1949,
  TRUE,
  TRUE,
  25
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = '1984' AND author_id = (SELECT id FROM authors WHERE name = 'George Orwell'));

INSERT INTO books (title, author_id, description, isbn, pages, year, is_new, is_bestseller, stock) 
SELECT 
  'Hayvan Çiftliği',
  (SELECT id FROM authors WHERE name = 'George Orwell'),
  'Rus devrimini ve Stalinizmin yükselişini eleştiren alegorik roman.',
  '9789750738609',
  152,
  1945,
  FALSE,
  TRUE,
  15
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = 'Hayvan Çiftliği' AND author_id = (SELECT id FROM authors WHERE name = 'George Orwell'));

INSERT INTO books (title, author_id, description, isbn, pages, year, is_new, is_bestseller, stock) 
SELECT 
  'Simyacı',
  (SELECT id FROM authors WHERE name = 'Paulo Coelho'),
  'Kendi kişisel efsanesini gerçekleştirmek için yolculuğa çıkan bir çobanın hikayesi.',
  '9789750726439',
  184,
  1988,
  FALSE,
  TRUE,
  30
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = 'Simyacı' AND author_id = (SELECT id FROM authors WHERE name = 'Paulo Coelho'));

-- Hakkımızda sayfası için örnek veri
INSERT INTO about_page (page_title, page_subtitle, about_section_title, about_content, vision_content, mission_content, timeline_items, team_members)
SELECT 
  'Hakkımızda',
  'Kritik Yayınları''nın hikayesi ve vizyonu',
  'Biz Kimiz?',
  'Kritik Yayınları, 2010 yılında İstanbul''da kurulmuş, Türk ve dünya edebiyatının seçkin eserlerini okuyucularla buluşturmayı amaçlayan bir yayınevidir. Kurulduğumuz günden bu yana, edebiyatın her alanından nitelikli eserleri titizlikle seçerek yayın programımıza dahil ediyoruz.

Yayınevimiz, çağdaş Türk edebiyatından klasik eserlere, dünya edebiyatının ölümsüz yapıtlarından çocuk ve gençlik kitaplarına kadar geniş bir yelpazede kitaplar yayınlamaktadır. Her yaştan ve her kesimden okuyucuya hitap eden bir katalog oluşturmak için çalışıyoruz.

Kritik Yayınları olarak, sadece kitap basmakla kalmıyor, aynı zamanda edebiyatın ve okumanın yaygınlaşması için çeşitli etkinlikler, söyleşiler ve imza günleri düzenliyoruz. Yazarlarımızla okuyucularımızı buluşturarak, edebiyat dünyasına katkı sağlamayı hedefliyoruz.',
  'Edebiyatın gücüne inanarak, toplumun kültürel ve entelektüel gelişimine katkıda bulunmak, okuma alışkanlığını yaygınlaştırmak ve düşünce dünyasını zenginleştiren eserleri okuyucularla buluşturmaktır.',
  'Edebiyatın her alanında nitelikli, özgün ve kalıcı eserler yayımlayarak Türk yayıncılık dünyasına değer katmak, okuyucuların hayatlarına dokunmak ve kültürel mirasımızı gelecek nesillere aktarmaktır.',
  '[{"title":"2010 - Yolculuğun Başlangıcı","content":"Kritik Yayınları, İstanbul''da küçük bir ofiste, edebiyata gönül vermiş bir grup yayıncı tarafından kuruldu. İlk yılında 5 kitap yayınlayarak sektöre adım attı."},{"title":"2012 - Büyüme Dönemi","content":"Artan talep üzerine kadromuzu genişlettik ve yeni yazarlarla çalışmaya başladık. Bu dönemde yıllık yayın sayımız 20''ye yükseldi."},{"title":"2015 - Uluslararası Açılım","content":"Dünya edebiyatından önemli eserleri Türkçeye kazandırmaya başladık. Çeviri kitap kataloğumuzu oluşturduk ve uluslararası yazarlarla anlaşmalar imzaladık."},{"title":"2018 - Dijital Dönüşüm","content":"E-kitap yayıncılığına adım attık ve dijital platformlarda varlığımızı güçlendirdik. Sosyal medya kanallarımızı aktif kullanmaya başlayarak daha geniş kitlelere ulaştık."}]',
  '[{"name":"Ahmet Yılmaz","position":"Genel Yayın Yönetmeni","description":"25 yıllık yayıncılık deneyimi ile sektörün önde gelen isimlerinden biridir.","image":"site_resimleri/team1.jpg"},{"name":"Ayşe Kaya","position":"Editör","description":"Türk ve dünya edebiyatı üzerine uzmanlaşmış, 15 yıllık editörlük deneyimine sahiptir.","image":"site_resimleri/team2.jpg"},{"name":"Mehmet Demir","position":"Tasarım Direktörü","description":"Yaratıcı tasarımları ile kitap kapaklarına hayat veren, ödüllü bir grafik tasarımcısıdır.","image":"site_resimleri/team3.jpg"}]'
WHERE NOT EXISTS (SELECT 1 FROM about_page LIMIT 1);

-- İletişim sayfası için örnek veri
INSERT INTO contact_page (address, phone_numbers, email_addresses, map_iframe, office_hours, bookstore_hours, hours_additional_info, enable_contact_form, contact_form_title, privacy_text, notification_email, success_message)
SELECT 
  'Bağdat Caddesi No:123, Kadıköy, İstanbul',
  '["0212 345 67 89", "0216 987 65 43"]',
  '["info@kritikyayinlari.com", "satis@kritikyayinlari.com"]',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48170.84554246369!2d29.023479591057594!3d40.98892123833761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab82bea5b9afb%3A0x2e92a483541e2860!2sKad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1684254161112!5m2!1str!2str',
  '[{"day":"Pazartesi - Cuma","hours":"09:00 - 18:00"},{"day":"Cumartesi","hours":"10:00 - 14:00"},{"day":"Pazar","hours":"Kapalı"}]',
  '[{"day":"Pazartesi - Cuma","hours":"10:00 - 20:00"},{"day":"Hafta Sonu","hours":"11:00 - 19:00"}]',
  'Randevu alarak ofisimizi ziyaret edebilirsiniz.',
  true,
  'Bize Mesaj Gönderin',
  'Verileriniz yalnızca talebinize yanıt vermek amacıyla kullanılacaktır.',
  'info@kritikyayinlari.com',
  'Mesajınız için teşekkür ederiz! En kısa sürede size dönüş yapacağız.'
WHERE NOT EXISTS (SELECT 1 FROM contact_page LIMIT 1);

-- Kullanışlı view'lar
CREATE OR REPLACE VIEW books_with_authors AS
SELECT b.*, a.name as author_name, a.bio as author_bio
FROM books b
JOIN authors a ON b.author_id = a.id;

-- RLS (Row Level Security) Politikaları
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Herkes için okuma izni
CREATE POLICY authors_select_policy ON authors FOR SELECT USING (true);
CREATE POLICY books_select_policy ON books FOR SELECT USING (true);
CREATE POLICY about_page_select_policy ON about_page FOR SELECT USING (true);
CREATE POLICY contact_page_select_policy ON contact_page FOR SELECT USING (true);

-- Sadece admin için yazma/düzenleme/silme izni (auth kullanıyorsanız)
-- CREATE POLICY authors_insert_policy ON authors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY authors_update_policy ON authors FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY authors_delete_policy ON authors FOR DELETE USING (auth.role() = 'authenticated');

-- CREATE POLICY books_insert_policy ON books FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY books_update_policy ON books FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY books_delete_policy ON books FOR DELETE USING (auth.role() = 'authenticated');

-- Gerçek zamanlı değişiklikler için broadcast kanal fonksiyonu
CREATE OR REPLACE FUNCTION broadcast_book_changes()
RETURNS TRIGGER AS $$
BEGIN
  perform pg_notify('book_changes', json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'id', CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER books_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON books
FOR EACH ROW EXECUTE FUNCTION broadcast_book_changes();

CREATE OR REPLACE FUNCTION broadcast_author_changes()
RETURNS TRIGGER AS $$
BEGIN
  perform pg_notify('author_changes', json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'id', CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER authors_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON authors
FOR EACH ROW EXECUTE FUNCTION broadcast_author_changes(); 