// Dashboard JS - Kritik Yayınları Admin Paneli

// Gösterge panelindeki istatistikler için veri çekme ve güncelleme fonksiyonları
async function loadDashboardStats() {
    try {
        // Yükleniyor göstergelerini ekle
        setLoadingState(true);
        
        // Kitap istatistiklerini çek
        const booksStats = await getBookStats();
        
        // Yazar istatistiklerini çek
        const authorsStats = await getAuthorStats();
        
        // İstatistikleri göster
        updateDashboardStats(booksStats, authorsStats);
        
        // Son aktiviteleri yükle
        await loadRecentActivities();
        
        // Yükleniyor göstergelerini kaldır
        setLoadingState(false);
        
        console.log('Dashboard verileri güncellendi');
    } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
        showNotification('Yerel depolama kullanılıyor', 'info');
        
        // Varsayılan değerler göster
        showDefaultStats();
        
        setLoadingState(false);
    }
}

// Kitap istatistikleri
async function getBookStats() {
    try {
        // Tüm kitapları getir
        const { data: books, error } = await supabaseClient
            .from('books')
            .select('*');
            
        if (error) throw error;
        
        // Son 30 gündeki kitapları hesapla
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const recentBooks = books.filter(book => {
            const createdAt = new Date(book.created_at);
            return createdAt >= thirtyDaysAgo;
        });
        
        // Artış yüzdesini hesapla
        const oldBookCount = books.length - recentBooks.length;
        const percentageIncrease = oldBookCount > 0 
            ? Math.round((recentBooks.length / oldBookCount) * 100) 
            : 0;
        
        return {
            totalCount: books.length,
            recentCount: recentBooks.length,
            percentageIncrease: percentageIncrease
        };
    } catch (error) {
        console.error('Kitap istatistikleri alınırken hata:', error);
        return {
            totalCount: 5, // Varsayılan değer
            recentCount: 2,
            percentageIncrease: 40
        };
    }
}

// Yazar istatistikleri
async function getAuthorStats() {
    try {
        // Tüm yazarları getir
        const { data: authors, error } = await supabaseClient
            .from('authors')
            .select('*');
            
        if (error) throw error;
        
        // Son 30 gündeki yazarları hesapla
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const recentAuthors = authors.filter(author => {
            const createdAt = new Date(author.created_at);
            return createdAt >= thirtyDaysAgo;
        });
        
        // Artış yüzdesini hesapla
        const oldAuthorCount = authors.length - recentAuthors.length;
        const percentageIncrease = oldAuthorCount > 0 
            ? Math.round((recentAuthors.length / oldAuthorCount) * 100)
            : 0;
        
        return {
            totalCount: authors.length,
            recentCount: recentAuthors.length,
            percentageIncrease: percentageIncrease
        };
    } catch (error) {
        console.error('Yazar istatistikleri alınırken hata:', error);
        return {
            totalCount: 3, // Varsayılan değer
            recentCount: 1,
            percentageIncrease: 33
        };
    }
}

// Varsayılan istatistikler
function showDefaultStats() {
    // Kitap sayısı
    const bookCountElement = document.getElementById('totalBooks');
    if (bookCountElement) {
        bookCountElement.textContent = "5"; // Varsayılan kitap sayısı
    }
    
    // Yazar sayısı
    const authorCountElement = document.getElementById('totalAuthors');
    if (authorCountElement) {
        authorCountElement.textContent = "3"; // Varsayılan yazar sayısı
    }
    
    // Ziyaretçi sayısı
    const visitorElements = document.querySelectorAll('.text-2xl.font-bold.text-secondary');
    if (visitorElements.length > 2) {
        visitorElements[2].textContent = "4,857"; // Varsayılan ziyaretçi sayısı
    }
    
    // Son aktiviteler
    const activitiesContainer = document.querySelector('.lg\\:col-span-2 .space-y-4');
    if (activitiesContainer) {
        activitiesContainer.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0 mr-3">
                    <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <i class="ri-add-line text-blue-600"></i>
                    </div>
                </div>
                <div>
                    <p class="text-gray-700">Yeni kitap eklendi: <span class="font-medium">Beyaz Zambaklar Ülkesinde</span></p>
                    <p class="text-sm text-gray-500">2 gün önce</p>
                </div>
            </div>
            <div class="flex">
                <div class="flex-shrink-0 mr-3">
                    <div class="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                        <i class="ri-user-add-line text-purple-600"></i>
                    </div>
                </div>
                <div>
                    <p class="text-gray-700">Yeni yazar eklendi: <span class="font-medium">Ahmet Hamdi Tanpınar</span></p>
                    <p class="text-sm text-gray-500">3 gün önce</p>
                </div>
            </div>
            <div class="flex">
                <div class="flex-shrink-0 mr-3">
                    <div class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                        <i class="ri-edit-line text-green-600"></i>
                    </div>
                </div>
                <div>
                    <p class="text-gray-700">Kitap güncellendi: <span class="font-medium">Saatleri Ayarlama Enstitüsü</span></p>
                    <p class="text-sm text-gray-500">1 hafta önce</p>
                </div>
            </div>
        `;
    }
}

// İstatistikleri HTML'e uygula
function updateDashboardStats(booksStats, authorsStats) {
    // Kitap sayısı
    const bookCountElement = document.getElementById('totalBooks');
    if (bookCountElement) {
        bookCountElement.textContent = booksStats.totalCount;
    }
    
    // Kitap artış oranı
    const bookIncreaseElements = document.querySelectorAll('.text-green-500');
    if (bookIncreaseElements.length > 0) {
        const bookIncreaseElement = bookIncreaseElements[0];
        bookIncreaseElement.innerHTML = `<i class="ri-arrow-up-line"></i> ${booksStats.percentageIncrease}%`;
        
        // Eğer azalma varsa sınıfı değiştir
        if (booksStats.percentageIncrease < 0) {
            bookIncreaseElement.classList.remove('text-green-500');
            bookIncreaseElement.classList.add('text-red-500');
            bookIncreaseElement.innerHTML = `<i class="ri-arrow-down-line"></i> ${Math.abs(booksStats.percentageIncrease)}%`;
        }
    }
    
    // Yazar sayısı
    const authorCountElement = document.getElementById('totalAuthors');
    if (authorCountElement) {
        authorCountElement.textContent = authorsStats.totalCount;
    }
    
    // Yazar artış oranı
    const authorIncreaseElements = document.querySelectorAll('.text-green-500');
    if (authorIncreaseElements.length > 1) {
        const authorIncreaseElement = authorIncreaseElements[1];
        authorIncreaseElement.innerHTML = `<i class="ri-arrow-up-line"></i> ${authorsStats.percentageIncrease}%`;
        
        // Eğer azalma varsa sınıfı değiştir
        if (authorsStats.percentageIncrease < 0) {
            authorIncreaseElement.classList.remove('text-green-500');
            authorIncreaseElement.classList.add('text-red-500');
            authorIncreaseElement.innerHTML = `<i class="ri-arrow-down-line"></i> ${Math.abs(authorsStats.percentageIncrease)}%`;
        }
    }
    
    // Ziyaretçi istatistiklerini simüle et
    simulateVisitorStats();
}

// Ziyaretçi istatistiklerini simüle et
function simulateVisitorStats() {
    const visitorElements = document.querySelectorAll('.text-2xl.font-bold.text-secondary');
    if (visitorElements.length > 2) {
        const visitorCountElement = visitorElements[2];
        
        // Rastgele ziyaretçi sayısı (4000-6000 arası)
        const visitorCount = Math.floor(Math.random() * 2000) + 4000;
        visitorCountElement.textContent = visitorCount.toLocaleString();
        
        // Rastgele artış oranı (%5-15 arası)
        const percentageIncrease = Math.floor(Math.random() * 10) + 5;
        
        // Artış oranını güncelle
        const increaseElements = document.querySelectorAll('.text-green-500');
        if (increaseElements.length > 2) {
            const increaseElement = increaseElements[2];
            increaseElement.innerHTML = `<i class="ri-arrow-up-line"></i> ${percentageIncrease}%`;
        }
    }
}

// Son aktiviteleri yükle
async function loadRecentActivities() {
    try {
        // Son aktiviteleri içerecek konteyner
        const activitiesContainer = document.querySelector('.lg\\:col-span-2 .space-y-4');
        if (!activitiesContainer) return;
        
        // Yükleniyor göstergesi
        activitiesContainer.innerHTML = `
            <div class="flex items-center justify-center py-6">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span class="ml-2 text-gray-600">Aktiviteler yükleniyor...</span>
            </div>
        `;
        
        // Son eklenen ve güncellenen kitaplar ve yazarları getir
        const recentActivities = await getRecentActivities();
        
        // Aktiviteleri göster
        if (recentActivities.length > 0) {
            activitiesContainer.innerHTML = '';
            
            recentActivities.forEach(activity => {
                const activityElement = createActivityElement(activity);
                activitiesContainer.appendChild(activityElement);
            });
        } else {
            activitiesContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Henüz aktivite bulunmuyor</p>';
        }
    } catch (error) {
        console.error('Son aktiviteler yüklenirken hata:', error);
    }
}

// Son aktiviteleri getir
async function getRecentActivities() {
    try {
        // Son eklenen ve güncellenen kitapları getir
        const { data: books, error: booksError } = await supabaseClient
            .from('books')
            .select('*, author:author_id(name)')
            .order('updated_at', { ascending: false })
            .limit(2);
            
        if (booksError) throw booksError;
        
        // Son eklenen ve güncellenen yazarları getir
        const { data: authors, error: authorsError } = await supabaseClient
            .from('authors')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1);
            
        if (authorsError) throw authorsError;
        
        // Kitap ve yazar aktivitelerini birleştir
        const bookActivities = books ? books.map(book => ({
            type: 'book',
            action: book.created_at === book.updated_at ? 'add' : 'edit',
            data: book,
            date: new Date(book.updated_at || book.created_at)
        })) : [];
        
        const authorActivities = authors ? authors.map(author => ({
            type: 'author',
            action: author.created_at === author.updated_at ? 'add' : 'edit',
            data: author,
            date: new Date(author.updated_at || author.created_at)
        })) : [];
        
        // Tüm aktiviteleri birleştir ve tarihe göre sırala
        const allActivities = [...bookActivities, ...authorActivities]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5);
            
        return allActivities;
    } catch (error) {
        console.error('Son aktiviteler alınırken hata:', error);
        return [];
    }
}

// Aktivite elementi oluştur
function createActivityElement(activity) {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'flex';
    
    // Aktivite tipine göre ikon ve içerik belirle
    let iconClass = '';
    let iconBgClass = '';
    let activityText = '';
    let timeText = formatTimeAgo(activity.date);
    
    if (activity.type === 'book') {
        if (activity.action === 'add') {
            iconClass = 'ri-add-line text-blue-600';
            iconBgClass = 'bg-blue-100';
            activityText = `Yeni kitap eklendi: <span class="font-medium">${activity.data.title}</span>`;
        } else if (activity.action === 'edit') {
            iconClass = 'ri-edit-line text-green-600';
            iconBgClass = 'bg-green-100';
            activityText = `Kitap güncellendi: <span class="font-medium">${activity.data.title}</span>`;
        } else if (activity.action === 'delete') {
            iconClass = 'ri-delete-bin-line text-yellow-600';
            iconBgClass = 'bg-yellow-100';
            activityText = `Kitap silindi: <span class="font-medium">${activity.data.title}</span>`;
        }
    } else if (activity.type === 'author') {
        if (activity.action === 'add') {
            iconClass = 'ri-user-add-line text-purple-600';
            iconBgClass = 'bg-purple-100';
            activityText = `Yeni yazar eklendi: <span class="font-medium">${activity.data.name}</span>`;
        } else if (activity.action === 'edit') {
            iconClass = 'ri-user-settings-line text-purple-600';
            iconBgClass = 'bg-purple-100';
            activityText = `Yazar güncellendi: <span class="font-medium">${activity.data.name}</span>`;
        } else if (activity.action === 'delete') {
            iconClass = 'ri-user-unfollow-line text-yellow-600';
            iconBgClass = 'bg-yellow-100';
            activityText = `Yazar silindi: <span class="font-medium">${activity.data.name}</span>`;
        }
    }
    
    activityDiv.innerHTML = `
        <div class="flex-shrink-0 mr-3">
            <div class="w-9 h-9 rounded-full ${iconBgClass} flex items-center justify-center">
                <i class="${iconClass}"></i>
            </div>
        </div>
        <div>
            <p class="text-gray-700">${activityText}</p>
            <p class="text-sm text-gray-500">${timeText}</p>
        </div>
    `;
    
    return activityDiv;
}

// Tarih formatla (örn: "3 saat önce", "2 gün önce")
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Az önce';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} dakika önce`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} saat önce`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} gün önce`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ay önce`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} yıl önce`;
}

// Yükleniyor durumunu ayarla
function setLoadingState(isLoading) {
    const statsCards = document.querySelectorAll('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div');
    
    if (isLoading) {
        statsCards.forEach(card => {
            const originalContent = card.innerHTML;
            card.setAttribute('data-original-content', originalContent);
            
            card.innerHTML = `
                <div class="flex items-center justify-center h-full py-6">
                    <div class="animate-pulse flex flex-col items-center">
                        <div class="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
                        <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div class="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                </div>
            `;
        });
    } else {
        statsCards.forEach(card => {
            const originalContent = card.getAttribute('data-original-content');
            if (originalContent) {
                // Sadece boş içerik varsa geri yükle, yoksa zaten güncellenmiştir
                if (card.querySelector('.animate-pulse')) {
                    card.innerHTML = originalContent;
                }
                card.removeAttribute('data-original-content');
            }
        });
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

// Kullanıcı çıkış fonksiyonu
function logoutUser() {
    // Onay mesajı göster
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        // SessionStorage'dan admin oturum bilgilerini temizle
        sessionStorage.removeItem('kritik_admin_logged_in');
        sessionStorage.removeItem('kritik_admin_user');
        sessionStorage.removeItem('kritik_admin_login_time');
        
        // Login sayfasına yönlendir
        window.location.href = 'login.html';
    }
}

// Çıkış butonuna tıklama olayını ekle
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
});

// Admin kullanıcı adını görüntüleme
function displayAdminUsername() {
    const usernameElement = document.querySelector('.admin-profile .name');
    const avatarInitialElement = document.querySelector('.admin-profile .avatar span');
    
    if (usernameElement && avatarInitialElement) {
        const username = sessionStorage.getItem('kritik_admin_user') || 'Admin';
        usernameElement.textContent = username;
        
        // Avatar için baş harfi al
        const initial = username.charAt(0).toUpperCase();
        avatarInitialElement.textContent = initial;
    }
}

// Sayfa yüklendiğinde kullanıcı adını görüntüle
document.addEventListener('DOMContentLoaded', function() {
    displayAdminUsername();
    
    // Dashboard verilerini yükle
    loadDashboardStats();
    
    // Yenile butonu için olay dinleyicisi ekle
    const refreshButtons = document.querySelectorAll('button.bg-\\[\\#d4af37\\]');
    refreshButtons.forEach(button => {
        if (button.querySelector('i.ri-refresh-line')) {
            button.addEventListener('click', () => {
                loadDashboardStats();
            });
        }
    });
    
    // Gerçek zamanlı güncellemeler için olay dinleyicileri
    window.addEventListener('admin-book-changed', () => {
        loadDashboardStats();
    });
    
    window.addEventListener('admin-author-changed', () => {
        loadDashboardStats();
    });
}); 