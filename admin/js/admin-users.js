// Admin Kullanıcıları Yönetimi

document.addEventListener('DOMContentLoaded', async function() {
    // Supabase bağlantısını kontrol et ve yükle
    await loadSupabaseConfig();
    
    // Kullanıcı listesini yükle
    loadAdminUsers();
    
    // Form gönderimini dinle
    const newUserForm = document.getElementById('newUserForm');
    if (newUserForm) {
        newUserForm.addEventListener('submit', handleNewUserSubmit);
    }
    
    // Kullanıcı silme butonlarını dinle
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('delete-user-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            if (userId) {
                confirmDeleteUser(userId);
            }
        }
    });
    
    // Kullanıcı düzenleme butonlarını dinle
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('edit-user-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            if (userId) {
                loadUserForEdit(userId);
            }
        }
    });
    
    // Şifre sıfırlama butonlarını dinle
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('reset-password-btn')) {
            const userEmail = e.target.getAttribute('data-user-email');
            if (userEmail) {
                confirmResetPassword(userEmail);
            }
        }
    });
});

// Supabase config dosyasını dinamik olarak yükle
async function loadSupabaseConfig() {
    // Eğer zaten yüklenmişse tekrar yükleme
    if (window.supabaseClient) {
        return;
    }
    
    return new Promise((resolve, reject) => {
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

// Admin kullanıcılarını yükle
async function loadAdminUsers() {
    try {
        // Tablo elemanını seç
        const tableBody = document.querySelector('#adminUsersTable tbody');
        if (!tableBody) {
            console.error('Admin kullanıcıları tablosu bulunamadı');
            return;
        }
        
        // Yükleniyor göstergesi
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="ri-loader-line text-xl animate-spin mr-2"></i> Kullanıcılar yükleniyor...
                </td>
            </tr>
        `;
        
        // Kullanıcıları yükle
        const { success, users, error } = await window.listAdminUsers();
        
        if (!success || error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-red-500">
                        <i class="ri-error-warning-line mr-2"></i> Kullanıcılar yüklenirken hata oluştu: ${error?.message || 'Bilinmeyen hata'}
                    </td>
                </tr>
            `;
            return;
        }
        
        // Kullanıcı yoksa
        if (!users || users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-gray-500">
                        Henüz admin kullanıcısı bulunmuyor. Yeni bir kullanıcı ekleyebilirsiniz.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Kullanıcıları listele
        tableBody.innerHTML = '';
        
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            
            // Zemin rengi
            if (index % 2 === 0) {
                row.classList.add('bg-gray-50');
            }
            
            // Oluşturma tarihi formatla
            const createdAt = new Date(user.created_at);
            const formattedDate = createdAt.toLocaleDateString('tr-TR') + ' ' + 
                                 createdAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td class="px-4 py-3">${index + 1}</td>
                <td class="px-4 py-3 font-medium">${user.username}</td>
                <td class="px-4 py-3">${user.name || '-'}</td>
                <td class="px-4 py-3">${user.email}</td>
                <td class="px-4 py-3 text-xs">
                    <span class="px-2 py-1 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                        ${user.role}
                    </span>
                </td>
                <td class="px-4 py-3 text-right">
                    <button 
                        class="text-gray-500 hover:text-indigo-600 mr-2 edit-user-btn" 
                        data-user-id="${user.user_id}" 
                        title="Düzenle">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button 
                        class="text-gray-500 hover:text-yellow-600 mr-2 reset-password-btn" 
                        data-user-email="${user.email}" 
                        title="Şifre Sıfırla">
                        <i class="ri-lock-unlock-line"></i>
                    </button>
                    <button 
                        class="text-gray-500 hover:text-red-600 delete-user-btn" 
                        data-user-id="${user.user_id}" 
                        title="Sil">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Admin kullanıcıları yüklenirken hata:', error);
        showNotification('Kullanıcılar yüklenirken bir hata oluştu', 'error');
    }
}

// Yeni kullanıcı ekleme formunu işle
async function handleNewUserSubmit(e) {
    e.preventDefault();
    
    // Form elemanlarını seç
    const emailInput = document.getElementById('newUserEmail');
    const usernameInput = document.getElementById('newUserUsername');
    const nameInput = document.getElementById('newUserName');
    const passwordInput = document.getElementById('newUserPassword');
    const roleSelect = document.getElementById('newUserRole');
    const submitButton = document.querySelector('#newUserForm button[type="submit"]');
    
    // Değerleri al
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const name = nameInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;
    
    // Temel doğrulama
    if (!email || !username || !password) {
        showNotification('Lütfen gerekli alanları doldurun', 'warning');
        return;
    }
    
    // E-posta formatı kontrolü
    if (!isValidEmail(email)) {
        showNotification('Lütfen geçerli bir e-posta adresi girin', 'warning');
        return;
    }
    
    // Şifre uzunluğu kontrolü
    if (password.length < 8) {
        showNotification('Şifre en az 8 karakter uzunluğunda olmalıdır', 'warning');
        return;
    }
    
    try {
        // Yükleniyor göstergesi
        const originalBtnText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="ri-loader-line animate-spin mr-2"></i> Kaydediliyor...';
        
        // Kullanıcı oluştur
        const { success, user, error } = await window.createAdminUser(
            email, 
            password, 
            username, 
            name
        );
        
        // Butonu eski haline getir
        submitButton.disabled = false;
        submitButton.innerHTML = originalBtnText;
        
        if (!success || error) {
            console.error('Kullanıcı oluşturma hatası:', error);
            showNotification(`Kullanıcı oluşturulamadı: ${error?.message || 'Bilinmeyen hata'}`, 'error');
            return;
        }
        
        // Başarılı
        showNotification('Kullanıcı başarıyla oluşturuldu', 'success');
        
        // Formu temizle
        emailInput.value = '';
        usernameInput.value = '';
        nameInput.value = '';
        passwordInput.value = '';
        roleSelect.value = 'admin';
        
        // Modal'ı kapat (eğer varsa)
        const modal = document.getElementById('newUserModal');
        if (modal && typeof closeModal === 'function') {
            closeModal('newUserModal');
        }
        
        // Kullanıcı listesini yeniden yükle
        loadAdminUsers();
    } catch (error) {
        console.error('Kullanıcı oluşturma sırasında hata:', error);
        showNotification('Kullanıcı oluşturulurken bir hata oluştu', 'error');
    }
}

// Kullanıcı silme onayı
function confirmDeleteUser(userId) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        deleteUser(userId);
    }
}

// Kullanıcı silme
async function deleteUser(userId) {
    try {
        // Admin kullanıcı verisini sil
        const { error: adminError } = await window.supabaseClient
            .from('admin_users')
            .delete()
            .eq('user_id', userId);
            
        if (adminError) {
            console.error('Admin kullanıcı silme hatası:', adminError);
            showNotification(`Kullanıcı silinemedi: ${adminError.message}`, 'error');
            return;
        }
        
        // Auth kullanıcısını sil (yalnızca admin yetkisiyle yapılabilir)
        const { error: authError } = await window.supabaseClient.auth.admin.deleteUser(userId);
        
        if (authError) {
            console.error('Auth kullanıcı silme hatası:', authError);
            showNotification('Kullanıcı silindi ancak auth verileri silinemedi', 'warning');
        }
        
        // Başarılı
        showNotification('Kullanıcı başarıyla silindi', 'success');
        
        // Kullanıcı listesini yeniden yükle
        loadAdminUsers();
    } catch (error) {
        console.error('Kullanıcı silme sırasında hata:', error);
        showNotification('Kullanıcı silinirken bir hata oluştu', 'error');
    }
}

// Düzenleme için kullanıcı verilerini yükle
async function loadUserForEdit(userId) {
    try {
        // Kullanıcı verisini al
        const { data, error } = await window.supabaseClient
            .from('admin_users')
            .select('*')
            .eq('user_id', userId)
            .single();
            
        if (error) {
            console.error('Kullanıcı verisi alınırken hata:', error);
            showNotification('Kullanıcı bilgileri alınamadı', 'error');
            return;
        }
        
        // Düzenleme formunu doldur
        document.getElementById('editUserId').value = data.user_id;
        document.getElementById('editUserEmail').value = data.email;
        document.getElementById('editUserUsername').value = data.username;
        document.getElementById('editUserName').value = data.name || '';
        document.getElementById('editUserRole').value = data.role;
        
        // Modal'ı aç (eğer varsa)
        if (typeof openModal === 'function') {
            openModal('editUserModal');
        }
    } catch (error) {
        console.error('Kullanıcı verisi yüklenirken hata:', error);
        showNotification('Kullanıcı bilgileri yüklenirken bir hata oluştu', 'error');
    }
}

// Şifre sıfırlama onayı
function confirmResetPassword(userEmail) {
    if (confirm(`${userEmail} adresine şifre sıfırlama bağlantısı göndermek istediğinizden emin misiniz?`)) {
        resetUserPassword(userEmail);
    }
}

// Kullanıcı şifresini sıfırla
async function resetUserPassword(email) {
    try {
        if (!email) {
            showNotification('E-posta adresi bulunamadı', 'error');
            return;
        }
        
        // Bildirim göster
        showNotification('Şifre sıfırlama bağlantısı gönderiliyor...', 'info');
        
        // Şifre sıfırlama
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: window.location.origin + '/admin/reset-password.html'
            }
        );
        
        if (error) {
            console.error('Şifre sıfırlama hatası:', error);
            showNotification(`Şifre sıfırlama bağlantısı gönderilemedi: ${error.message}`, 'error');
            return;
        }
        
        // Başarılı
        showNotification(`Şifre sıfırlama bağlantısı ${email} adresine gönderildi`, 'success');
    } catch (error) {
        console.error('Şifre sıfırlama sırasında hata:', error);
        showNotification('Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu', 'error');
    }
}

// Bildirim gösterme
function showNotification(message, type = 'success') {
    // Global showNotification fonksiyonu varsa kullan
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Global fonksiyon yoksa alert kullan
    if (type === 'error') {
        alert('HATA: ' + message);
    } else {
        alert(message);
    }
}

// E-posta doğrulama
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
} 