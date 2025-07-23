// Supabase Config JS - Kritik Yayınları Frontend
// Bu dosya hem gerçek Supabase bağlantısını hem de offline mod için yerel veritabanı simülasyonunu içerir

// Supabase Bağlantı Bilgileri
const SUPABASE_URL = 'https://lddzbhbzaxigfejysary.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHpiaGJ6YXhpZ2ZlanlzYXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTExNzksImV4cCI6MjA2NDU2NzE3OX0.Mx0ve7D0zscuZsEmxYh8EALOtHVkYZeydgwOqtiGG34';

// Bağlantı yönetimi
let lastSupabaseError = null;
let lastConnectionCheckTime = 0;
let connectionCheckInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 saniye
let isOnlineMode = true;

// LocalStorage yardımcı fonksiyonları
function getLocalData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`LocalStorage'dan veri alınırken hata (${key}):`, error);
        return null;
    }
}

function saveLocalData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`LocalStorage'a veri kaydedilirken hata (${key}):`, error);
        return false;
    }
}

// Supabase bağlantısını başlat
async function initSupabase() {
    try {
        console.log('Supabase bağlantısı başlatılıyor...');
        
        // Supabase kütüphanesi var mı kontrol et
        if (typeof supabase === 'undefined') {
            console.error('Supabase kütüphanesi yüklenemedi!');
            throw new Error('Supabase kütüphanesi bulunamadı');
        }
        
        // Supabase istemcisini oluştur
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Bağlantıyı test et
        const testResult = await checkDatabaseConnection();
        
        if (!testResult) {
            console.warn('Supabase bağlantısı başarısız, çevrimdışı moda geçiliyor');
            enableOfflineMode();
            return false;
        }
        
        // Bağlantı kontrolünü başlat
        startConnectionCheck();
        
        // Yeniden bağlanma sayacını sıfırla
        reconnectAttempts = 0;
        
        console.log('Supabase bağlantısı başarıyla kuruldu');
        return true;
    } catch (error) {
        console.error('Supabase bağlantısı kurulurken hata:', error);
        lastSupabaseError = error;
        
        // Offline moda geç
        enableOfflineMode();
        
        // Hata mesajı göster
        if (typeof showMessage === 'function') {
            showMessage('Veritabanı bağlantısı kurulamadı. Veriler yerel olarak yüklenecek.', 'warning');
        }
        
        return false;
    }
}

// Offline modu etkinleştir
function enableOfflineMode() {
    console.warn('Offline mod etkinleştiriliyor...');
    isOnlineMode = false;
    
    // Basit bir yerel veritabanı oluştur
    window.supabaseClient = {
        from: (tableName) => ({
            select: () => ({
                // İlgili yerel veriyi getir
                execute: async () => {
                    const key = `kritik_${tableName}_data`;
                    const data = getLocalData(key);
                    return { data: data || [], error: null };
                },
                single: async () => {
                    const key = `kritik_${tableName}_data`;
                    const data = getLocalData(key);
                    return { data: (data && data.length > 0) ? data[0] : null, error: null };
                }
            })
        })
    };
    
    // Bildirim göster
    if (typeof showMessage === 'function') {
        showMessage('Çevrimdışı moddasınız. Bazı içerikler görüntülenemeyebilir.', 'info');
    }
}

// Online moda geç
async function enableOnlineMode() {
    console.log('Online mod etkinleştiriliyor...');
    
    try {
        // Supabase bağlantısını yeniden kur
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Bağlantıyı test et
        const { data, error } = await window.supabaseClient
            .from('system_settings')
            .select('count')
            .limit(1);
            
        if (error) {
            throw error;
        }
        
        // Bağlantı başarılı
        isOnlineMode = true;
        lastSupabaseError = null;
        reconnectAttempts = 0;
        
        // Bildirim göster
        if (typeof showMessage === 'function') {
            showMessage('Çevrimiçi bağlantı kuruldu.', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Online moda geçerken hata:', error);
        lastSupabaseError = error;
        
        // Çevrimdışı modda kalmaya devam et
        isOnlineMode = false;
        
        return false;
    }
}

// Bağlantı kontrolünü başlat
function startConnectionCheck() {
    // Zaten çalışıyor mu kontrol et
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
    
    // İlk kontrolü yap
    checkDatabaseConnection();
    
    // Periyodik kontrol başlat (60 saniyede bir)
    connectionCheckInterval = setInterval(checkDatabaseConnection, 60000);
}

// Veritabanı bağlantısını kontrol et
async function checkDatabaseConnection() {
    // Son kontrolden beri yeterli süre geçti mi?
    const now = Date.now();
    if (now - lastConnectionCheckTime < 5000) { // En az 5 saniye
        return true;
    }
    
    lastConnectionCheckTime = now;
    
    try {
        console.log('Veritabanı bağlantısı kontrol ediliyor...');
        
        // Supabase client var mı?
        if (!window.supabaseClient) {
            throw new Error('Supabase istemcisi bulunamadı');
        }
        
        // Basit bir sorgu dene
        const { data, error } = await window.supabaseClient
            .from('books')
            .select('count')
            .limit(1);
            
        if (error) {
            // RLS hatası mı?
            if (error.code === 'PGRST301' || error.message?.includes('policy')) {
                console.warn('RLS politikası hatası, ancak bağlantı var');
                
                // Çevrimiçi moda geç
                if (!isOnlineMode) {
                    enableOnlineMode();
                }
                
                return true;
            }
            
            throw error;
        }
        
        // Bağlantı başarılı
        console.log('Veritabanı bağlantısı aktif');
        
        // Çevrimdışı modda isek çevrimiçi moda geç
        if (!isOnlineMode) {
            enableOnlineMode();
        }
        
        return true;
    } catch (error) {
        console.error('Veritabanı bağlantı kontrolü sırasında hata:', error);
        lastSupabaseError = error;
        
        // Çevrimiçi modda isek ve bağlantı kesilmişse
        if (isOnlineMode) {
            console.warn('Veritabanı bağlantısı kesildi, çevrimdışı moda geçiliyor');
            enableOfflineMode();
            
            // Yeniden bağlanmayı dene
            reconnectToSupabase();
        }
        
        return false;
    }
}

// Supabase'e yeniden bağlan
async function reconnectToSupabase() {
    // Maksimum yeniden bağlanma denemesi aşıldı mı?
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Maksimum yeniden bağlanma denemesi aşıldı');
        
        // Bildirim göster
        if (typeof showMessage === 'function') {
            showMessage('Veritabanına bağlanılamıyor. Sayfayı yenilemeyi deneyin.', 'error');
        }
        
        return false;
    }
    
    reconnectAttempts++;
    console.log(`Yeniden bağlanma denemesi ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
    
    // Yeniden bağlanmayı biraz beklet
    setTimeout(async () => {
        try {
            // Yeniden bağlan
            const success = await enableOnlineMode();
            
            if (success) {
                console.log('Yeniden bağlanma başarılı');
                reconnectAttempts = 0;
            } else {
                // Başarısız olursa tekrar dene
                reconnectToSupabase();
            }
        } catch (error) {
            console.error('Yeniden bağlanma sırasında hata:', error);
            // Başarısız olursa tekrar dene
            reconnectToSupabase();
        }
    }, RECONNECT_INTERVAL * reconnectAttempts); // Her denemede biraz daha bekle
}

// Hata mesajlarını göstermek için yardımcı fonksiyon
function showMessage(message, type = 'info') {
    // Sayfa içinde tanımlı showNotification veya benzeri bir fonksiyon varsa kullan
    if (typeof showNotification === 'function') {
        showNotification(message, type);
        return;
    }
    
    // Yoksa konsola kaydet
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Basit bir bildirim göster
}

// Yardımcı fonksiyon: Gerçek Supabase mi yoksa yerel simülasyon mu?
function isRealSupabase() {
    return isOnlineMode && window.supabaseClient && typeof window.supabaseClient.from === 'function';
}

// Hataları kullanıcı dostu hale getir
function formatSupabaseError(error) {
    if (!error) return 'Bilinmeyen hata';
    
    // RLS hatası
    if (error.code === 'PGRST301' || error.message?.includes('policy')) {
        return 'Bu verilere erişim yetkiniz yok. Lütfen giriş yapın veya yöneticinize başvurun.';
    }
    
    // Bağlantı hatası
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('network') || error.message?.includes('NetworkError')) {
        return 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
    }
    
    // Diğer hatalar
    return error.message || error.toString();
}

// Sayfa kapanırken temizlik işlemleri
window.addEventListener('beforeunload', function() {
    // Kontrol aralığını temizle
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
});
