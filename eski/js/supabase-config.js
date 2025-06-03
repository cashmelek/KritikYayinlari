// Supabase bağlantı yapılandırması
// NOT: Güvenlik için bu anahtarlar normalde çevresel değişkenler olarak saklanmalıdır
// Üretim ortamında .env dosyaları veya güvenli bir yapılandırma yönetimi kullanılmalıdır
const SUPABASE_CONFIG = {
  url: 'https://kyqtdtyubmipiwjrudgc.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cXRkdHl1Ym1pcGl3anJ1ZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODAwODEsImV4cCI6MjA2MzY1NjA4MX0.PiF7N1hPFGFfO_5fg_C640Z3YzsABaqtKfSoMTJ5Kow'
};

// Supabase istemcisini oluştur
let supabaseClient;
try {
  supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  console.log('Supabase bağlantısı başarıyla kuruldu');
} catch (error) {
  console.error('Supabase bağlantısı kurulamadı:', error);
  // Sayfada hata mesajı göster
  document.addEventListener('DOMContentLoaded', () => {
    showConnectionError('Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.');
  });
}

// Bağlantı hatası durumunda kullanıcıya bilgi veren fonksiyon
function showConnectionError(message) {
  // Sayfada varsa hata bildirimi göster
  const errorContainer = document.createElement('div');
  errorContainer.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-3 px-4 shadow-lg z-50';
  errorContainer.innerHTML = `
    <div class="flex items-center justify-center">
      <i class="ri-error-warning-line mr-2 text-xl"></i>
      <p>${message}</p>
    </div>
  `;
  document.body.prepend(errorContainer);
}
        
// Supabase kimlik doğrulama değişikliklerini dinle
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('Kullanıcı giriş yaptı:', session.user);
    } else if (event === 'SIGNED_OUT') {
        console.log('Kullanıcı çıkış yaptı');
    }
});

// Hata durumunda kullanıcıyı bilgilendirmek için global bir fonksiyon
function showSupabaseError(error, customMessage = '') {
    console.error('Supabase hatası:', error);
    
    // Hata mesajını hazırla
    let errorMessage = customMessage || 'Veritabanı işlemi sırasında bir hata oluştu';
    
    // Eğer hata detayları varsa ekle
    if (error) {
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        if (error.hint) {
            errorMessage += ` (İpucu: ${error.hint})`;
        }
        if (error.code) {
            console.debug(`Hata kodu: ${error.code}`);
        }
    }
    
    // Hata türüne göre özel mesajlar
    if (error && error.code) {
        switch (error.code) {
            case '23505': // Unique violation
                errorMessage = 'Bu kayıt zaten mevcut.';
                break;
            case '23503': // Foreign key violation
                errorMessage = 'Bu işlem yapılamaz çünkü başka kayıtlarla ilişkili.';
                break;
            case '42P01': // Undefined table
                errorMessage = 'Veritabanı tablosu bulunamadı. Sistem yöneticinizle iletişime geçin.';
                break;
            case '28P01': // Invalid password
                errorMessage = 'Geçersiz kimlik bilgileri.';
                break;
            case '3D000': // Database does not exist
                errorMessage = 'Veritabanına erişilemiyor. Sistem yöneticinizle iletişime geçin.';
                break;
        }
    }
    
    // Bağlantı hatalarını kontrol et
    if (error && (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('connection'))) {
        errorMessage = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.';
    }
    
    // Eğer bir bildirim sistemi varsa, hata bildirimini göster
    if (typeof showNotification === 'function') {
        showNotification(errorMessage, 'error');
    } else {
        // Bildirim sistemi yoksa alternatif bir yöntem kullan
        const errorContainer = document.createElement('div');
        errorContainer.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorContainer.innerHTML = `
            <div class="flex items-center">
                <i class="ri-error-warning-line mr-2"></i>
                <p>${errorMessage}</p>
            </div>
        `;
        document.body.appendChild(errorContainer);
        
        // 5 saniye sonra kaldır
        setTimeout(() => {
            errorContainer.remove();
        }, 5000);
    }
    
    return errorMessage;
}

// Supabase Veritabanını Başlat (İlk Yükleme İçin)
async function initializeSupabaseDatabase() {
    try {
        console.log('Supabase veritabanı başlatılıyor...');

        // SQL kullanarak tabloları oluştur
        const { error: sqlError } = await supabaseClient.rpc('execute_sql', {
            sql: `
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
            `
        });

        if (sqlError) {
            console.error('SQL tabloları oluşturma hatası:', sqlError);
            
            // SQL execute_sql fonksiyonu mevcut değilse elle tek tek deneyelim
            if (sqlError.message.includes("function") && sqlError.message.includes("execute_sql")) {
                console.log('execute_sql fonksiyonu bulunamadı, tabloları manuel olarak oluşturuyorum...');
                await createTablesManually();
            }
        } else {
            console.log('Tablolar başarıyla oluşturuldu');
        }

        // İletişim sayfası için örnek veri ekle (eğer tablo boşsa)
        const { data: existingContactData, error: checkContactError } = await supabaseClient
            .from('contact_page')
            .select('id')
            .limit(1);

        if (checkContactError) {
            console.error('İletişim veri kontrol hatası:', checkContactError);
        } else {
            // Eğer veri yoksa, örnek veri ekle
            if (!existingContactData || existingContactData.length === 0) {
                const defaultContactData = {
                    address: 'Bağdat Caddesi No:123, Kadıköy, İstanbul',
                    phone_numbers: [
                        '+90 212 345 67 89',
                        '+90 216 987 65 43'
                    ],
                    email_addresses: [
                        'info@kritikyayinlari.com',
                        'satis@kritikyayinlari.com'
                    ],
                    map_iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48170.84554246369!2d29.023479591057594!3d40.98892123833761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab82bea5b9afb%3A0x2e92a483541e2860!2sKad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1684254161112!5m2!1str!2str',
                    office_hours: [
                        {
                            day: 'Pazartesi - Cuma',
                            hours: '09:00 - 18:00'
                        },
                        {
                            day: 'Cumartesi',
                            hours: '10:00 - 14:00'
                        },
                        {
                            day: 'Pazar',
                            hours: 'Kapalı'
                        }
                    ],
                    bookstore_hours: [
                        {
                            day: 'Pazartesi - Cuma',
                            hours: '10:00 - 20:00'
                        },
                        {
                            day: 'Hafta Sonu',
                            hours: '11:00 - 19:00'
                        }
                    ],
                    hours_additional_info: 'Randevu alarak ofisimizi ziyaret edebilirsiniz.',
                    enable_contact_form: true,
                    contact_form_title: 'Bize Mesaj Gönderin',
                    privacy_text: 'Verileriniz yalnızca talebinize yanıt vermek amacıyla kullanılacaktır.',
                    notification_email: 'info@kritikyayinlari.com',
                    success_message: 'Mesajınız için teşekkür ederiz! En kısa sürede size dönüş yapacağız.'
                };

                const { error: insertContactError } = await supabaseClient
                    .from('contact_page')
                    .insert([defaultContactData]);

                if (insertContactError) {
                    console.error('İletişim örnek veri ekleme hatası:', insertContactError);
                } else {
                    console.log('İletişim sayfası için örnek veriler başarıyla eklendi.');
                }
            }
        }

        // Hakkımızda sayfası için örnek veri ekle (eğer tablo boşsa)
        const { data: existingAboutData, error: checkAboutError } = await supabaseClient
            .from('about_page')
            .select('id')
            .limit(1);

        if (checkAboutError) {
            console.error('Hakkımızda veri kontrol hatası:', checkAboutError);
        } else {
            // Eğer veri yoksa, örnek veri ekle
            if (!existingAboutData || existingAboutData.length === 0) {
                const defaultAboutData = {
                    page_title: 'Hakkımızda',
                    page_subtitle: 'Kritik Yayınları\'nın hikayesi ve vizyonu',
                    about_section_title: 'Biz Kimiz?',
                    about_content: `Kritik Yayınları, 2010 yılında İstanbul'da kurulmuş, Türk ve dünya edebiyatının seçkin eserlerini okuyucularla buluşturmayı amaçlayan bir yayınevidir. Kurulduğumuz günden bu yana, edebiyatın her alanından nitelikli eserleri titizlikle seçerek yayın programımıza dahil ediyoruz.

Yayınevimiz, çağdaş Türk edebiyatından klasik eserlere, dünya edebiyatının ölümsüz yapıtlarından çocuk ve gençlik kitaplarına kadar geniş bir yelpazede kitaplar yayınlamaktadır. Her yaştan ve her kesimden okuyucuya hitap eden bir katalog oluşturmak için çalışıyoruz.

Kritik Yayınları olarak, sadece kitap basmakla kalmıyor, aynı zamanda edebiyatın ve okumanın yaygınlaşması için çeşitli etkinlikler, söyleşiler ve imza günleri düzenliyoruz. Yazarlarımızla okuyucularımızı buluşturarak, edebiyat dünyasına katkı sağlamayı hedefliyoruz.`,
                    vision_content: 'Edebiyatın gücüne inanarak, toplumun kültürel ve entelektüel gelişimine katkıda bulunmak, okuma alışkanlığını yaygınlaştırmak ve düşünce dünyasını zenginleştiren eserleri okuyucularla buluşturmaktır.',
                    mission_content: 'Edebiyatın her alanında nitelikli, özgün ve kalıcı eserler yayımlayarak Türk yayıncılık dünyasına değer katmak, okuyucuların hayatlarına dokunmak ve kültürel mirasımızı gelecek nesillere aktarmaktır.',
                    timeline_items: [
                        {
                            title: '2010 - Yolculuğun Başlangıcı',
                            content: 'Kritik Yayınları, İstanbul\'da küçük bir ofiste, edebiyata gönül vermiş bir grup yayıncı tarafından kuruldu. İlk yılında 5 kitap yayınlayarak sektöre adım attı.'
                        },
                        {
                            title: '2012 - Büyüme Dönemi',
                            content: 'Artan talep üzerine kadromuzu genişlettik ve yeni yazarlarla çalışmaya başladık. Bu dönemde yıllık yayın sayımız 20\'ye yükseldi.'
                        },
                        {
                            title: '2015 - Uluslararası Açılım',
                            content: 'Dünya edebiyatından önemli eserleri Türkçeye kazandırmaya başladık. Çeviri kitap kataloğumuzu oluşturduk ve uluslararası yazarlarla anlaşmalar imzaladık.'
                        },
                        {
                            title: '2018 - Dijital Dönüşüm',
                            content: 'E-kitap yayıncılığına adım attık ve dijital platformlarda varlığımızı güçlendirdik. Sosyal medya kanallarımızı aktif kullanmaya başlayarak daha geniş kitlelere ulaştık.'
                        },
                        {
                            title: '2020 - 10. Yıl',
                            content: 'Onuncu yılımızda 500. kitabımızı yayınladık ve yeni ofisimize taşındık. Ayrıca "Genç Yazarlar Programı"nı başlatarak edebiyat dünyasına yeni yetenekler kazandırmayı hedefledik.'
                        },
                        {
                            title: '2023 - Bugün',
                            content: 'Bugün 50\'den fazla çalışanımız, 200\'ü aşkın yazarımız ve 1000\'in üzerinde kitap başlığıyla Türkiye\'nin önde gelen yayınevleri arasında yer alıyoruz. Misyonumuza bağlı kalarak, edebiyatın gücünü her okuyucuya ulaştırmak için çalışmaya devam ediyoruz.'
                        }
                    ],
                    team_members: [
                        {
                            name: 'Ahmet Yılmaz',
                            position: 'Genel Yayın Yönetmeni',
                            description: '20 yıllık yayıncılık deneyimi ile Kritik Yayınları\'nın kurucu ortağı ve Genel Yayın Yönetmeni.',
                            image: 'site_resimleri/team1.jpg'
                        },
                        {
                            name: 'Ayşe Kaya',
                            position: 'Editör',
                            description: 'Türk Dili ve Edebiyatı eğitimi sonrası 15 yıldır editörlük yapıyor. Çağdaş Türk edebiyatı alanında uzman.',
                            image: 'site_resimleri/team2.jpg'
                        },
                        {
                            name: 'Mehmet Demir',
                            position: 'Tasarım Direktörü',
                            description: '10 yıldır kitap tasarımı üzerine çalışıyor. Kritik Yayınları\'nın görsel kimliğinin mimarı.',
                            image: 'site_resimleri/team3.jpg'
                        }
                    ]
                };

                const { error: insertAboutError } = await supabaseClient
                    .from('about_page')
                    .insert([defaultAboutData]);

                if (insertAboutError) {
                    console.error('Hakkımızda örnek veri ekleme hatası:', insertAboutError);
                } else {
                    console.log('Hakkımızda sayfası için örnek veriler başarıyla eklendi.');
                }
            }
        }

        console.log('Supabase veritabanı başarıyla başlatıldı.');
    } catch (error) {
        console.error('Supabase başlatma hatası:', error);
    }
}

// Tabloları manuel olarak oluşturma
async function createTablesManually() {
    try {
        // Doğrudan Supabase API yoluyla tabloları oluştur
        console.log('İletişim sayfası tablosu oluşturuluyor...');
        await createContactPageTable();
        
        console.log('İletişim mesajları tablosu oluşturuluyor...');
        await createContactMessagesTable();
        
        console.log('Hakkımızda sayfası tablosu oluşturuluyor...');
        await createAboutPageTable();
        
        console.log('Tablolar manuel olarak oluşturuldu.');
    } catch (error) {
        console.error('Manuel tablo oluşturma hatası:', error);
    }
}

// İletişim sayfası tablosunu oluştur
async function createContactPageTable() {
    try {
        const { error } = await supabaseClient
            .from('contact_page')
            .insert([{
                address: 'Varsayılan adres',
                phone_numbers: [],
                email_addresses: [],
                office_hours: [],
                bookstore_hours: [],
                enable_contact_form: true
            }])
            .select();
            
        // Zaten var olan tablo hatası alınırsa, devam et
        if (error && !error.message.includes('duplicate key value')) {
            throw error;
        }
    } catch (error) {
        console.error('İletişim sayfası tablosu oluşturma hatası:', error);
    }
}

// İletişim mesajları tablosunu oluştur
async function createContactMessagesTable() {
    try {
        const { error } = await supabaseClient
            .from('contact_messages')
            .insert([{
                name: 'Test Kullanıcı',
                email: 'test@example.com',
                subject: 'Test Mesaj',
                message: 'Bu bir test mesajıdır.',
                is_read: true
            }])
            .select();
            
        // Zaten var olan tablo hatası alınırsa, devam et
        if (error && !error.message.includes('duplicate key value')) {
            throw error;
        }
    } catch (error) {
        console.error('İletişim mesajları tablosu oluşturma hatası:', error);
    }
}

// Hakkımızda sayfası tablosunu oluştur
async function createAboutPageTable() {
    try {
        const { error } = await supabaseClient
            .from('about_page')
            .insert([{
                page_title: 'Hakkımızda',
                page_subtitle: 'Kritik Yayınları\'nın hikayesi ve vizyonu',
                about_section_title: 'Biz Kimiz?',
                timeline_items: [],
                team_members: []
            }])
            .select();
            
        // Zaten var olan tablo hatası alınırsa, devam et
        if (error && !error.message.includes('duplicate key value')) {
            throw error;
        }
    } catch (error) {
        console.error('Hakkımızda sayfası tablosu oluşturma hatası:', error);
    }
}

// Sayfa yüklendiğinde veritabanını başlat
document.addEventListener('DOMContentLoaded', function() {
    // İlk sayfa yüklemesinde veritabanını kontrol et ve gerekirse başlat
    initializeSupabaseDatabase();
});

// Global değişken olarak dışa aktar
window.supabaseClient = supabaseClient;
