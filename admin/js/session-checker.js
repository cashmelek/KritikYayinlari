// Kritik Yayınları Admin Panel - Session Checker
// Bu dosya, admin panelinde oturum kontrolü yapmak için kullanılır.

// Oturum kontrolü için gerekli değişkenler
let sessionCheckInterval = null;
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 saat
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 dakika

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // Login sayfasında değilsek oturum kontrolü yap
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('reset-password.html')) {
        
        // İlk oturum kontrolü
        checkSession();
        
        // Periyodik oturum kontrolü
        sessionCheckInterval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
        
        // Sayfadan ayrılırken interval'i temizle
        window.addEventListener('beforeunload', function() {
            if (sessionCheckInterval) {
                clearInterval(sessionCheckInterval);
            }
        });
    }
});

// Oturum kontrolü
function checkSession() {
    console.log('Oturum kontrolü yapılıyor...');
    
    // Oturum bilgilerini kontrol et
    const isLoggedIn = sessionStorage.getItem('kritik_admin_logged_in') === 'true';
    const loginTime = sessionStorage.getItem('kritik_admin_login_time');
    const userData = sessionStorage.getItem('kritik_admin_user_data');
    
    // Giriş yapılmamışsa login sayfasına yönlendir
    if (!isLoggedIn || !loginTime || !userData) {
        console.warn('Oturum bulunamadı, giriş sayfasına yönlendiriliyor...');
        redirectToLogin();
        return;
    }
    
    // Oturum süresini kontrol et
    const currentTime = new Date().getTime();
    const loginTimestamp = new Date(loginTime).getTime();
    
    if (currentTime - loginTimestamp > SESSION_TIMEOUT) {
        console.warn('Oturum süresi doldu, giriş sayfasına yönlendiriliyor...');
        sessionStorage.setItem('kritik_admin_session_expired', 'true');
        logout();
        return;
    }
    
    // Eğer Supabase bağlantısı varsa oturumu doğrula
    if (window.supabaseClient && typeof window.supabaseClient.auth !== 'undefined') {
        validateSessionWithSupabase();
    }
    
    console.log('Oturum geçerli');
}

// Supabase ile oturum doğrulama
async function validateSessionWithSupabase() {
    try {
        // Oturum bilgisini al
        const sessionStr = sessionStorage.getItem('kritik_admin_session');
        
        if (!sessionStr) {
            // Eğer oturum bilgisi yoksa ama localStorage'da bağlantı bilgisi varsa devam et
            return;
        }
        
        const session = JSON.parse(sessionStr);
        
        // Oturum süresini kontrol et
        if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
            console.warn('Supabase oturum süresi doldu, giriş sayfasına yönlendiriliyor...');
            sessionStorage.setItem('kritik_admin_session_expired', 'true');
            logout();
            return;
        }
        
        // Kullanıcı bilgisini kontrol et
        const { data, error } = await window.supabaseClient.auth.getUser();
        
        if (error || !data.user) {
            console.warn('Kullanıcı bilgisi alınamadı, giriş sayfasına yönlendiriliyor...', error);
            logout();
            return;
        }
        
        // Admin yetkisini kontrol et
        const { data: userData, error: userError } = await window.supabaseClient
            .from('admin_users')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
        
        if (userError || !userData || userData.role !== 'admin') {
            console.warn('Admin yetkisi bulunamadı, giriş sayfasına yönlendiriliyor...');
            logout();
            return;
        }
        
        // Oturum bilgisini güncelle
        sessionStorage.setItem('kritik_admin_login_time', new Date().toISOString());
        
    } catch (error) {
        console.error('Oturum doğrulama sırasında hata:', error);
    }
}

// Giriş sayfasına yönlendirme
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Çıkış yapma
function logout() {
    // Oturum bilgilerini temizle
    sessionStorage.removeItem('kritik_admin_logged_in');
    sessionStorage.removeItem('kritik_admin_user');
    sessionStorage.removeItem('kritik_admin_user_data');
    sessionStorage.removeItem('kritik_admin_login_time');
    sessionStorage.removeItem('kritik_admin_session');
    
    // Eğer Supabase bağlantısı varsa çıkış yap
    if (window.supabaseClient && typeof window.supabaseClient.auth !== 'undefined') {
        window.supabaseClient.auth.signOut()
            .catch(error => console.error('Supabase çıkış hatası:', error));
    }
    
    // Giriş sayfasına yönlendir
    redirectToLogin();
}

// Global olarak kullanılabilmesi için
window.adminLogout = logout;
window.checkAdminSession = checkSession; 