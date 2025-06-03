// Şifre Sıfırlama JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini seçelim
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordStrength = document.getElementById('passwordStrength');
    
    // Supabase global değişkenini kontrol et
    loadSupabaseConfig().then(() => {
        // URL parametrelerini kontrol et
        checkUrlParameters();
    });
    
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
    
    // Şifre gücünü kontrol et
    passwordInput.addEventListener('input', checkPasswordStrength);
    
    // Form gönderimi
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini al
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Şifre doğrulama
        if (!validatePassword(password, confirmPassword)) {
            return;
        }
        
        // Şifre güncelleme
        updatePassword(password);
    });
});

// URL parametrelerini kontrol et
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    // Eğer şifre sıfırlama linki değilse, login sayfasına yönlendir
    if (type !== 'recovery') {
        showNotification('Geçersiz şifre sıfırlama bağlantısı', 'error');
        
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
    }
}

// Supabase config dosyasını dinamik olarak yükle
async function loadSupabaseConfig() {
    return new Promise((resolve, reject) => {
        // Eğer zaten yüklenmişse tekrar yükleme
        if (window.supabaseClient) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = '../js/supabase-config.js';
        script.onload = () => {
            console.log('Supabase config başarıyla yüklendi');
            resolve();
        };
        script.onerror = (error) => {
            console.error('Supabase config yüklenirken hata:', error);
            showNotification('Veritabanı bağlantısı kurulamadı', 'error');
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Şifre doğrulama
function validatePassword(password, confirmPassword) {
    // Boş kontrolü
    if (!password || !confirmPassword) {
        showNotification('Lütfen tüm alanları doldurun', 'warning');
        return false;
    }
    
    // Şifre uzunluğu kontrolü
    if (password.length < 8) {
        showNotification('Şifreniz en az 8 karakter uzunluğunda olmalıdır', 'warning');
        return false;
    }
    
    // Şifre karmaşıklık kontrolü
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
        showNotification('Şifreniz büyük harf, küçük harf ve rakam içermelidir', 'warning');
        return false;
    }
    
    // Şifre eşleşme kontrolü
    if (password !== confirmPassword) {
        showNotification('Şifreler eşleşmiyor', 'error');
        return false;
    }
    
    return true;
}

// Şifre gücünü kontrol et
function checkPasswordStrength() {
    const password = passwordInput.value;
    const passwordHint = document.getElementById('passwordHint');
    
    // Şifre boşsa, göstergeyi gizle
    if (!password) {
        passwordStrength.className = 'password-strength';
        passwordHint.classList.remove('text-red-500', 'text-yellow-500', 'text-green-500');
        return;
    }
    
    // Şifre gücünü hesapla
    let strength = 0;
    
    // Uzunluk puanı (minimum 8 karakter)
    if (password.length >= 8) {
        strength += 1;
    }
    
    // Karakter çeşitliliği puanı
    if (/[A-Z]/.test(password)) strength += 1; // Büyük harf
    if (/[a-z]/.test(password)) strength += 1; // Küçük harf
    if (/[0-9]/.test(password)) strength += 1; // Sayı
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Özel karakter
    
    // Şifre gücüne göre göstergeyi güncelle
    if (strength < 3) {
        passwordStrength.className = 'password-strength strength-weak';
        passwordHint.classList.add('text-red-500');
        passwordHint.classList.remove('text-yellow-500', 'text-green-500');
        passwordHint.textContent = 'Zayıf şifre: Büyük harf, küçük harf ve rakam ekleyin.';
    } else if (strength < 5) {
        passwordStrength.className = 'password-strength strength-medium';
        passwordHint.classList.add('text-yellow-500');
        passwordHint.classList.remove('text-red-500', 'text-green-500');
        passwordHint.textContent = 'Orta şifre: Daha güçlü bir şifre için özel karakter ekleyin.';
    } else {
        passwordStrength.className = 'password-strength strength-strong';
        passwordHint.classList.add('text-green-500');
        passwordHint.classList.remove('text-red-500', 'text-yellow-500');
        passwordHint.textContent = 'Güçlü şifre: Mükemmel!';
    }
}

// Şifre güncelleme
async function updatePassword(password) {
    try {
        // Supabase client kontrol et
        if (!window.supabaseClient) {
            showNotification('Veritabanı bağlantısı kurulamadı', 'error');
            return;
        }
        
        // Yükleniyor göstergesi
        const submitBtn = document.querySelector('#resetPasswordForm button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-line animate-spin mr-2"></i> Güncelleniyor...';
        
        // Şifre güncelleme
        const { data, error } = await window.supabaseClient.auth.updateUser({
            password: password
        });
        
        // Butonu eski haline getir
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        if (error) {
            console.error('Şifre güncelleme hatası:', error);
            showNotification('Şifre güncellenirken bir hata oluştu: ' + error.message, 'error');
            return;
        }
        
        // Başarılı güncelleme
        showNotification('Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
        
        // URL'deki parametreleri temizle
        window.history.replaceState(null, '', 'reset-password.html');
        
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
        
    } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        showNotification('Şifre güncellenirken bir hata oluştu', 'error');
        
        // Butonu eski haline getir
        const submitBtn = document.querySelector('#resetPasswordForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="ri-save-line mr-2"></i> Şifremi Güncelle';
        }
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