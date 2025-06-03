# Değişiklik Günlüğü

Bu dosya, projede yapılan önemli değişiklikleri içermektedir.

## 1.0.0 - 2023

### Temizlik ve Yapılandırma
- Gereksiz dosyalar temizlendi
- Proje yapısı yeniden düzenlendi
- README dosyası oluşturuldu

### Düzeltmeler
- İletişim sayfasındaki "Cannot read properties of null (reading 'value')" hatası giderildi
  - DOM elementlerine erişimde null kontrolü eklendi
  - form_enabled alanı enable_contact_form olarak düzenlendi
  - getOfficeHours ve getBookstoreHours fonksiyonları daha güvenli hale getirildi
  - CSS seçicileri düzeltildi

- Veritabanına kayıt yapıldığında frontend tarafında değişikliklerin görünmemesi sorunu çözüldü
  - Supabase'in realtime özelliği kontrol edildi
  - RLS (Row Level Security) politikaları güncellendi
  - enable_contact_form alan adı tutarlı hale getirildi
  - Realtime özelliği yeniden yapılandırıldı

- Admin panelinde kaydetme işlemi yapıldığında sayfadaki öğelerin kendini çoğaltması sorunu giderildi
  - loadPhoneNumbers ve loadEmailAddresses fonksiyonları düzeltilerek mevcut satırlar temizlendi
  - loadExistingData fonksiyonuna daha güvenli kontroller eklendi
  - HTML'deki ID tutarsızlıkları (addressInfo -> address) düzeltildi
  - Veri toplama fonksiyonları iyileştirildi (boş değerleri filtreleme)

## Gelecek Geliştirmeler
- Mobil uyumluluk iyileştirilmesi
- Performans optimizasyonu
- API güvenliğinin artırılması
- Kitap arama özelliğinin geliştirilmesi 