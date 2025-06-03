// Supabase veritabanındaki kitapları güncellemek için script

// Supabase yapılandırmasını yükle
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Supabase istemcisinin yüklendiğinden emin ol
        if (!window.supabaseClient) {
            console.error('Supabase istemcisi bulunamadı!');
            showMessage('Supabase bağlantısı kurulamadı', 'error');
            return;
        }

        // Kullanıcıya işlem başladığını bildir
        showMessage('Veritabanı güncelleniyor, lütfen bekleyin...', 'info');

        // Tüm kitapları getir
        const { data: books, error: fetchError } = await window.supabaseClient
            .from('books')
            .select('id, title, price, category');

        if (fetchError) {
            console.error('Kitaplar alınırken hata oluştu:', fetchError);
            showMessage('Kitaplar alınırken hata oluştu', 'error');
            return;
        }

        console.log(`${books.length} kitap bulundu, güncelleniyor...`);

        // Her kitabı güncelle
        let successCount = 0;
        let errorCount = 0;

        for (const book of books) {
            try {
                const { error: updateError } = await window.supabaseClient
                    .from('books')
                    .update({
                        price: '0',
                        original_price: '0',
                        discount: 0,
                        category: 'Genel'
                    })
                    .eq('id', book.id);

                if (updateError) {
                    console.error(`Kitap ID:${book.id} güncellenirken hata:`, updateError);
                    errorCount++;
                } else {
                    successCount++;
                    console.log(`Kitap güncellendi: ${book.title}`);
                }
            } catch (err) {
                console.error(`Kitap ID:${book.id} güncellenirken beklenmeyen hata:`, err);
                errorCount++;
            }
        }

        // Sonuçları göster
        if (errorCount === 0) {
            showMessage(`Tüm kitaplar başarıyla güncellendi (${successCount} kitap)`, 'success');
        } else {
            showMessage(`${successCount} kitap güncellendi, ${errorCount} kitapta hata oluştu`, 'warning');
        }

        // Sayfayı yenile
        setTimeout(() => {
            window.location.reload();
        }, 3000);

    } catch (error) {
        console.error('Veritabanı güncellenirken hata oluştu:', error);
        showMessage('Veritabanı güncellenirken hata oluştu', 'error');
    }
});

// Bildirim gösterme fonksiyonu
function showMessage(message, type = 'info') {
    // Mevcut bildirim varsa kaldır
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${getBackgroundColor(type)}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="mr-3">${getIcon(type)}</div>
            <div class="font-medium">${message}</div>
            <button class="ml-4 text-white" onclick="this.parentElement.parentElement.remove()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    `;

    // Bildirim ekle
    document.body.appendChild(notification);

    // 5 saniye sonra bildirim kaldır
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Bildirim tipi için arkaplan rengi
function getBackgroundColor(type) {
    switch (type) {
        case 'success': return 'bg-green-500 text-white';
        case 'error': return 'bg-red-500 text-white';
        case 'warning': return 'bg-yellow-500 text-white';
        default: return 'bg-blue-500 text-white';
    }
}

// Bildirim tipi için ikon
function getIcon(type) {
    switch (type) {
        case 'success':
            return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
        case 'error':
            return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
        case 'warning':
            return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
        default:
            return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    }
}
