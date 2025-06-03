// Admin JS - Kritik Yayınları Admin Paneli
// Bu dosya, admin paneli için temel işlemleri ve veri çekme fonksiyonlarını içerir

// Admin panelini başlat
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin paneli başlatılıyor...');
    
    try {
        // Admin paneli için gerekli diğer fonksiyonları çağır
        setupAdminPanel();
    } catch (error) {
        console.error('Admin paneli başlatılırken hata oluştu:', error);
        showNotification('Admin paneli başlatılırken bir hata oluştu.', 'error');
    }
});

// Admin panelini ayarla
function setupAdminPanel() {
    console.log('Admin panel ayarları yapılıyor...');
    
    // Siteye dön butonunu ayarla
    const backToSiteBtn = document.getElementById('backToSiteBtn');
    if (backToSiteBtn) {
        backToSiteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../anasayfa.html';
        });
    }
    
    // Admin paneli hazır mesajı
    console.log('Admin paneli hazır.');
}

// Bildirim göster
function showNotification(message, type = 'success') {
    // Eğer bildirim konteyner yoksa oluştur
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
        document.body.appendChild(notificationContainer);
    }
    
    // Bildirim elementi oluştur
    const notification = document.createElement('div');
    notification.className = `flex items-center px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Bildirim tipine göre stil belirle
    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500', 'text-white');
    } else if (type === 'warning') {
        notification.classList.add('bg-yellow-500', 'text-white');
    } else {
        notification.classList.add('bg-blue-500', 'text-white');
    }
    
    // Bildirim içeriğini oluştur
    notification.innerHTML = `
        <i class="ri-${type === 'success' ? 'check' : type === 'error' ? 'close' : 'information'}-line mr-2"></i>
        <span>${message}</span>
    `;
    
    // Bildirim konteynerine ekle
    notificationContainer.appendChild(notification);
    
    // Animasyon için gecikme
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    // Bildirimi otomatik kapat
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Global olarak bildirimi kullanılabilir hale getir
window.showNotification = showNotification;
