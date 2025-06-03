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
        showNotification('Dashboard verileri yüklenirken bir hata oluştu', 'error');
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
            totalCount: 0,
            recentCount: 0,
            percentageIncrease: 0
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
            totalCount: 0,
            recentCount: 0,
            percentageIncrease: 0
        };
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
    const bookIncreaseElement = document.querySelector('.text-green-500:has(i.ri-arrow-up-line) + .text-gray-500');
    if (bookIncreaseElement) {
        const increaseText = bookIncreaseElement.previousElementSibling;
        if (increaseText) {
            increaseText.innerHTML = `<i class="ri-arrow-up-line"></i> ${booksStats.percentageIncrease}%`;
            
            // Eğer azalma varsa sınıfı değiştir
            if (booksStats.percentageIncrease < 0) {
                increaseText.classList.remove('text-green-500');
                increaseText.classList.add('text-red-500');
                increaseText.innerHTML = `<i class="ri-arrow-down-line"></i> ${Math.abs(booksStats.percentageIncrease)}%`;
            }
        }
    }
    
    // Yazar sayısı
    const authorCountElement = document.getElementById('totalAuthors');
    if (authorCountElement) {
        authorCountElement.textContent = authorsStats.totalCount;
    }
    
    // Yazar artış oranı
    const authorIncreaseElement = document.querySelectorAll('.text-green-500:has(i.ri-arrow-up-line) + .text-gray-500')[1];
    if (authorIncreaseElement) {
        const increaseText = authorIncreaseElement.previousElementSibling;
        if (increaseText) {
            increaseText.innerHTML = `<i class="ri-arrow-up-line"></i> ${authorsStats.percentageIncrease}%`;
            
            // Eğer azalma varsa sınıfı değiştir
            if (authorsStats.percentageIncrease < 0) {
                increaseText.classList.remove('text-green-500');
                increaseText.classList.add('text-red-500');
                increaseText.innerHTML = `<i class="ri-arrow-down-line"></i> ${Math.abs(authorsStats.percentageIncrease)}%`;
            }
        }
    }
    
    // Diğer istatistikleri güncelle (ziyaretçi ve indirme istatistikleri simüle edilebilir)
    simulateVisitorStats();
    simulateDownloadStats();
}

// Ziyaretçi istatistiklerini simüle et
function simulateVisitorStats() {
    const visitorCountElement = document.querySelector('.text-secondary:has(+ div > p:contains("Ziyaretçiler"))');
    if (visitorCountElement) {
        // Rastgele ziyaretçi sayısı (4000-6000 arası)
        const visitorCount = Math.floor(Math.random() * 2000) + 4000;
        visitorCountElement.textContent = visitorCount.toLocaleString();
        
        // Rastgele artış oranı (%5-15 arası)
        const percentageIncrease = Math.floor(Math.random() * 10) + 5;
        
        // Artış oranını güncelle
        const increaseElement = document.querySelectorAll('.text-green-500:has(i.ri-arrow-up-line) + .text-gray-500')[2];
        if (increaseElement) {
            const increaseText = increaseElement.previousElementSibling;
            if (increaseText) {
                increaseText.innerHTML = `<i class="ri-arrow-up-line"></i> ${percentageIncrease}%`;
            }
        }
    }
}

// İndirme istatistiklerini simüle et
function simulateDownloadStats() {
    const downloadCountElement = document.querySelector('.text-secondary:has(+ div > p:contains("İndirmeler"))');
    if (downloadCountElement) {
        // Rastgele indirme sayısı (800-1200 arası)
        const downloadCount = Math.floor(Math.random() * 400) + 800;
        downloadCountElement.textContent = downloadCount.toLocaleString();
        
        // Rastgele artış veya azalış (-5 ile +5 arası)
        const percentageChange = Math.floor(Math.random() * 10) - 5;
        
        // Artış veya azalış oranını güncelle
        const changeElement = document.querySelectorAll('.text-red-500:has(i.ri-arrow-down-line), .text-green-500:has(i.ri-arrow-up-line)')[3];
        if (changeElement) {
            if (percentageChange >= 0) {
                changeElement.classList.remove('text-red-500');
                changeElement.classList.add('text-green-500');
                changeElement.innerHTML = `<i class="ri-arrow-up-line"></i> ${percentageChange}%`;
            } else {
                changeElement.classList.remove('text-green-500');
                changeElement.classList.add('text-red-500');
                changeElement.innerHTML = `<i class="ri-arrow-down-line"></i> ${Math.abs(percentageChange)}%`;
            }
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
            
            // "Tüm aktiviteleri gör" bağlantısını ekle
            const viewAllLink = document.createElement('div');
            viewAllLink.className = 'mt-4 text-center';
            viewAllLink.innerHTML = '<a href="#" class="text-[#d4af37] hover:underline text-sm">Tüm aktiviteleri gör</a>';
            activitiesContainer.appendChild(viewAllLink);
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
            .select('*, authors:author_id(name)')
            .order('updated_at', { ascending: false })
            .limit(3);
            
        if (booksError) throw booksError;
        
        // Son eklenen ve güncellenen yazarları getir
        const { data: authors, error: authorsError } = await supabaseClient
            .from('authors')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(2);
            
        if (authorsError) throw authorsError;
        
        // Kitap ve yazar aktivitelerini birleştir
        const bookActivities = books.map(book => ({
            type: 'book',
            action: book.created_at === book.updated_at ? 'add' : 'edit',
            data: book,
            date: new Date(book.updated_at || book.created_at)
        }));
        
        const authorActivities = authors.map(author => ({
            type: 'author',
            action: author.created_at === author.updated_at ? 'add' : 'edit',
            data: author,
            date: new Date(author.updated_at || author.created_at)
        }));
        
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

// Sayfa yüklendiğinde verileri çek
document.addEventListener('DOMContentLoaded', () => {
    // Dashboard verilerini yükle
    loadDashboardStats();
    
    // Yenile butonu için olay dinleyicisi ekle
    const refreshButton = document.querySelector('button.bg-\\[\\#d4af37\\]:has(i.ri-refresh-line)');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            loadDashboardStats();
        });
    }
    
    // Gerçek zamanlı güncellemeler için olay dinleyicileri
    window.addEventListener('admin-book-changed', () => {
        loadDashboardStats();
    });
    
    window.addEventListener('admin-author-changed', () => {
        loadDashboardStats();
    });
}); 