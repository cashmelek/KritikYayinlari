-- Kitaplar tablosundaki fiyat ve kategori alanlarını varsayılan değerlerle güncelle
UPDATE books
SET 
  price = '0',
  original_price = '0',
  discount = 0,
  category = 'Genel';

-- Yeni kitaplar için tetikleyici oluştur
CREATE OR REPLACE FUNCTION set_default_values()
RETURNS TRIGGER AS $$
BEGIN
  NEW.price = '0';
  NEW.original_price = '0';
  NEW.discount = 0;
  NEW.category = 'Genel';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tetikleyiciyi books tablosuna ekle
DROP TRIGGER IF EXISTS set_default_values_trigger ON books;
CREATE TRIGGER set_default_values_trigger
BEFORE INSERT ON books
FOR EACH ROW
EXECUTE FUNCTION set_default_values();
