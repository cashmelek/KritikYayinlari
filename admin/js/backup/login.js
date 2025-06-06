// Admin Panel Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini seçelim
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const rememberCheckbox = document.getElementById('remember');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const switchToMagicLinkBtn = document.getElementById('switchToMagicLink');
    const normalLoginBtn = document.getElementById('normalLoginBtn');
    const magicLinkForm = document.getElementById('magicLinkForm');
    const normalAuthSection = document.getElementById('normalAuthSection');
    const magicLinkSection = document.getElementById('magicLinkSection');
    const connectionStatus = document.getElementById('connectionStatus');
    
    // Supabase bağlantısını kontrol et
    checkSupabaseConnection().then(isConnected => {
        // Bağlantı durumunu görüntüle
        showConnectionStatus(isConnected);
    });
    
    // LocalStorage'dan hatırlanan kullanıcı bilgilerini yükle
    loadRememberedUser();
    
    // Şifre göster/gizle düğmesi
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
    
    // Form gönderimi
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini al
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberCheckbox.checked;
        
        // Giriş işlemi
        login(username, password, remember);
    });
    
    // Magic Link ile giriş formunu göster
    switchToMagicLinkBtn.addEventListener('click', function() {
        loginForm.style.display = 'none';
        magicLinkSection.style.display = 'block';
        normalAuthSection.style.display = 'none';
        
        // Email inputunu doldur eğer username bir email ise
        const emailInput = document.getElementById('email');
        const username = usernameInput.value.trim();
        if (username && username.includes('@')) {
            emailInput.value = username;
        }
        emailInput.focus();
    });
    
    // Normal giriş formuna geri dön
    normalLoginBtn.addEventListener('click', function() {
        loginForm.style.display = 'block';
        magicLinkSection.style.display = 'none';
        normalAuthSection.style.display = 'block';
    });
    
    // Magic Link gönderim formu
    magicLinkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        sendMagicLink(email);
    });
    
    // Şifremi unuttum
    forgotPasswordBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (!username) {
            showNotification('Lütfen e-posta adresinizi girin', 'warning');
            usernameInput.focus();
            return;
        }
        
        // Email formatını kontrol et
        const isEmail = username.includes('@');
        const email = isEmail ? username : `${username}@kritikyayinlari.com`;
        
        resetPassword(email);
    });
    
    // Enter tuşu ile giriş
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement === passwordInput) {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // URL parametrelerini kontrol et (magic link dönüşü)
    checkUrlParameters();
});

// URL parametrelerini kontrol et (magic link dönüşü için)
async function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const access_token = urlParams.get('access_token');
    const refresh_token = urlParams.get('refresh_token');
    
    if (error) {
        showNotification(`Giriş hatası: ${error}`, 'error');
        return;
    }
    
    // Eğer token varsa, oturumu ayarla
    if (access_token && refresh_token && window.supabaseClient) {
        try {
            showNotification('Giriş doğrulanıyor...', 'info');
            
            const { data, error } = await window.supabaseClient.auth.setSession({
                access_token,
                refresh_token
            });
            
            if (error) {
                console.error('Oturum kurulurken hata:', error);
                showNotification('Oturum kurulamadı: ' + error.message, 'error');
                return;
            }
            
            if (data?.user) {
                console.log('Magic link ile oturum kuruldu:', data.user);
                
                // Admin rolünü kontrol et
                const { data: userData, error: userError } = await window.supabaseClient
                    .from('admin_users')
                    .select('*')
                    .eq('user_id', data.user.id)
                    .single();
                    
                if (userError || !userData || userData.role !== 'admin') {
                    showNotification('Bu hesabın admin yetkisi bulunmuyor', 'error');
                    return;
                }
                
                const user = {
                    id: data.user.id,
                    email: data.user.email,
                    username: userData.username || data.user.email,
                    role: userData.role,
                    name: userData.name || '',
                    session: data.session
                };
                
                // Oturum bilgilerini kaydet
                sessionStorage.setItem('kritik_admin_logged_in', 'true');
                sessionStorage.setItem('kritik_admin_user', user.username);
                sessionStorage.setItem('kritik_admin_user_data', JSON.stringify(user));
                sessionStorage.setItem('kritik_admin_login_time', new Date().toISOString());
                sessionStorage.setItem('kritik_admin_session', JSON.stringify(data.session));
                
                showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                
                // URL'deki parametreleri temizle
                window.history.replaceState(null, '', 'login.html');
                
                // Ana sayfaya yönlendir
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Magic link ile giriş sırasında hata:', error);
            showNotification('Giriş işlemi sırasında bir hata oluştu', 'error');
        }
    }
}

// Bağlantı durumunu göster
function showConnectionStatus(isConnected) {
    const connectionStatus = document.getElementById('connectionStatus');
    if (!connectionStatus) return;
    
    connectionStatus.style.display = 'flex';
    
    if (isConnected) {
        connectionStatus.innerHTML = '<i class="ri-wifi-line mr-1"></i><span>Online Mod</span>';
        connectionStatus.classList.add('status-online');
        connectionStatus.classList.remove('status-offline');
    } else {
        connectionStatus.innerHTML = '<i class="ri-wifi-off-line mr-1"></i><span>Offline Mod</span>';
        connectionStatus.classList.add('status-offline');
        connectionStatus.classList.remove('status-online');
        
        // Demo kullanıcı bilgisini göster
        const demoUserInfo = document.getElementById('demoUserInfo');
        if (demoUserInfo) {
            demoUserInfo.style.display = 'block';
        }
    }
    
    // 5 saniye sonra gizle
    setTimeout(() => {
        connectionStatus.style.opacity = '0';
        
        setTimeout(() => {
            connectionStatus.style.display = 'none';
            connectionStatus.style.opacity = '0.8';
        }, 500);
    }, 5000);
}

// Supabase bağlantısını kontrol et
async function checkSupabaseConnection() {
    try {
        // Supabase global değişkenini kontrol et
        if (!window.supabaseClient) {
            console.warn('Supabase client bulunamadı. supabase-config.js yükleniyor...');
            await loadSupabaseConfig();
        }
        
        // Supabase'e test sorgusu yap
        const { data, error } = await window.supabaseClient
            .from('admin_users')
            .select('count')
            .limit(1)
            .single();
            
        if (error) {
            console.error('Supabase bağlantı hatası:', error);
            showNotification('Veritabanı bağlantısı kurulamadı. Offline modda çalışılıyor.', 'warning');
            return false;
        }
        
        console.log('Supabase bağlantısı başarılı');
        return true;
    } catch (error) {
        console.error('Supabase bağlantı kontrolü sırasında hata:', error);
        showNotification('Veritabanı bağlantısı kurulamadı. Offline modda çalışılıyor.', 'warning');
        return false;
    }
}

// Supabase config dosyasını dinamik olarak yükle
async function loadSupabaseConfig() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '../js/supabase-config.js';
        script.onload = () => {
            console.log('Supabase config başarıyla yüklendi');
            resolve();
        };
        script.onerror = (error) => {
            console.error('Supabase config yüklenirken hata:', error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Magic link gönder
async function sendMagicLink(email) {
    try {
        if (!email) {
            showNotification('Lütfen geçerli bir e-posta adresi girin', 'warning');
            return;
        }
        
        // Supabase client kontrol et
        if (!window.supabaseClient) {
            showNotification('Veritabanı bağlantısı kurulamadı', 'error');
            return;
        }
        
        // Butonu devre dışı bırak
        const submitBtn = document.querySelector('#magicLinkForm button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-line animate-spin mr-2"></i> Gönderiliyor...';
        
        // Magic link gönder
        const { data, error } = await window.supabaseClient.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.origin + window.location.pathname
            }
        });
        
        // Butonu eski haline getir
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        if (error) {
            console.error('Magic link gönderme hatası:', error);
            showNotification('Giriş bağlantısı gönderilemedi: ' + error.message, 'error');
            return;
        }
        
        // Başarılı
        showNotification(`Giriş bağlantısı ${email} adresine gönderildi. Lütfen e-postanızı kontrol edin.`, 'success');
        
        // Formu temizle
        document.getElementById('email').value = '';
    } catch (error) {
        console.error('Magic link gönderme hatası:', error);
        showNotification('Giriş bağlantısı gönderilirken bir hata oluştu', 'error');
        
        // Butonu eski haline getir
        const submitBtn = document.querySelector('#magicLinkForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="ri-mail-send-line mr-2"></i> Giriş Bağlantısı Gönder';
        }
    }
}

// Şifre sıfırlama
async function resetPassword(email) {
    try {
        if (!email) {
            showNotification('Lütfen geçerli bir e-posta adresi girin', 'warning');
            return;
        }
        
        // Supabase client kontrol et
        if (!window.supabaseClient) {
            showNotification('Veritabanı bağlantısı kurulamadı', 'error');
            return;
        }
        
        // Bildirim göster
        showNotification('Şifre sıfırlama bağlantısı gönderiliyor...', 'info');
        
        // Şifre sıfırlama
        const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: window.location.origin + window.location.pathname.replace('login.html', 'reset-password.html')
            }
        );
        
        if (error) {
            console.error('Şifre sıfırlama hatası:', error);
            showNotification('Şifre sıfırlama bağlantısı gönderilemedi: ' + error.message, 'error');
            return;
        }
        
        // Başarılı
        showNotification(`Şifre sıfırlama bağlantısı ${email} adresine gönderildi. Lütfen e-postanızı kontrol edin.`, 'success');
    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        showNotification('Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu', 'error');
    }
}

// Supabase üzerinden giriş işlemi
async function loginWithSupabase(email, password) {
    try {
        // Supabase global değişkenini kontrol et
        if (!window.supabaseClient) {
            console.error('Supabase bağlantısı bulunamadı');
            return { success: false, error: 'Veritabanı bağlantısı bulunamadı' };
        }
        
        // Email ve şifre ile giriş yap
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Supabase giriş hatası:', error);
            return { success: false, error: error.message };
        }
        
        if (data?.user) {
            console.log('Supabase giriş başarılı:', data.user);
            
            // Admin rolünü kontrol et
            const { data: userData, error: userError } = await window.supabaseClient
                .from('admin_users')
                .select('*')
                .eq('user_id', data.user.id)
                .single();
                
            if (userError) {
                console.error('Admin kullanıcı verisi alınamadı:', userError);
                return { success: false, error: 'Yetkisiz erişim' };
            }
            
            if (!userData || userData.role !== 'admin') {
                console.error('Admin yetkisi bulunamadı');
                return { success: false, error: 'Admin yetkisi bulunamadı' };
            }
            
            return { 
                success: true, 
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    username: userData.username || data.user.email,
                    role: userData.role,
                    name: userData.name || '',
                    session: data.session
                }
            };
        }
        
        return { success: false, error: 'Kullanıcı bilgileri alınamadı' };
    } catch (error) {
        console.error('Giriş işlemi sırasında hata:', error);
        return { success: false, error: error.message };
    }
}

// Giriş işlemi
async function login(username, password, remember) {
    try {
        // Yükleniyor göstergesi
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-line animate-spin mr-2"></i> Giriş Yapılıyor...';
        
        let loginSuccess = false;
        let userData = null;
        
        // Supabase bağlantısı varsa oradan giriş yap
        if (window.supabaseClient) {
            // E-posta veya kullanıcı adı kontrolü
            const isEmail = username.includes('@');
            const email = isEmail ? username : `${username}@kritikyayinlari.com`;
            
            const result = await loginWithSupabase(email, password);
            
            if (result.success) {
                loginSuccess = true;
                userData = result.user;
            } else {
                // Demo giriş bilgileri ile denemeye devam et
                console.warn('Supabase giriş başarısız, demo giriş bilgileri kontrol ediliyor:', result.error);
            }
        }
        
        // Supabase'de başarısız olursa veya bağlantı yoksa demo giriş bilgilerini kontrol et
        if (!loginSuccess) {
            const validUsername = 'admin';
            const validPassword = 'kritik2023';
            
            if (username === validUsername && password === validPassword) {
                loginSuccess = true;
                userData = {
                    id: '1',
                    email: 'admin@kritikyayinlari.com',
                    username: 'admin',
                    role: 'admin',
                    name: 'Yönetici'
                };
            }
        }
        
        // Başarılı giriş
        if (loginSuccess) {
            showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            
            // Eğer "Beni hatırla" seçiliyse bilgileri kaydet
            if (remember) {
                localStorage.setItem('kritik_admin_remember', 'true');
                localStorage.setItem('kritik_admin_username', username);
            } else {
                // "Beni hatırla" seçili değilse, önceki kayıtları temizle
                localStorage.removeItem('kritik_admin_remember');
                localStorage.removeItem('kritik_admin_username');
            }
            
            // Oturum bilgisini kaydet
            sessionStorage.setItem('kritik_admin_logged_in', 'true');
            sessionStorage.setItem('kritik_admin_user', userData.username);
            sessionStorage.setItem('kritik_admin_user_data', JSON.stringify(userData));
            sessionStorage.setItem('kritik_admin_login_time', new Date().toISOString());
            
            // Supabase oturumu varsa kaydet
            if (userData.session) {
                sessionStorage.setItem('kritik_admin_session', JSON.stringify(userData.session));
            }
            
            // Admin paneline yönlendir
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Başarısız giriş
            showNotification('Kullanıcı adı veya şifre hatalı!', 'error');
            
            // Şifre alanını temizle
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
        
        // Butonu eski haline getir
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    } catch (error) {
        console.error('Giriş hatası:', error);
        showNotification('Giriş işlemi sırasında bir hata oluştu.', 'error');
        
        // Butonu eski haline getir
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="ri-login-box-line mr-2"></i> Giriş Yap';
        }
    }
}

// Hatırlanan kullanıcıyı yükle
function loadRememberedUser() {
    const remember = localStorage.getItem('kritik_admin_remember');
    const username = localStorage.getItem('kritik_admin_username');
    
    if (remember === 'true' && username) {
        document.getElementById('username').value = username;
        document.getElementById('remember').checked = true;
        document.getElementById('password').focus();
    }
}

// Bildirim gösterme
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notification.classList.remove('bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500');
    
    if (type === 'success') {
        notification.classList.add('bg-green-500');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500');
    } else if (type === 'warning') {
        notification.classList.add('bg-yellow-500');
    } else if (type === 'info') {
        notification.classList.add('bg-blue-500');
    }
    
    notificationMessage.textContent = message;
    
    // Bildirimi göster
    notification.classList.remove('translate-y-20', 'opacity-0');
    
    // 3 saniye sonra gizle
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Oturum kontrolü - eğer zaten giriş yapılmışsa, admin paneline yönlendir
function checkSession() {
    const isLoggedIn = sessionStorage.getItem('kritik_admin_logged_in');
    
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }
}

// Sayfa yüklendiğinde oturumu kontrol et
checkSession(); 