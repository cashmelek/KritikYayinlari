// Güvenli Supabase Konfigürasyonu
// Bu dosya production ortamı için optimize edilmiştir

// Çevre değişkenlerinden konfigürasyon al
const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || 'https://kyqtdtyubmipiwjrudgc.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cXRkdHl1Ym1pcGl3anJ1ZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODAwODEsImV4cCI6MjA2MzY1NjA4MX0.PiF7N1hPFGFfO_5fg_C640Z3YzsABaqtKfSoMTJ5Kow',
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        },
        global: {
            headers: {
                'X-Client-Info': 'kritik-yayinlari-web'
            }
        }
    }
};

// Supabase istemcisini oluştur
const supabaseClient = supabase.createClient(
    SUPABASE_CONFIG.url, 
    SUPABASE_CONFIG.anonKey,
    SUPABASE_CONFIG.options
);

// Bağlantı durumu kontrolü
let connectionStatus = {
    isConnected: false,
    lastCheck: null,
    retryCount: 0,
    maxRetries: 3
};

// Veritabanı bağlantısını kontrol et
async function checkDatabaseConnection() {
    try {
        console.log('🔄 Supabase bağlantısı kontrol ediliyor...');
        
        const { data, error } = await supabaseClient
            .from('books')
            .select('count')
            .limit(1);

        if (error) {
            throw error;
        }

        connectionStatus.isConnected = true;
        connectionStatus.lastCheck = new Date();
        connectionStatus.retryCount = 0;
        
        console.log('✅ Supabase bağlantısı başarılı');
        return true;
    } catch (error) {
        console.error('❌ Supabase bağlantı hatası:', error);
        connectionStatus.isConnected = false;
        connectionStatus.retryCount++;
        
        // Otomatik yeniden deneme
        if (connectionStatus.retryCount <= connectionStatus.maxRetries) {
            console.log(`🔄 Yeniden deneme ${connectionStatus.retryCount}/${connectionStatus.maxRetries}`);
            setTimeout(() => checkDatabaseConnection(), 2000 * connectionStatus.retryCount);
        }
        
        return false;
    }
}

// Auth durumu değişikliklerini dinle
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log('🔐 Auth durumu değişti:', event);
    
    switch (event) {
        case 'SIGNED_IN':
            console.log('✅ Kullanıcı giriş yaptı:', session.user.email);
            await handleUserSignIn(session);
            break;
            
        case 'SIGNED_OUT':
            console.log('👋 Kullanıcı çıkış yaptı');
            handleUserSignOut();
            break;
            
        case 'TOKEN_REFRESHED':
            console.log('🔄 Token yenilendi');
            updateSessionStorage(session);
            break;
            
        case 'USER_UPDATED':
            console.log('👤 Kullanıcı bilgileri güncellendi');
            break;
    }
});

// Kullanıcı giriş işlemi
async function handleUserSignIn(session) {
    try {
        // Admin kontrolü yap
        const adminData = await checkAdminUser(session.user);
        
        if (adminData) {
            // Admin session bilgilerini kaydet
            const sessionData = {
                user: session.user,
                admin: adminData,
                loginTime: new Date().toISOString(),
                expiresAt: session.expires_at
            };
            
            sessionStorage.setItem('kritik_admin_session', JSON.stringify(sessionData));
            
            // Admin dashboard'a yönlendir
            if (window.location.pathname.includes('/admin/login.html')) {
                window.location.href = '/admin/index.html';
            }
        } else {
            console.warn('⚠️ Kullanıcı admin yetkisine sahip değil');
            await supabaseClient.auth.signOut();
        }
    } catch (error) {
        console.error('❌ Giriş işlemi sırasında hata:', error);
        showError('Giriş işlemi sırasında bir hata oluştu');
    }
}

// Kullanıcı çıkış işlemi
function handleUserSignOut() {
    // Session verilerini temizle
    sessionStorage.removeItem('kritik_admin_session');
    sessionStorage.removeItem('kritik_admin_logged_in');
    sessionStorage.removeItem('kritik_admin_user');
    sessionStorage.removeItem('kritik_admin_user_data');
    sessionStorage.removeItem('kritik_admin_login_time');
    
    // Login sayfasına yönlendir
    if (window.location.pathname.includes('/admin/') && 
        !window.location.pathname.includes('/admin/login.html')) {
        window.location.href = '/admin/login.html';
    }
}

// Session storage güncelle
function updateSessionStorage(session) {
    try {
        const existingData = JSON.parse(sessionStorage.getItem('kritik_admin_session') || '{}');
        existingData.user = session.user;
        existingData.expiresAt = session.expires_at;
        sessionStorage.setItem('kritik_admin_session', JSON.stringify(existingData));
    } catch (error) {
        console.error('❌ Session güncelleme hatası:', error);
    }
}

// Admin kullanıcı kontrolü
async function checkAdminUser(user) {
    if (!user) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('ℹ️ Admin kullanıcı bulunamadı');
                return null;
            }
            throw error;
        }
        
        // Son giriş zamanını güncelle
        await supabaseClient
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.id);
        
        return data;
    } catch (error) {
        console.error('❌ Admin kontrolü hatası:', error);
        return null;
    }
}

// Hata gösterme fonksiyonu
function showError(message) {
    // Toast notification veya modal göster
    if (typeof showNotification === 'function') {
        showNotification(message, 'error');
    } else {
        console.error('Hata:', message);
    }
}

// Başarı mesajı gösterme
function showSuccess(message) {
    if (typeof showNotification === 'function') {
        showNotification(message, 'success');
    } else {
        console.log('✅', message);
    }
}

// API çağrıları için wrapper fonksiyonlar
const SupabaseAPI = {
    // Kitaplar
    async getBooks(filters = {}) {
        try {
            let query = supabaseClient
                .from('books')
                .select(`
                    *,
                    authors:author_id (
                        id,
                        name,
                        photo_url
                    )
                `)
                .eq('is_active', true);
            
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            
            if (filters.isNew) {
                query = query.eq('is_new', true);
            }
            
            if (filters.isBestseller) {
                query = query.eq('is_bestseller', true);
            }
            
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            
            query = query.order('id', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Kitaplar getirme hatası:', error);
            return { success: false, error: error.message };
        }
    },

    // Yazarlar
    async getAuthors() {
        try {
            const { data, error } = await supabaseClient
                .from('authors')
                .select('*')
                .eq('is_active', true)
                .order('name');
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Yazarlar getirme hatası:', error);
            return { success: false, error: error.message };
        }
    },

    // Bannerlar
    async getBanners() {
        try {
            const { data, error } = await supabaseClient
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .order('order_number');
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Bannerlar getirme hatası:', error);
            return { success: false, error: error.message };
        }
    },

    // İletişim mesajı gönder
    async sendContactMessage(messageData) {
        try {
            const { data, error } = await supabaseClient
                .from('contact_messages')
                .insert([messageData])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ İletişim mesajı gönderme hatası:', error);
            return { success: false, error: error.message };
        }
    }
};

// Realtime abonelikleri
const RealtimeSubscriptions = {
    books: null,
    authors: null,
    banners: null,

    // Kitaplar için realtime
    subscribeToBooks(callback) {
        this.books = supabaseClient
            .channel('books-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'books'
            }, (payload) => {
                console.log('📚 Kitaplarda değişiklik:', payload);
                callback(payload);
            })
            .subscribe();
        
        return this.books;
    },

    // Tüm abonelikleri kapat
    unsubscribeAll() {
        if (this.books) {
            supabaseClient.removeChannel(this.books);
            this.books = null;
        }
        if (this.authors) {
            supabaseClient.removeChannel(this.authors);
            this.authors = null;
        }
        if (this.banners) {
            supabaseClient.removeChannel(this.banners);
            this.banners = null;
        }
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Kritik Yayınları Supabase Client başlatılıyor...');
    
    // Bağlantıyı kontrol et
    await checkDatabaseConnection();
    
    // Mevcut session'ı kontrol et
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        console.log('🔐 Mevcut session bulundu');
        await handleUserSignIn(session);
    }
});

// Sayfa kapatılırken
window.addEventListener('beforeunload', function() {
    RealtimeSubscriptions.unsubscribeAll();
});

// Global erişim için window nesnesine ekle
window.supabaseClient = supabaseClient;
window.SupabaseAPI = SupabaseAPI;
window.RealtimeSubscriptions = RealtimeSubscriptions;
window.checkDatabaseConnection = checkDatabaseConnection;
window.connectionStatus = connectionStatus; 