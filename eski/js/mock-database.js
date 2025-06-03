// Mock Database - Hakkımızda Sayfası için
// Gerçek bir Supabase veritabanı bağlantısı olmadığında kullanılacak yerel veri saklama mekanizması

// Varsayılan veri
const defaultAboutPageData = {
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

// LocalStorage tabanlı veri saklama
class MockDatabase {
    constructor() {
        this.storageKey = 'kritik_about_page_data';
        this.initializeData();
    }
    
    // Veritabanını başlat
    initializeData() {
        // LocalStorage'dan veriyi al
        const storedData = localStorage.getItem(this.storageKey);
        
        // Eğer veri yoksa, varsayılan veriyi kullan
        if (!storedData) {
            localStorage.setItem(this.storageKey, JSON.stringify(defaultAboutPageData));
            console.log('Mock veritabanı varsayılan verilerle başlatıldı.');
        } else {
            console.log('Mock veritabanı mevcut verilerle başlatıldı.');
        }
    }
    
    // Veriyi getir (select)
    async getAboutPageData() {
        return new Promise((resolve) => {
            try {
                const data = JSON.parse(localStorage.getItem(this.storageKey)) || defaultAboutPageData;
                
                // Gerçek Supabase'in davranışını taklit etmek için
                setTimeout(() => {
                    resolve({ data, error: null });
                }, 300); // 300ms gecikme ile yanıt ver
            } catch (error) {
                resolve({ data: null, error: { message: 'Veri alınamadı: ' + error.message } });
            }
        });
    }
    
    // Veriyi güncelle (upsert)
    async updateAboutPageData(newData) {
        return new Promise((resolve) => {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(newData));
                
                // Gerçek Supabase'in davranışını taklit etmek için
                setTimeout(() => {
                    resolve({ data: newData, error: null });
                }, 300); // 300ms gecikme ile yanıt ver
            } catch (error) {
                resolve({ data: null, error: { message: 'Veri güncellenemedi: ' + error.message } });
            }
        });
    }
    
    // Veriyi sıfırla (reset to default)
    async resetToDefault() {
        return new Promise((resolve) => {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(defaultAboutPageData));
                
                setTimeout(() => {
                    resolve({ data: defaultAboutPageData, error: null });
                }, 300);
            } catch (error) {
                resolve({ data: null, error: { message: 'Veri sıfırlanamadı: ' + error.message } });
            }
        });
    }
}

// Mock Supabase nesnesi
const mockSupabase = {
    from: (tableName) => {
        if (tableName === 'about_page') {
            return {
                select: () => {
                    return {
                        single: async () => {
                            const db = new MockDatabase();
                            return await db.getAboutPageData();
                        }
                    };
                },
                upsert: async (data) => {
                    const db = new MockDatabase();
                    return await db.updateAboutPageData(data[0]);
                }
            };
        }
        
        // Diğer tablolar için boş bir nesne döndür
        return {
            select: () => ({ data: null, error: { message: 'Tablo bulunamadı: ' + tableName } }),
            upsert: () => ({ data: null, error: { message: 'Tablo bulunamadı: ' + tableName } })
        };
    }
};

// Global olarak kullanılabilir hale getir
window.supabaseClient = mockSupabase;
console.log('Mock Supabase veritabanı başarıyla yüklendi!');

// Sayfa yüklendiğinde veritabanını başlat
document.addEventListener('DOMContentLoaded', function() {
    const db = new MockDatabase();
    console.log('Mock Database başlatıldı.');
}); 