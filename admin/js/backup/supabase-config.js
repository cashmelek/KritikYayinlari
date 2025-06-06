// SQLite veritabanı simülasyonu
console.log('Yerel veritabanı bağlantısı başlatılıyor...');

// Yerel depolama fonksiyonları
function getLocalData(tableName) {
    const data = localStorage.getItem(`kritik_db_${tableName}`);
    return data ? JSON.parse(data) : null;
}

function saveLocalData(tableName, data) {
    localStorage.setItem(`kritik_db_${tableName}`, JSON.stringify(data));
}

// SQLite benzeri bir yapı oluşturuyoruz
class LocalDatabase {
    constructor() {
        // Veritabanı tabloları
        this.tables = {
            books: getLocalData('books') || [],
            authors: getLocalData('authors') || [],
            pages: getLocalData('pages') || [],
            contacts: getLocalData('contacts') || []
        };
        
        // Başlangıç verilerini yükle
        this.initData();
        console.log('Yerel veritabanı başlatıldı');
    }
    
    // Veritabanını başlatma
    initData() {
        // Eğer pages tablosu boşsa, örnek veri ekle
        if (this.tables.pages.length === 0) {
            this.tables.pages.push({
                id: 1,
                slug: 'hakkimizda',
                title: 'Hakkımızda',
                content: 'Kritik Yayınları, 2010 yılında İstanbul\'da kurulmuş, Türk ve dünya edebiyatının seçkin eserlerini okuyucularla buluşturmayı amaçlayan bir yayınevidir. Kurulduğumuz günden bu yana, edebiyatın her alanından nitelikli eserleri titizlikle seçerek yayın programımıza dahil ediyoruz.\n\nYayınevimiz, çağdaş Türk edebiyatından klasik eserlere, dünya edebiyatının ölümsüz yapıtlarından çocuk ve gençlik kitaplarına kadar geniş bir yelpazede kitaplar yayınlamaktadır. Her yaştan ve her kesimden okuyucuya hitap eden bir katalog oluşturmak için çalışıyoruz.\n\nKritik Yayınları olarak, sadece kitap basmakla kalmıyor, aynı zamanda edebiyatın ve okumanın yaygınlaşması için çeşitli etkinlikler, söyleşiler ve imza günleri düzenliyoruz. Yazarlarımızla okuyucularımızı buluşturarak, edebiyat dünyasına katkı sağlamayı hedefliyoruz.',
                image_url: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
            saveLocalData('pages', this.tables.pages);
        }
        
        // Eğer contacts tablosu boşsa, örnek veri ekle
        if (this.tables.contacts.length === 0) {
            this.tables.contacts.push({
                id: 1,
                address: 'İstanbul, Türkiye',
                phone: '+90 212 123 45 67',
                email: 'info@kritikyayinlari.com',
                work_hours: 'Pazartesi-Cuma: 09:00-18:00',
                social_media: {
                    facebook: 'https://facebook.com/kritikyayinlari',
                    twitter: 'https://twitter.com/kritikyayinlari',
                    instagram: 'https://instagram.com/kritikyayinlari',
                    youtube: ''
                },
                map_embed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12037.25802419999!2d28.978694!3d41.036129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2zVGFrc2ltIFNxdWFyZSwgR8O8bcO8xZ9zdXl1LCDEsHN0YW5idWwsIFTDvHJraXll!5e0!3m2!1sen!2str!4v1631234567890!5m2!1sen!2str" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
            saveLocalData('contacts', this.tables.contacts);
        }
        
        // Örnek kitap ve yazar verileri
        if (this.tables.books.length === 0) {
            this.tables.books.push({
                id: 1,
                title: 'Beyaz Zambaklar Ülkesinde',
                author_id: 1,
                description: 'Finlandiya\'nın ulusal kalkınma hikayesi',
                price: 120,
                image_url: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
            this.tables.books.push({
                id: 2,
                title: 'Saatleri Ayarlama Enstitüsü',
                author_id: 2,
                description: 'Türk edebiyatının en önemli romanlarından biri',
                price: 150,
                image_url: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
            saveLocalData('books', this.tables.books);
        }
        
        if (this.tables.authors.length === 0) {
            this.tables.authors.push({
                id: 1,
                name: 'Grigory Petrov',
                biography: 'Rus yazar ve din adamı',
                image_url: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
            this.tables.authors.push({
                id: 2,
                name: 'Ahmet Hamdi Tanpınar',
                biography: 'Türk edebiyatının önemli yazarlarından',
                image_url: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
            saveLocalData('authors', this.tables.authors);
        }
    }
    
    // Supabase benzeri bir API
    from(tableName) {
        return {
            // Veri seçimi
            select: (fields) => {
                return {
                    // Eşitlik kontrolü
                    eq: (field, value) => {
                        return {
                            // Tek kayıt döndürme
                            single: () => {
                                try {
                                    const table = this.tables[tableName] || [];
                                    const result = table.find(item => item[field] === value);
                                    
                                    return {
                                        data: result || null,
                                        error: null
                                    };
                                } catch (error) {
                                    console.error(`${tableName} tablosunda veri alırken hata:`, error);
                                    return {
                                        data: null,
                                        error: { message: error.message }
                                    };
                                }
                            },
                            // Tüm eşleşen kayıtları döndürme
                            execute: () => {
                                try {
                                    const table = this.tables[tableName] || [];
                                    const results = table.filter(item => item[field] === value);
                                    
                                    return {
                                        data: results,
                                        error: null
                                    };
                                } catch (error) {
                                    console.error(`${tableName} tablosunda veri alırken hata:`, error);
                                    return {
                                        data: null,
                                        error: { message: error.message }
                                    };
                                }
                            }
                        };
                    },
                    // Sıralama
                    order: (field, options = {}) => {
                        return {
                            // Kayıt limiti
                            limit: (limit) => {
                                try {
                                    const table = this.tables[tableName] || [];
                                    const sorted = [...table].sort((a, b) => {
                                        if (options.ascending) {
                                            return a[field] > b[field] ? 1 : -1;
                                        } else {
                                            return a[field] < b[field] ? 1 : -1;
                                        }
                                    });
                                    
                                    const limited = sorted.slice(0, limit);
                                    
                                    return {
                                        data: limited,
                                        error: null
                                    };
                                } catch (error) {
                                    console.error(`${tableName} tablosunda veri alırken hata:`, error);
                                    return {
                                        data: null,
                                        error: { message: error.message }
                                    };
                                }
                            },
                            // Tüm sıralanmış kayıtları döndürme
                            execute: () => {
                                try {
                                    const table = this.tables[tableName] || [];
                                    const sorted = [...table].sort((a, b) => {
                                        if (options.ascending) {
                                            return a[field] > b[field] ? 1 : -1;
                                        } else {
                                            return a[field] < b[field] ? 1 : -1;
                                        }
                                    });
                                    
                                    return {
                                        data: sorted,
                                        error: null
                                    };
                                } catch (error) {
                                    console.error(`${tableName} tablosunda veri alırken hata:`, error);
                                    return {
                                        data: null,
                                        error: { message: error.message }
                                    };
                                }
                            }
                        };
                    },
                    // Limit
                    limit: (limit) => {
                        try {
                            const table = this.tables[tableName] || [];
                            const limited = table.slice(0, limit);
                            
                            return {
                                data: limited,
                                error: null
                            };
                        } catch (error) {
                            console.error(`${tableName} tablosunda veri alırken hata:`, error);
                            return {
                                data: null,
                                error: { message: error.message }
                            };
                        }
                    },
                    // Tüm kayıtları döndürme
                    execute: () => {
                        try {
                            const table = this.tables[tableName] || [];
                            
                            return {
                                data: table,
                                error: null
                            };
                        } catch (error) {
                            console.error(`${tableName} tablosunda veri alırken hata:`, error);
                            return {
                                data: null,
                                error: { message: error.message }
                            };
                        }
                    }
                };
            },
            // Veri ekleme/güncelleme
            upsert: (data, options = {}) => {
                try {
                    const table = this.tables[tableName] || [];
                    let updatedTable = [...table];
                    
                    // Veriyi güncelle veya ekle
                    if (data.id) {
                        // ID varsa güncelleme yap
                        const index = updatedTable.findIndex(item => item.id === data.id);
                        
                        if (index !== -1) {
                            updatedTable[index] = { ...updatedTable[index], ...data, updated_at: new Date().toISOString() };
                        } else {
                            // ID var ama tabloda yok, yeni kayıt ekle
                            updatedTable.push({ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                        }
                    } else if (options.onConflict && data[options.onConflict]) {
                        // Çakışma durumunda güncelleme yap
                        const conflictField = options.onConflict;
                        const index = updatedTable.findIndex(item => item[conflictField] === data[conflictField]);
                        
                        if (index !== -1) {
                            updatedTable[index] = { ...updatedTable[index], ...data, updated_at: new Date().toISOString() };
                        } else {
                            // Yeni kayıt ekle
                            const newId = updatedTable.length > 0 ? Math.max(...updatedTable.map(item => item.id || 0)) + 1 : 1;
                            updatedTable.push({ id: newId, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                        }
                    } else {
                        // Yeni kayıt ekle
                        const newId = updatedTable.length > 0 ? Math.max(...updatedTable.map(item => item.id || 0)) + 1 : 1;
                        updatedTable.push({ id: newId, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                    }
                    
                    // Veritabanını güncelle
                    this.tables[tableName] = updatedTable;
                    saveLocalData(tableName, updatedTable);
                    
                    return {
                        data: data,
                        error: null
                    };
                } catch (error) {
                    console.error(`${tableName} tablosuna veri eklerken/güncellerken hata:`, error);
                    return {
                        data: null,
                        error: { message: error.message }
                    };
                }
            }
        };
    }
}

// Supabase istemcisi yerine yerel veritabanı
const supabaseClient = new LocalDatabase();

// Global değişken olarak dışa aktar
window.supabaseClient = supabaseClient;

// Veritabanı bağlantısını kontrol et
function checkDatabaseConnection() {
    console.log('Yerel veritabanı bağlantısı kontrol ediliyor...');
    
    try {
        // Bağlantı başarılı
        if (document.getElementById('connection-status')) {
            document.getElementById('connection-status').innerHTML = `
                <div class="alert alert-success">
                    <i class="ri-check-line mr-2"></i>
                    Yerel veritabanı bağlantısı başarılı
                </div>
            `;
        }
        
        return true;
    } catch (error) {
        console.error('Yerel veritabanı kontrolü sırasında hata:', error);
        
        // Admin panel arayüzünde hata göster
        if (document.getElementById('connection-status')) {
            document.getElementById('connection-status').innerHTML = `
                <div class="alert alert-danger">
                    <i class="ri-error-warning-line mr-2"></i>
                    Yerel veritabanı kontrolü sırasında hata oluştu: ${error.message}
                </div>
            `;
            }
        
        return false;
    }
}

// Sayfa yüklendiğinde veritabanı bağlantısını kontrol et
document.addEventListener('DOMContentLoaded', function() {
    // Veritabanı bağlantısını kontrol et
    checkDatabaseConnection();
});
