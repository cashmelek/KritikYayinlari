-- İletişim sayfası tablosu
CREATE TABLE IF NOT EXISTS public.contact_page (
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
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Hakkımızda sayfası tablosu
CREATE TABLE IF NOT EXISTS public.about_page (
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

-- Örnek veriler: İletişim sayfası
INSERT INTO public.contact_page (
    address, 
    phone_numbers, 
    email_addresses,
    map_iframe,
    office_hours,
    bookstore_hours,
    hours_additional_info,
    enable_contact_form,
    contact_form_title,
    privacy_text,
    notification_email,
    success_message
) VALUES (
    'Bağdat Caddesi No:123, Kadıköy, İstanbul',
    '["+90 212 345 67 89", "+90 216 987 65 43"]',
    '["info@kritikyayinlari.com", "satis@kritikyayinlari.com"]',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48170.84554246369!2d29.023479591057594!3d40.98892123833761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab82bea5b9afb%3A0x2e92a483541e2860!2sKad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1684254161112!5m2!1str!2str',
    '[
        {"day": "Pazartesi - Cuma", "hours": "09:00 - 18:00"},
        {"day": "Cumartesi", "hours": "10:00 - 14:00"},
        {"day": "Pazar", "hours": "Kapalı"}
    ]',
    '[
        {"day": "Pazartesi - Cuma", "hours": "10:00 - 20:00"},
        {"day": "Hafta Sonu", "hours": "11:00 - 19:00"}
    ]',
    'Randevu alarak ofisimizi ziyaret edebilirsiniz.',
    true,
    'Bize Mesaj Gönderin',
    'Verileriniz yalnızca talebinize yanıt vermek amacıyla kullanılacaktır.',
    'info@kritikyayinlari.com',
    'Mesajınız için teşekkür ederiz! En kısa sürede size dönüş yapacağız.'
) ON CONFLICT DO NOTHING;

-- Örnek veriler: Hakkımızda sayfası
INSERT INTO public.about_page (
    page_title,
    page_subtitle,
    about_section_title,
    about_content,
    vision_content,
    mission_content,
    timeline_items,
    team_members
) VALUES (
    'Hakkımızda',
    'Kritik Yayınları''nın hikayesi ve vizyonu',
    'Biz Kimiz?',
    'Kritik Yayınları, 2010 yılında İstanbul''da kurulmuş, Türk ve dünya edebiyatının seçkin eserlerini okuyucularla buluşturmayı amaçlayan bir yayınevidir. Kurulduğumuz günden bu yana, edebiyatın her alanından nitelikli eserleri titizlikle seçerek yayın programımıza dahil ediyoruz.

Yayınevimiz, çağdaş Türk edebiyatından klasik eserlere, dünya edebiyatının ölümsüz yapıtlarından çocuk ve gençlik kitaplarına kadar geniş bir yelpazede kitaplar yayınlamaktadır. Her yaştan ve her kesimden okuyucuya hitap eden bir katalog oluşturmak için çalışıyoruz.

Kritik Yayınları olarak, sadece kitap basmakla kalmıyor, aynı zamanda edebiyatın ve okumanın yaygınlaşması için çeşitli etkinlikler, söyleşiler ve imza günleri düzenliyoruz. Yazarlarımızla okuyucularımızı buluşturarak, edebiyat dünyasına katkı sağlamayı hedefliyoruz.',
    'Edebiyatın gücüne inanarak, toplumun kültürel ve entelektüel gelişimine katkıda bulunmak, okuma alışkanlığını yaygınlaştırmak ve düşünce dünyasını zenginleştiren eserleri okuyucularla buluşturmaktır.',
    'Edebiyatın her alanında nitelikli, özgün ve kalıcı eserler yayımlayarak Türk yayıncılık dünyasına değer katmak, okuyucuların hayatlarına dokunmak ve kültürel mirasımızı gelecek nesillere aktarmaktır.',
    '[
        {
            "title": "2010 - Yolculuğun Başlangıcı",
            "content": "Kritik Yayınları, İstanbul''da küçük bir ofiste, edebiyata gönül vermiş bir grup yayıncı tarafından kuruldu. İlk yılında 5 kitap yayınlayarak sektöre adım attı."
        },
        {
            "title": "2012 - Büyüme Dönemi",
            "content": "Artan talep üzerine kadromuzu genişlettik ve yeni yazarlarla çalışmaya başladık. Bu dönemde yıllık yayın sayımız 20''ye yükseldi."
        },
        {
            "title": "2015 - Uluslararası Açılım",
            "content": "Dünya edebiyatından önemli eserleri Türkçeye kazandırmaya başladık. Çeviri kitap kataloğumuzu oluşturduk ve uluslararası yazarlarla anlaşmalar imzaladık."
        },
        {
            "title": "2018 - Dijital Dönüşüm",
            "content": "E-kitap yayıncılığına adım attık ve dijital platformlarda varlığımızı güçlendirdik. Sosyal medya kanallarımızı aktif kullanmaya başlayarak daha geniş kitlelere ulaştık."
        },
        {
            "title": "2020 - 10. Yıl",
            "content": "Onuncu yılımızda 500. kitabımızı yayınladık ve yeni ofisimize taşındık. Ayrıca \"Genç Yazarlar Programı\"nı başlatarak edebiyat dünyasına yeni yetenekler kazandırmayı hedefledik."
        },
        {
            "title": "2023 - Bugün",
            "content": "Bugün 50''den fazla çalışanımız, 200''ü aşkın yazarımız ve 1000''in üzerinde kitap başlığıyla Türkiye''nin önde gelen yayınevleri arasında yer alıyoruz. Misyonumuza bağlı kalarak, edebiyatın gücünü her okuyucuya ulaştırmak için çalışmaya devam ediyoruz."
        }
    ]',
    '[
        {
            "name": "Ahmet Yılmaz",
            "position": "Genel Yayın Yönetmeni",
            "description": "20 yıllık yayıncılık deneyimi ile Kritik Yayınları''nın kurucu ortağı ve Genel Yayın Yönetmeni.",
            "image": "site_resimleri/team1.jpg"
        },
        {
            "name": "Ayşe Kaya",
            "position": "Editör",
            "description": "Türk Dili ve Edebiyatı eğitimi sonrası 15 yıldır editörlük yapıyor. Çağdaş Türk edebiyatı alanında uzman.",
            "image": "site_resimleri/team2.jpg"
        },
        {
            "name": "Mehmet Demir",
            "position": "Tasarım Direktörü",
            "description": "10 yıldır kitap tasarımı üzerine çalışıyor. Kritik Yayınları''nın görsel kimliğinin mimarı.",
            "image": "site_resimleri/team3.jpg"
        }
    ]'
) ON CONFLICT DO NOTHING;

-- Test mesajı
INSERT INTO public.contact_messages (
    name,
    email,
    subject,
    message,
    is_read
) VALUES (
    'Test Kullanıcı',
    'test@example.com',
    'Test Mesaj',
    'Bu bir test mesajıdır. İletişim formunun düzgün çalıştığını kontrol etmek için gönderilmiştir.',
    false
) ON CONFLICT DO NOTHING; 