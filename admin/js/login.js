// Kritik Yayınları Admin Panel - Login JS
// GEÇİCİ OLARAK KİMLİK DOĞRULAMA DEVRE DIŞI

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // Login formu submit olayını dinle
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            // Formun normal davranışını engelle
            event.preventDefault();
            
            // GEÇİCİ: Direkt giriş yapma
            handleDirectLogin();
        });
    }
    
    // Şifre göster/gizle butonu
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'ri-eye-line text-gray-400 hover:text-gray-600';
            } else {
                passwordInput.type = 'password';
                icon.className = 'ri-eye-off-line text-gray-400 hover:text-gray-600';
            }
        });
    }
    
    // Hatırlanan kullanıcı adını yükle
    loadRememberedUser();
    
    // Oturum kontrolü - eğer zaten giriş yapılmışsa, admin paneline yönlendir
    const isLoggedIn = sessionStorage.getItem('kritik_admin_logged_in') === 'true';
    
    if (isLoggedIn) {
        console.log('Aktif oturum bulundu, yönlendiriliyor...');
        window.location.href = 'index.html';
    }
});

// GEÇİCİ: Direkt giriş işlemini yönet (kimlik doğrulama olmadan)
function handleDirectLogin() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    
    if (!usernameInput || !passwordInput || !submitBtn) {
        console.error('Form elemanları bulunamadı');
        return;
    }
    
    const username = usernameInput.value.trim() || 'admin';
    
    // Yükleniyor göstergesini göster
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line loader mr-2"></i> Giriş yapılıyor...';
    
    try {
        // Beni hatırla kontrolü
        if (rememberCheckbox && rememberCheckbox.checked) {
            localStorage.setItem('kritik_admin_remember', 'true');
            localStorage.setItem('kritik_admin_username', username);
        }
        
        // GEÇİCİ: Demo kullanıcı verisi oluştur
        const mockUser = {
            id: 1,
            username: username || 'admin',
            email: 'admin@kritikyayinlari.com',
            name: 'Yönetici',
            role: 'admin'
        };
        
        const mockSession = {
            token: 'mock_token_' + Date.now(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 saat sonra
        };
        
        // Oturum bilgilerini kaydet
        sessionStorage.setItem('kritik_admin_logged_in', 'true');
        sessionStorage.setItem('kritik_admin_user', JSON.stringify(mockUser));
        sessionStorage.setItem('kritik_admin_user_data', JSON.stringify(mockUser));
        sessionStorage.setItem('kritik_admin_login_time', new Date().toISOString());
        sessionStorage.setItem('kritik_admin_session', JSON.stringify(mockSession));
        
        // Başarılı bildirim göster
        showNotification('Giriş başarılı, yönlendiriliyor...', 'success');
        
        // Admin paneline yönlendir
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Giriş işlemi sırasında hata:', error);
        showNotification('Giriş sırasında bir hata oluştu: ' + error.message, 'error');
    } finally {
        // Yükleniyor göstergesini kaldır
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Hatırlanan kullanıcı adını yükle
function loadRememberedUser() {
    const remembered = localStorage.getItem('kritik_admin_remember') === 'true';
    const username = localStorage.getItem('kritik_admin_username');

    if (remembered && username) {
        const usernameInput = document.getElementById('username');
        const rememberCheckbox = document.getElementById('remember');

        if (usernameInput) usernameInput.value = username;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

// Bildirim gösterme
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification || !notificationMessage) return;
    
    // Renk ve stil ayarla
    notification.className = 'notification';
    
    if (type === 'success') {
            notification.classList.add('bg-green-500');
    } else if (type === 'error') {
            notification.classList.add('bg-red-500');
    } else if (type === 'warning') {
            notification.classList.add('bg-yellow-500');
    } else if (type === 'info') {
            notification.classList.add('bg-blue-500');
    }
    
    // Mesajı ayarla
    notificationMessage.textContent = message;
    
    // Göster
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
    
    // 5 saniye sonra gizle
    setTimeout(() => {
        notification.style.transform = 'translateY(20px)';
        notification.style.opacity = '0';
    }, 5000);
}

// Notification icon oluştur
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '<i class="ri-check-line"></i>';
        case 'error': return '<i class="ri-error-warning-line"></i>';
        case 'warning': return '<i class="ri-alert-line"></i>';
        case 'info': return '<i class="ri-information-line"></i>';
        default: return '<i class="ri-notification-3-line"></i>';
    }
} 