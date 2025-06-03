# Web Sitesi Güvenlik İyileştirmeleri

## Admin Giriş Modalı Güvenliği

Kitaplar.html dosyasında mevcut admin giriş modalı güvenlik açıkları içeriyor. Aşağıdaki değişiklikleri yaparak bu sorunları çözebilirsiniz:

```html
<!-- Güvenli Admin Giriş Modalı -->
<div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
  <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-secondary">Admin Girişi</h2>
      <button class="text-gray-500 hover:text-gray-700" onclick="toggleLoginModal()">
        <i class="ri-close-line ri-lg"></i>
      </button>
    </div>
    <!-- Burada form eylemi değiştirildi ve CSRF token eklendi -->
    <form id="loginForm" class="space-y-4">
      <input type="hidden" id="csrf_token" name="csrf_token">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
        <div class="relative">
          <i class="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="email" id="email" name="email" required maxlength="500" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:border-primary" placeholder="admin@kritikyayinlari.com">
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
        <div class="relative">
          <i class="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="password" id="password" name="password" required minlength="8" maxlength="500" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:border-primary" placeholder="••••••••">
          <small class="text-gray-500">En az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir</small>
        </div>
      </div>
      <button type="button" onclick="handleLogin(event)" class="w-full bg-primary text-white py-2 !rounded-button font-medium hover:bg-opacity-90 transition">Giriş Yap</button>
    </form>
    <div id="loginMessage" class="mt-4 text-center hidden">
      <p class="text-sm font-medium"></p>
    </div>
  </div>
</div>
```

Ayrıca JavaScript kısmında şu değişiklikleri yapın:

```javascript
// Güvenli Admin Giriş İşlevi
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginMessage = document.getElementById('loginMessage');
  const messageText = loginMessage.querySelector('p');
  
  // Basit doğrulama
  if (!email || !password) {
    loginMessage.classList.remove('hidden');
    messageText.textContent = 'Lütfen tüm alanları doldurun';
    messageText.className = 'text-sm font-medium text-red-500';
    return;
  }
  
  // Güçlü şifre kontrolü
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    loginMessage.classList.remove('hidden');
    messageText.textContent = 'Şifre en az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir';
    messageText.className = 'text-sm font-medium text-red-500';
    return;
  }
  
  try {
    // Supabase ile giriş yapma
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    
    // Kullanıcı rolünü kontrol et (admin mi?)
    const { data: userData, error: userError } = await window.supabaseClient
      .from('admin_profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .single();
      
    if (userError) throw userError;
    
    // Admin rolü kontrolü
    if (userData.role === 'admin') {
      // Admin sayfasına yönlendir
      window.location.href = 'admin/index.html';
    } else {
      throw new Error('Yetkisiz erişim. Sadece admin kullanıcıları giriş yapabilir.');
    }
    
  } catch (error) {
    console.error('Giriş hatası:', error);
    loginMessage.classList.remove('hidden');
    messageText.textContent = error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
    messageText.className = 'text-sm font-medium text-red-500';
  }
}

// CSRF Token oluştur
function generateCSRFToken() {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  // Token'ı local storage'a kaydet (gerçek uygulamada httpOnly cookie kullanın)
  localStorage.setItem('csrf_token', token);
  
  // Form içindeki gizli alana ekle
  document.getElementById('csrf_token').value = token;
}

// Modal açıldığında CSRF token oluştur
window.toggleLoginModal = function() {
  const loginModal = document.getElementById('loginModal');
  loginModal.classList.toggle('hidden');
  loginModal.classList.toggle('flex');
  
  if (loginModal.classList.contains('flex')) {
    generateCSRFToken();
  }
};
```

## Content Security Policy (CSP) Ekleme

Web sitenize Content Security Policy eklemek için `<head>` bölümüne aşağıdaki meta etiketini ekleyin:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-src 'none';">
```

## XSS Koruması İçin HTML Escape Fonksiyonu

JavaScript kodunuza HTML escape fonksiyonu ekleyin ve kullanıcı verilerini görüntülerken bu fonksiyonu kullanın:

```javascript
// HTML Escape fonksiyonu
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Kullanım örneği
function displayBooks(books) {
  // ...
  
  // Kitap başlığı ve yazar adı gibi kullanıcı girdilerini escape et
  const bookTitle = escapeHtml(book.title);
  const authorName = escapeHtml(book.authors.name);
  
  // ...
}
```

## Supabase Client Anahtarlarının Güvenliği

`js/supabase-config.js` dosyasında anahtarları direkt olarak gömmek yerine, ortam değişkenlerini veya bir API Gateway kullanın:

```javascript
// Güvenli Supabase yapılandırması
(function() {
  window.initSupabaseClient = async function() {
    try {
      // Anahtarları API üzerinden getir
      const response = await fetch('/api/supabase-config');
      if (!response.ok) throw new Error('API yanıt vermedi');
      
      const config = await response.json();
      
      // Supabase istemcisini oluştur
      window.supabaseClient = supabase.createClient(
        config.supabaseUrl,
        config.supabaseAnonKey
      );
      
      console.log('Supabase bağlantısı başarıyla kuruldu');
      return window.supabaseClient;
    } catch (error) {
      console.error('Supabase bağlantısı kurulamadı:', error);
      throw error;
    }
  };
  
  // Sayfa yüklendiğinde Supabase istemcisini başlat
  document.addEventListener('DOMContentLoaded', initSupabaseClient);
})();
```

## Diğer Güvenlik İyileştirmeleri

1. **HTTPS Kullanımı**: Sitenizin her zaman HTTPS üzerinden sunulduğundan emin olun.
2. **X-Frame-Options Başlığı**: Clickjacking saldırılarını önlemek için ekleyin.
3. **X-Content-Type-Options**: MIME-sniffing saldırılarını önlemek için ekleyin.
4. **Referrer-Policy**: Gizlilik ve güvenlik için referrer bilgilerini kontrol edin.
5. **Feature-Policy**: Tarayıcı özelliklerini ve API'leri kısıtlayın.

Bu değişiklikleri uyguladığınızda web sitenizin güvenliği önemli ölçüde artacaktır. Değişikliklerden sonra mutlaka güvenlik testleri yapmanızı öneririz. 