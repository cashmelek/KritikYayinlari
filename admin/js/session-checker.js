// Kritik Yayınları Admin Panel - Session Checker
// Bu dosya, admin panelinde oturum kontrolü yapmak için kullanılır.
// GEÇİCİ MOD: Kimlik doğrulama kontrolü devre dışı

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
    console.log('Oturum kontrolü yapılıyor... (GEÇİCİ MOD)');
    
    // Oturum bilgilerini kontrol et
    const isLoggedIn = sessionStorage.getItem('kritik_admin_logged_in') === 'true';
    
    // Giriş yapılmamışsa login sayfasına yönlendir
    if (!isLoggedIn) {
        console.warn('Oturum bulunamadı, giriş sayfasına yönlendiriliyor...');
        redirectToLogin();
        return;
    }
    
    // GEÇİCİ MOD: Ek oturum doğrulaması yapmadan geçerli kabul ediyoruz
    console.log('Geçici mod: Oturum geçerli kabul edildi');
    
    // Oturum bilgilerini tazele (süreyi uzat)
    refreshSession();
}

// GEÇİCİ: Oturum bilgilerini tazele
function refreshSession() {
    // Oturum giriş zamanını güncelle
    sessionStorage.setItem('kritik_admin_login_time', new Date().toISOString());
    
    // Oturum süresini uzat
    const mockSession = JSON.parse(sessionStorage.getItem('kritik_admin_session') || '{}');
    mockSession.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 saat sonra
    sessionStorage.setItem('kritik_admin_session', JSON.stringify(mockSession));
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
    
    // Giriş sayfasına yönlendir
    redirectToLogin();
}

// Global olarak kullanılabilmesi için
window.adminLogout = logout;
window.checkAdminSession = checkSession; 