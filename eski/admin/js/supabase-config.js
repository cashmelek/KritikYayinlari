// Supabase bağlantı yapılandırması
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Supabase istemcisini oluştur
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase kimlik doğrulama değişikliklerini dinle
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('Kullanıcı giriş yaptı:', session.user);
    } else if (event === 'SIGNED_OUT') {
        console.log('Kullanıcı çıkış yaptı');
    }
});

// Hata durumunda kullanıcıyı bilgilendirmek için global bir fonksiyon
function showSupabaseError(error) {
    console.error('Supabase hatası:', error);
    
    // Eğer bir bildirim sistemi varsa, hata bildirimini göster
    if (typeof showNotification === 'function') {
        showNotification('Veritabanı işlemi sırasında bir hata oluştu: ' + error.message, 'error');
    }
}

// Supabase Veritabanını Başlat (İlk Yükleme İçin)
async function initializeSupabaseDatabase() {
    try {
        // 1. about_page tablosunu oluştur
        const { error: createTableError } = await supabaseClient.rpc('create_about_page_table_if_not_exists');
        
        if (createTableError) {
            console.error('Tablo oluşturma hatası:', createTableError);
            
            // Tablo zaten varsa veya RPC fonksiyonu yoksa, SQL ile oluşturmayı dene
            const { error: sqlError } = await supabaseClient.rpc('execute_sql', {
                sql_query: `
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
                `
            });
            
            if (sqlError) {
                console.error('SQL ile tablo oluşturma hatası:', sqlError);
            }
        }
        
        // 2. Örnek veri ekle (eğer tablo boşsa)
        const { data: existingData, error: checkError } = await supabaseClient
            .from('about_page')
            .select('id')
            .limit(1);
            
        if (checkError) {
            console.error('Veri kontrol hatası:', checkError);
            return;
        }
        
        // Eğer veri yoksa, örnek veri ekle
        if (!existingData || existingData.length === 0) {
            const defaultData = {
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
            
            const { error: insertError } = await supabaseClient
                .from('about_page')
                .insert([defaultData]);
                
            if (insertError) {
                console.error('Örnek veri ekleme hatası:', insertError);
            } else {
                console.log('Hakkımızda sayfası için örnek veriler başarıyla eklendi.');
            }
        }
        
        console.log('Supabase veritabanı başarıyla başlatıldı.');
        
    } catch (error) {
        console.error('Supabase başlatma hatası:', error);
    }
}

// Sayfa yüklendiğinde veritabanını başlat
document.addEventListener('DOMContentLoaded', function() {
    // İlk sayfa yüklemesinde veritabanını kontrol et ve gerekirse başlat
    initializeSupabaseDatabase();
});

// Global değişken olarak dışa aktar
window.supabaseClient = supabaseClient;
