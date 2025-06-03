# Supabase Function Search Path Güvenlik Açıkları Çözümü

Supabase güvenlik danışmanında tespit edilen yeni sorunlar, SQL fonksiyonlarındaki "Function Search Path Mutable" güvenlik açıklarıdır. Bu açıklar, bir saldırganın fonksiyonların çalışma bağlamını değiştirerek zararlı kod çalıştırmasına olanak tanıyabilir.

## Tespit Edilen Sorunlar

1. `public.execute_sql` fonksiyonunda search_path parametresi ayarlanmamış
2. `public.update_updated_at_column` fonksiyonunda search_path parametresi ayarlanmamış

## Çözüm Adımları

1. Supabase Dashboard'a giriş yapın: https://supabase.com/dashboard/project/kyqtdtyubmipiwjrudgc
2. Sol menüden "SQL Editor" seçeneğine tıklayın
3. Yeni bir SQL sorgusu oluşturun ve aşağıdaki komutları yapıştırın
4. "Run" düğmesine tıklayarak sorguyu çalıştırın

```sql
-- Function Search Path Güvenlik Açıklarını Düzeltme

-- execute_sql fonksiyonunu güvenli hale getirme
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- update_updated_at_column fonksiyonunu güvenli hale getirme  
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

-- Fonksiyonlar için açıklama
COMMENT ON FUNCTION public.execute_sql(text) IS 'Güvenli SQL çalıştırma fonksiyonu - search_path sabitlenerek güvenlik artırıldı';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'updated_at alanını güncelleyen tetikleyici fonksiyonu - search_path sabitlenerek güvenlik artırıldı';
```

## Açıklama

Bu SQL komutları şunları yapacaktır:

1. `execute_sql` ve `update_updated_at_column` fonksiyonlarını yeniden tanımlar
2. Her iki fonksiyona da `SET search_path = 'public'` direktifini ekler
3. Bu, fonksiyonların sadece 'public' şemasındaki nesnelere erişebilmesini sağlar
4. `SECURITY DEFINER` özelliği korunarak fonksiyonların doğru yetki seviyesinde çalışması sağlanır

## Düzeltmelerin Doğrulanması

SQL komutlarını çalıştırdıktan sonra, güvenlik danışmanınızı yeniden kontrol etmek için:

1. Supabase Dashboard'da sol menüden "Advisors" bölümüne tıklayın
2. "Security Advisor" sekmesine gidin
3. Sayfayı yenileyin ("Refresh" düğmesine tıklayın)

Function Search Path ile ilgili uyarılar artık çözülmüş olmalıdır.

## Ek Bilgi: Search Path Açıkları Neden Tehlikelidir?

PostgreSQL'de varsayılan search_path değeri, sorgularda veya fonksiyonlarda hangi şemalardaki nesnelere erişilebileceğini belirler. Fonksiyonlarda search_path belirtilmediğinde, fonksiyonu çağıran kullanıcının search_path ayarı kullanılır. Bu, bir saldırganın kendi şemasında zararlı nesneler oluşturarak ve sonra fonksiyonu çağırarak bu nesnelerin fonksiyon içinde kullanılmasını sağlayabileceği anlamına gelir.

`SET search_path = 'public'` direktifi, fonksiyonun yalnızca 'public' şemasındaki nesnelere erişebilmesini sağlayarak bu tür saldırıları önler. 