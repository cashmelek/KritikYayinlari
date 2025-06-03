// Supabase Admin JS - Kritik Yayınları Admin Paneli
// Bu dosya, admin paneli için temel Supabase işlemlerini ve veri çekme fonksiyonlarını içerir

// Supabase bağlantısını kontrol et
document.addEventListener('DOMContentLoaded', () => {
    if (!window.supabaseClient) {
        console.error('Supabase bağlantısı bulunamadı!');
        showNotification('Supabase bağlantısı kurulamadı. Lütfen sayfayı yenileyin.', 'error');
        return;
    }
    
    console.log('Supabase bağlantısı başarıyla kuruldu. Admin Paneli hazır.');
    
    // Veritabanı durumunu kontrol et
    checkDatabaseStatus();
});

// Veritabanı durumunu kontrol et
async function checkDatabaseStatus() {
    try {
        // Önce yazarlar tablosunu kontrol et
        const { data: authors, error: authorsError } = await supabaseClient
            .from('authors')
            .select('count')
            .limit(1);
            
        // Kitaplar tablosunu kontrol et
        const { data: books, error: booksError } = await supabaseClient
            .from('books')
            .select('count')
            .limit(1);
            
        // Eğer her iki tabloda da hata varsa veritabanı hazır değil demektir
        if (authorsError && booksError) {
            console.warn('Veritabanı tabloları henüz oluşturulmamış');
            
            // Veritabanı güncelleme sayfası dışında bir sayfadaysa uyarı göster
            if (!window.location.pathname.includes('update-database.html')) {
                showNotification('Veritabanı tabloları henüz oluşturulmamış. Lütfen önce veritabanını güncelleyin.', 'warning');
                
                // 2 saniye sonra veritabanı güncelleme sayfasına yönlendir
                setTimeout(() => {
                    window.location.href = 'update-database.html';
                }, 2000);
            }
        } else {
            console.log('Veritabanı tabloları hazır.');
        }
    } catch (error) {
        console.error('Veritabanı durumu kontrol edilirken hata:', error);
    }
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
