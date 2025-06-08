// Supabase Config JS - Kritik Yayınları Admin Panel
// Bu dosya hem gerçek Supabase bağlantısını hem de offline mod için yerel veritabanı simülasyonunu içerir

// Supabase Bağlantı Bilgileri
const SUPABASE_URL = 'https://ikpjyzsdgqdjdctxykni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcGp5enNkZ3FkamRjdHh5a25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDMwNzIwMDAsImV4cCI6MTk1ODY0ODAwMH0.KYeDB8XyDR8LHxZnTUaaLIm2LWA5KbZAiXPBgCYl3bI';

// Yerel depolama fonksiyonları
function getLocalData(tableName) {
    const data = localStorage.getItem(`kritik_db_${tableName}`);
    return data ? JSON.parse(data) : null;
}

function saveLocalData(tableName, data) {
    localStorage.setItem(`kritik_db_${tableName}`, JSON.stringify(data));
}

// Online/Offline modu için durum değişkeni
let isOnlineMode = true;

// SQLite benzeri yerel veritabanı simülasyonu
class LocalDatabase {
    constructor() {
        // Veritabanı tabloları
        this.tables = {
            books: getLocalData('books') || [],
            authors: getLocalData('authors') || [],
            pages: getLocalData('pages') || [],
            contacts: getLocalData('contacts') || [],
            admin_users: getLocalData('admin_users') || []
        };

        // Başlangıç verilerini yükle
        this.initData();
        console.log('Yerel veritabanı başlatıldı');
    }

    // Veritabanını başlatma
    initData() {
        // Eğer admin_users tablosu boşsa, örnek veri ekle
        if (!this.tables.admin_users || this.tables.admin_users.length === 0) {
            this.tables.admin_users = [
                {
                    id: 1,
                    user_id: 'admin-id-123',
                    username: 'admin',
                    email: 'admin@kritikyayinlari.com',
                    name: 'Yönetici',
                    role: 'admin',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            saveLocalData('admin_users', this.tables.admin_users);
        }

        // Eğer pages tablosu boşsa, örnek veri ekle
        if (!this.tables.pages || this.tables.pages.length === 0) {
            this.tables.pages = [
                {
                    id: 1,
                    slug: 'hakkimizda',
                    title: 'Hakkımızda',
                    content: 'Kritik Yayınları, 2010 yılında İstanbul\'da kurulmuş, Türk ve dünya edebiyatının seçkin eserlerini okuyucularla buluşturmayı amaçlayan bir yayınevidir.',
                    image_url: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            saveLocalData('pages', this.tables.pages);
        }

        // Eğer contacts tablosu boşsa, örnek veri ekle
        if (!this.tables.contacts || this.tables.contacts.length === 0) {
            this.tables.contacts = [
                {
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
                    map_embed: '<iframe src="https://www.google.com/maps/embed?..." width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            saveLocalData('contacts', this.tables.contacts);
        }

        // Örnek kitap ve yazar verileri
        if (!this.tables.books || this.tables.books.length === 0) {
            this.tables.books = [
                {
                    id: 1,
                    title: 'Beyaz Zambaklar Ülkesinde',
                    author_id: 1,
                    description: 'Finlandiya\'nın ulusal kalkınma hikayesi',
                    price: 120,
                    image_url: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Saatleri Ayarlama Enstitüsü',
                    author_id: 2,
                    description: 'Türk edebiyatının en önemli romanlarından biri',
                    price: 150,
                    image_url: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            saveLocalData('books', this.tables.books);
        }

        if (!this.tables.authors || this.tables.authors.length === 0) {
            this.tables.authors = [
            { 
                id: 1, 
                    name: 'Grigory Petrov',
                    biography: 'Rus yazar ve din adamı',
                    image_url: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Ahmet Hamdi Tanpınar',
                    biography: 'Türk edebiyatının önemli yazarlarından',
                    image_url: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            ];
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
                    const updatedTable = [...table];
                    
                    // Çakışma alanı kontrolü
                    if (options.onConflict && data[options.onConflict]) {
                        const conflictField = options.onConflict;
                        const existingIndex = updatedTable.findIndex(item => item[conflictField] === data[conflictField]);
                        
                        if (existingIndex !== -1) {
                            // Mevcut kaydı güncelle
                            updatedTable[existingIndex] = { 
                                ...updatedTable[existingIndex], 
                                ...data, 
                                updated_at: new Date().toISOString() 
                            };
                        } else {
                            // Yeni kayıt ekle
                            const newId = updatedTable.length > 0 ? Math.max(...updatedTable.map(item => item.id)) + 1 : 1;
                            updatedTable.push({ 
                                id: newId, 
                                ...data, 
                                created_at: new Date().toISOString(), 
                                updated_at: new Date().toISOString() 
                            });
                        }
                    } else if (data.id) {
                        // ID varsa güncelleme yap
                        const index = updatedTable.findIndex(item => item.id === data.id);
                        
                        if (index !== -1) {
                            updatedTable[index] = { 
                                ...updatedTable[index], 
                                ...data, 
                                updated_at: new Date().toISOString() 
                            };
                        } else {
                            // ID var ama kayıt yoksa ekle
                            updatedTable.push({ 
                                ...data, 
                                created_at: new Date().toISOString(), 
                                updated_at: new Date().toISOString() 
                            });
                        }
                    } else {
                        // Yeni kayıt ekle
                        const newId = updatedTable.length > 0 ? Math.max(...updatedTable.map(item => item.id)) + 1 : 1;
                        updatedTable.push({ 
                            id: newId, 
                            ...data, 
                            created_at: new Date().toISOString(), 
                            updated_at: new Date().toISOString() 
                        });
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

    // Auth simülasyonu için basit fonksiyonlar
    auth = {
        signInWithPassword: async ({ email, password }) => {
            try {
                // Admin kullanıcı kontrolü
                if ((email === 'admin@kritikyayinlari.com' || email === 'admin') && password === 'kritik2023') {
                    // Kullanıcı ID'si oluştur
                    const userId = 'admin-id-123';
                    
                    // Admin kullanıcı bilgisi
                    const adminUser = {
                        id: userId,
                        email: 'admin@kritikyayinlari.com',
                        user_metadata: {
                            name: 'Yönetici'
                        }
                    };
                    
                    // Oturum bilgisi
                    const session = {
                        access_token: 'simulated-access-token',
                        refresh_token: 'simulated-refresh-token',
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime() // 24 saat
                    };
                    
                    return {
                        data: {
                            user: adminUser,
                            session: session
                        },
                        error: null
                    };
                }
                
                return {
                    data: null,
                    error: {
                        message: 'Geçersiz e-posta veya şifre'
                    }
                };
            } catch (error) {
                    return {
                        data: null,
                        error: {
                        message: error.message
                        }
                    };
                }
            },
            
        signInWithOtp: async ({ email }) => {
            // Magic link simülasyonu
            console.log(`Magic link gönderiliyor: ${email}`);
            return {
                data: {},
                error: null
            };
        },
        
        resetPasswordForEmail: async (email) => {
            // Şifre sıfırlama simülasyonu
            console.log(`Şifre sıfırlama bağlantısı gönderiliyor: ${email}`);
            return {
                data: {},
                error: null
            };
        },
        
        setSession: async ({ access_token, refresh_token }) => {
            // Oturum kurma simülasyonu
            if (access_token === 'simulated-access-token') {
                const adminUser = {
                    id: 'admin-id-123',
                    email: 'admin@kritikyayinlari.com',
                    user_metadata: {
                        name: 'Yönetici'
                    }
                };
                
                const session = {
                    access_token,
                    refresh_token,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime()
                };
                
                return {
                    data: {
                        user: adminUser,
                        session: session
                    },
                    error: null
                };
            }
            
            return {
                data: null,
                error: {
                    message: 'Geçersiz oturum bilgisi'
                }
            };
        }
    }
}

// Gerçek Supabase bağlantısını dene
async function initializeSupabase() {
    try {
        // Eğer Supabase.js yüklü ise, gerçek bağlantıyı dene
        if (typeof supabase !== 'undefined') {
            console.log('Gerçek Supabase bağlantısı kuruluyor...');
            window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Bağlantıyı test et
            const { data, error } = await window.supabaseClient.from('admin_users').select('count').limit(1);
            
            if (error) {
                throw new Error('Supabase bağlantı hatası: ' + error.message);
            }
            
            console.log('Gerçek Supabase bağlantısı başarılı');
            isOnlineMode = true;
            return true;
        }
        } catch (error) {
        console.warn('Gerçek Supabase bağlantısı kurulamadı:', error);
    }
    
    // Bağlantı kurulamazsa veya hata oluşursa offline moda geç
    console.log('Offline moda geçiliyor...');
    window.supabaseClient = new LocalDatabase();
    isOnlineMode = false;
    return false;
}

// Admin tabloların var olduğunu kontrol et ve yoksa oluştur
async function ensureAdminTables() {
    try {
        if (!window.supabaseClient) {
            console.error('Supabase bağlantısı bulunamadı');
            return false;
        }
        
        // Offline modda ise yapılacak bir şey yok
        if (!isOnlineMode) {
            console.log('Offline modda admin tabloları zaten hazır');
            return true;
        }
        
        // admin_users tablosunu kontrol et
        const { error: checkError } = await window.supabaseClient.from('admin_users').select('count').limit(1);
        
        if (checkError && checkError.code === '42P01') { // Tablo yok hatası
            console.log('Admin tabloları oluşturuluyor...');
            
            // SQL sorgusu ile tabloları oluştur
            const { error: createError } = await window.supabaseClient.rpc('create_admin_tables');
            
            if (createError) {
                console.error('Admin tabloları oluşturulurken hata:', createError);
                return false;
            }
            
            console.log('Admin tabloları başarıyla oluşturuldu');
            return true;
        }
        
        return true;
    } catch (error) {
        console.error('Admin tabloları kontrol edilirken hata:', error);
        return false;
    }
}

// Supabase bağlantısını başlat
initializeSupabase().then(isConnected => {
    console.log(`Supabase ${isConnected ? 'online' : 'offline'} modda başlatıldı`);
    
    // Admin tablolarını kontrol et
    ensureAdminTables().then(isReady => {
        console.log(`Admin tabloları ${isReady ? 'hazır' : 'hazır değil'}`);
    });
});

// Veritabanı bağlantı durumunu kontrol et ve UI'da göster
function checkDatabaseConnection() {
    const status = isOnlineMode ? 'online' : 'offline';
    console.log(`Veritabanı bağlantı durumu: ${status}`);
    
    // Bağlantı durumunu göster
    if (document.getElementById('connection-status')) {
        document.getElementById('connection-status').innerHTML = `
            <div class="alert ${isOnlineMode ? 'alert-success' : 'alert-warning'}">
                <i class="ri-${isOnlineMode ? 'check-line' : 'wifi-off-line'} mr-2"></i>
                Veritabanı: ${isOnlineMode ? 'Online Mod' : 'Offline Mod'}
            </div>
        `;
    }
    
    return isOnlineMode;
}

// Global değişken olarak dışa aktar
window.checkDatabaseConnection = checkDatabaseConnection;
window.ensureAdminTables = ensureAdminTables;
