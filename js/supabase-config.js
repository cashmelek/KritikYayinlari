// Supabase bağlantı yapılandırması
const SUPABASE_URL = 'https://lddzbhbzaxigfejysary.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHpiaGJ6YXhpZ2ZlanlzYXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTExNzksImV4cCI6MjA2NDU2NzE3OX0.Mx0ve7D0zscuZsEmxYh8EALOtHVkYZeydgwOqtiGG34';

// Supabase istemcisini oluştur
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase kimlik doğrulama değişikliklerini dinle
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('Kullanıcı giriş yaptı:', session.user);
        
        // Admin kontrolü yap
        checkAdminUser(session.user);
    } else if (event === 'SIGNED_OUT') {
        console.log('Kullanıcı çıkış yaptı');
        
        // Admin sessionlarını temizle
        clearAdminSession();
    } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token yenilendi');
        
        // Yenilenen token'ı sessionStorage'a kaydet
        if (session) {
            updateAdminSession(session);
        }
    }
});

// Admin kullanıcısını kontrol et
async function checkAdminUser(user) {
    if (!user) return null;
    
    try {
        // Admin tablosundan kullanıcıyı al
        const { data, error } = await supabaseClient
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
        if (error) {
            console.error('Admin kullanıcı kontrolü sırasında hata:', error);
            return null;
        }
        
        if (data && data.role === 'admin') {
            console.log('Admin kullanıcısı bulundu:', data);
            return data;
        }
        
        console.warn('Kullanıcı admin değil');
        return null;
    } catch (error) {
        console.error('Admin kontrolü sırasında hata:', error);
        return null;
    }
}

// Admin oturumunu güncelle
function updateAdminSession(session) {
    if (!session) return;
    
    try {
        // Session bilgisini kaydet
        sessionStorage.setItem('kritik_admin_session', JSON.stringify(session));
    } catch (error) {
        console.error('Admin oturumu güncellenirken hata:', error);
    }
}

// Admin oturumunu temizle
function clearAdminSession() {
    try {
        sessionStorage.removeItem('kritik_admin_logged_in');
        sessionStorage.removeItem('kritik_admin_user');
        sessionStorage.removeItem('kritik_admin_user_data');
        sessionStorage.removeItem('kritik_admin_login_time');
        sessionStorage.removeItem('kritik_admin_session');
    } catch (error) {
        console.error('Admin oturumu temizlenirken hata:', error);
    }
}

// Hata durumunda kullanıcıyı bilgilendirmek için global bir fonksiyon
function showSupabaseError(error) {
    console.error('Supabase hatası:', error);
    
    // Eğer bir bildirim sistemi varsa, hata bildirimini göster
    if (typeof showNotification === 'function') {
        showNotification('Veritabanı işlemi sırasında bir hata oluştu: ' + error.message, 'error');
    }
}

// Veritabanı bağlantısını kontrol et
async function checkDatabaseConnection() {
    try {
        console.log('Supabase veritabanı bağlantısı kontrol ediliyor...');

        const { data, error } = await supabaseClient
            .from('admin_users')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Veritabanı bağlantı hatası:', error);
            return false;
        }

        console.log('Veritabanı bağlantısı başarılı.');
        return true;
    } catch (error) {
        console.error('Veritabanı bağlantı kontrolü sırasında hata:', error);
        return false;
    }
}

// Admin kullanıcısı oluştur
async function createAdminUser(email, password, username, name = '') {
    try {
        // Önce kullanıcı oluştur
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email,
            password
        });
        
        if (authError) {
            console.error('Kullanıcı oluşturma hatası:', authError);
            return { success: false, error: authError };
        }
        
        if (!authData.user) {
            return { success: false, error: { message: 'Kullanıcı oluşturulamadı' } };
        }
        
        // Ardından admin_users tablosuna ekle
        const { data, error } = await supabaseClient
            .from('admin_users')
            .insert([
                {
                    user_id: authData.user.id,
                    username,
                    name,
                    email,
                    role: 'admin'
                }
            ])
            .select();
            
        if (error) {
            console.error('Admin kullanıcı oluşturma hatası:', error);
            return { success: false, error };
        }
        
        return { success: true, user: data[0] };
    } catch (error) {
        console.error('Admin kullanıcı oluşturma sırasında hata:', error);
        return { success: false, error };
    }
}

// Admin kullanıcısını güncelle
async function updateAdminUser(userId, updates) {
    try {
        // Admin tablosunda güncelleme yap
        const { data, error } = await supabaseClient
            .from('admin_users')
            .update(updates)
            .eq('user_id', userId)
            .select();
            
        if (error) {
            console.error('Admin kullanıcı güncelleme hatası:', error);
            return { success: false, error };
        }
        
        return { success: true, user: data[0] };
    } catch (error) {
        console.error('Admin kullanıcı güncelleme sırasında hata:', error);
        return { success: false, error };
    }
}

// Admin kullanıcılarını listele
async function listAdminUsers() {
    try {
        const { data, error } = await supabaseClient
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Admin kullanıcıları listeleme hatası:', error);
            return { success: false, error };
        }
        
        return { success: true, users: data };
    } catch (error) {
        console.error('Admin kullanıcıları listeleme sırasında hata:', error);
        return { success: false, error };
    }
}

// Sayfa yüklendiğinde veritabanı bağlantısını kontrol et
document.addEventListener('DOMContentLoaded', function() {
    // Veritabanı bağlantısını kontrol et
    checkDatabaseConnection();
});

// Hata durumunda yeniden bağlantı dene
function reconnectSupabase() {
    console.log('Supabase bağlantısı yeniden kuruluyor...');
    return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Global erişim için window nesnesine ekle
window.supabaseClient = supabaseClient;
window.reconnectSupabase = reconnectSupabase;
window.createAdminUser = createAdminUser;
window.updateAdminUser = updateAdminUser;
window.listAdminUsers = listAdminUsers;
window.checkAdminUser = checkAdminUser;
