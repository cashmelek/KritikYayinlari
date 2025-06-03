# Admin Şifre Yönetimi Talimatları

Bu belge, Kritik Yayınları web sitesinin admin şifre yönetimi için gereken adımları açıklamaktadır.

## Admin Giriş Bilgileri

Varsayılan admin kullanıcısı şu şekildedir:
- **E-posta**: admin@kritikyayinlari.com
- **Şifre**: admin123 (Bu şifreyi değiştirmeniz önerilir)

## Şifre Güvenlik Gereksinimleri

Tüm şifreler aşağıdaki kriterleri karşılamalıdır:
- En az 8 karakter uzunluğunda
- En az 1 küçük harf (a-z)
- En az 1 büyük harf (A-Z)
- En az 1 rakam (0-9)
- En az 1 özel karakter (@$!%*?&)

## Admin Panelinden Şifre Değiştirme

Admin olarak giriş yaptıktan sonra şifrenizi değiştirmek için:

1. Admin panelinde sağ üst köşedeki kullanıcı simgesine tıklayın
2. Açılan menüden "Ayarlar" seçeneğini tıklayın
3. Şifre değiştirme modalında:
   - Mevcut şifrenizi girin
   - Yeni şifrenizi girin (güvenlik gereksinimlerini karşılamalıdır)
   - Yeni şifrenizi tekrar girin
   - "Şifreyi Değiştir" butonuna tıklayın

## Unutulan Şifre Durumunda

Eğer admin şifrenizi unuttuysanız:

### Supabase Yönetim Panelinden Şifre Sıfırlama

1. Supabase yönetim panelindeki Authentication -> Users bölümüne gidin
2. admin@kritikyayinlari.com kullanıcısını bulun
3. "..." menüsünden "Reset Password" seçeneğini tıklayın
4. Şifre sıfırlama e-postası göndermek için "Send Reset Password Email" butonuna tıklayın
5. Alternatif olarak, şifreyi doğrudan ayarlamak için "Reset Password" seçeneğini kullanın

### Veritabanından Şifre Sıfırlama

Not: Şifreler hash'lenerek saklandığı için doğrudan veritabanından değiştirilemez.

## Güvenlik Önerileri

1. **Varsayılan şifreyi değiştirin**: İlk girişten sonra hemen admin123 şifresini değiştirin
2. **Güçlü şifreler kullanın**: Kriterlerin ötesinde, tahmin edilmesi zor şifreler seçin
3. **Düzenli değiştirin**: Şifrenizi en az 3 ayda bir değiştirin
4. **Paylaşmayın**: Admin şifresini güvenli bir şekilde saklayın, gereksiz paylaşmayın
5. **2FA kullanın**: Mümkünse iki faktörlü kimlik doğrulamayı etkinleştirin

## RLS Politikaları

Supabase'deki tablolarda Row Level Security (RLS) politikaları admin kullanıcılarını şu şekilde tanımlar:

1. Admin kullanıcıları şu kriterleri karşılamalıdır:
   - E-posta adresi @kritikyayinlari.com ile bitmelidir, VEYA
   - admin_profiles tablosunda kaydı olmalıdır

2. admin_profiles tablosunda sadece admin kullanıcılarının erişimi vardır

Bu yapı sayesinde, e-posta adresi doğrulaması ve admin_profiles tablosu üzerinden iki kademeli bir güvenlik sağlanmaktadır. 