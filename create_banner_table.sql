-- Önce var olan bir banners tablosu varsa siliyoruz (isteğe bağlı)
DROP TABLE IF EXISTS banners;

-- Banners tablosunu oluştur
CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    location VARCHAR(50) DEFAULT 'home',
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    order_number INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Örnek banner verileri ekle
INSERT INTO banners (title, description, image_url, link, location, is_active, order_number)
VALUES
    ('Hoş Geldiniz', 'Kritik Yayınları resmi web sitesine hoş geldiniz.', 'images/Banner/banner1.jpg', '#', 'home', true, 1),
    ('Yeni Kitaplar', 'Ekim ayında çıkan yeni kitaplarımızı keşfedin.', 'images/Banner/banner2.jpg', 'kitaplar.html', 'home', true, 2),
    ('Yazarlarımız', 'Türk edebiyatının önde gelen yazarları Kritik Yayınları çatısı altında.', 'images/Banner/banner3.jpg', 'yazarlar.html', 'home', true, 3);

-- Tablonun oluşturulduğunu doğrula
SELECT * FROM banners; 