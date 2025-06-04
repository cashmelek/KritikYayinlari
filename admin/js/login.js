// Admin Panel Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini seçelim
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const rememberCheckbox = document.getElementById('remember');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const connectionStatus = document.getElementById('connectionStatus');
    
    // Supabase bağlantısını kontrol et
    checkSupabaseConnection().then(isConnected => {
        // Bağlantı durumunu görüntüle
        showConnectionStatus(isConnected);
    });
    
    // LocalStorage'dan hatırlanan kullanıcı bilgilerini yükle
    loadRememberedUser();
    
    // Şifre göster/gizle düğmesi
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // İkon değiştir
            const icon = togglePasswordBtn.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('ri-eye-line');
                icon.classList.add('ri-eye-off-line');
            } else {
                icon.classList.remove('ri-eye-off-line');
                icon.classList.add('ri-eye-line');
            }
        });
    }
    
    // Form gönderimi
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const remember = rememberCheckbox ? rememberCheckbox.checked : false;
            
            // Giriş işlemi
            login(username, password, remember);
        });
    }
    
    // Şifremi unuttum
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function() {
            const username = usernameInput.value.trim();
            if (!username) {
                showNotification('Lütfen kullanıcı adınızı girin', 'warning');
                usernameInput.focus();
                return;
            }
            
            resetPassword(username);
        });
    }
    
    // Enter tuşu ile giriş
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement === passwordInput) {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});

// Bağlantı durumunu göster
function showConnectionStatus(isConnected) {
    const connectionStatus = document.getElementById('connectionStatus');
    if (!connectionStatus) return;
    
    connectionStatus.style.display = 'flex';
    
    if (isConnected) {
        connectionStatus.innerHTML = '<i class="ri-wifi-line mr-1"></i><span>Supabase Bağlı</span>';
        connectionStatus.classList.add('status-online');
        connectionStatus.classList.remove('status-offline');
    } else {
        connectionStatus.innerHTML = '<i class="ri-wifi-off-line mr-1"></i><span>Bağlantı Yok</span>';
        connectionStatus.classList.add('status-offline');
        connectionStatus.classList.remove('status-online');
    }
}

// Supabase bağlantısını kontrol et
async function checkSupabaseConnection() {
    try {
        if (!window.supabaseClient) {
            console.error('Supabase client bulunamadı');
            return false;
        }
        
        // Basit bir sorgu ile bağlantıyı test et
        const { data, error } = await window.supabaseClient
            .from('admin_users')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('Supabase bağlantı hatası:', error);
            return false;
        }
        
        console.log('Supabase bağlantısı başarılı');
        return true;
    } catch (error) {
        console.error('Supabase bağlantı test hatası:', error);
        return false;
    }
}

// Şifre sıfırlama
async function resetPassword(username) {
    try {
        showNotification('Şifre sıfırlama talebi gönderiliyor...', 'info');
        
        // Kullanıcıyı bul
        const { data: user, error: userError } = await window.supabaseClient
            .from('admin_users')
            .select('email')
            .eq('username', username)
            .single();
            
        if (userError || !user) {
            showNotification('Kullanıcı bulunamadı', 'error');
            return;
        }
        
        // Şifre sıfırlama token'ı oluştur
        const resetToken = generateResetToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli
        
        // Token'ı veritabanına kaydet
        const { error: tokenError } = await window.supabaseClient
            .from('password_reset_tokens')
            .insert({
                username: username,
                token: resetToken,
                expires_at: expiresAt.toISOString(),
                is_used: false
            });
            
        if (tokenError) {
            console.error('Token kaydetme hatası:', tokenError);
            showNotification('Şifre sıfırlama talebi oluşturulamadı', 'error');
            return;
        }
        
        // Gerçek uygulamada burada email gönderilir
        // Şimdilik konsola yazdıralım
        console.log('Şifre sıfırlama linki:', `${window.location.origin}/admin/reset-password.html?token=${resetToken}`);
        
        showNotification('Şifre sıfırlama talebi oluşturuldu. Konsolu kontrol edin.', 'success');
        
    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        showNotification('Şifre sıfırlama sırasında bir hata oluştu', 'error');
    }
}

function generateResetToken() {
    return 'reset_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Giriş işlemi
async function login(username, password, remember) {
    try {
        // Loading göster
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Giriş yapılıyor...';
        submitBtn.disabled = true;
        
        showNotification('Giriş yapılıyor...', 'info');
        
        // Admin auth ile giriş yap
        const result = await window.adminAuth.login(username, password);
        
        if (result.success) {
            // Hatırla seçeneği işaretliyse kullanıcı bilgilerini kaydet
            if (remember) {
                localStorage.setItem('kritik_admin_remember_username', username);
            } else {
                localStorage.removeItem('kritik_admin_remember_username');
            }
            
            showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            
            // Ana sayfaya yönlendir
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification(result.error || 'Giriş başarısız', 'error');
        }
        
    } catch (error) {
        console.error('Giriş hatası:', error);
        showNotification('Giriş sırasında bir hata oluştu', 'error');
    } finally {
        // Loading'i kaldır
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Giriş Yap';
            submitBtn.disabled = false;
        }
    }
}

// Hatırlanan kullanıcıyı yükle
function loadRememberedUser() {
    const rememberedUsername = localStorage.getItem('kritik_admin_remember_username');
    if (rememberedUsername && usernameInput) {
        usernameInput.value = rememberedUsername;
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
}

// Bildirim göster
function showNotification(message, type = 'success') {
    // Mevcut bildirimleri kaldır
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="ri-${getNotificationIcon(type)}-line mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Sayfaya ekle
    document.body.appendChild(notification);
    
    // Animasyon için timeout
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 5 saniye sonra kaldır
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'error-warning';
        case 'warning': return 'alert-circle';
        case 'info': return 'information';
        default: return 'information';
    }
}

// Oturum kontrolü
function checkSession() {
    if (window.adminAuth && window.adminAuth.isLoggedIn()) {
        // Zaten giriş yapılmış, ana sayfaya yönlendir
        window.location.href = 'index.html';
    }
} 