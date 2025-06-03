/* Function Search Path Güvenlik Açıklarını Düzeltme */

/* execute_sql fonksiyonunu güvenli hale getirme */
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

/* update_updated_at_column fonksiyonunu güvenli hale getirme 
   Not: Bu fonksiyonu silmiyoruz çünkü başka nesneler tarafından kullanılıyor */
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

/* Fonksiyonlar için açıklama */
COMMENT ON FUNCTION public.execute_sql(text) IS 'Güvenli SQL çalıştırma fonksiyonu - search_path sabitlenerek güvenlik artırıldı';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'updated_at alanını güncelleyen tetikleyici fonksiyonu - search_path sabitlenerek güvenlik artırıldı'; 