-- Kitaplar tablosu
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER REFERENCES authors(id),
  description TEXT,
  cover_url TEXT,
  price TEXT,
  original_price TEXT,
  discount INTEGER,
  category TEXT,
  year INTEGER,
  pages INTEGER,
  publisher TEXT,
  language TEXT,
  isbn TEXT,
  rating DECIMAL,
  review_count INTEGER,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yazarlar tablosu
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  book_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bannerlar tablosu
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true,
  order_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 