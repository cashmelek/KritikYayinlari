// Kitaplar sayfası için gerekli JavaScript kodları
document.addEventListener('DOMContentLoaded', async function() {
    // Supabase bağlantısı
    const supabase = window.supabaseClient;
    
    // URL parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    const yazarId = urlParams.get('yazar_id');
    const filterType = urlParams.get('filter_type') || ''; // yazar_kitaplari veya yazar

    // Banner işlemleri için listener ekle
    setupBannerListeners();
    
    // Kitapları yükle
    await loadBooks();
    
    // Sayfa yüklendiğinde loading overlay'i kaldır
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hidden');
        document.getElementById('pageContent').classList.add('loaded');
    }, 300);
    
    // Mobil menü işlemleri
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Banner tıklama olaylarını dinle
function setupBannerListeners() {
    // Banner tıklama olaylarını dinlemek için
    document.addEventListener('bannerClick', function(e) {
        const banner = e.detail;
        if (banner && banner.target_type === 'yazar_kitaplari' && banner.target_id) {
            console.log('Yazar kitapları bannerına tıklandı:', banner);
            // Burada sayfa yönlendirmesi zaten yapılmış olacak
        }
    });
}

// Kitapları yükleyip gösteren fonksiyon
async function loadBooks() {
    try {
        // Yükleniyor göstergesini göster
        const booksGrid = document.querySelector('.books-grid');
        if (!booksGrid) return;
        
        booksGrid.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        `;
        
        // URL parametrelerini kontrol et
        const urlParams = new URLSearchParams(window.location.search);
        const yazarId = urlParams.get('yazar_id');
        const filterType = urlParams.get('filter_type') || ''; // yazar_kitaplari veya yazar
        
        // Filtreleme bilgisi
        let filterInfo = '';
        
        // Supabase sorgusu oluştur
        let query = window.supabaseClient
            .from('books')
            .select('*, authors(*)');
        
        // Yazar filtrelemesi
        if (yazarId) {
            query = query.eq('author_id', yazarId);
            filterInfo = 'yazara göre filtrelendi';
        }
        
        // Kategori filtreleme
        const kategori = urlParams.get('category');
        if (kategori) {
            query = query.eq('category', kategori);
            filterInfo = 'kategoriye göre filtrelendi';
        }
        
        // Filtreleme türüne göre ek filtreler
        if (urlParams.get('filter') === 'new') {
            query = query.eq('is_new', true);
            filterInfo = 'yeni çıkanlar';
        }
        
        // Sıralama - her durumda created_at tarihine göre sırala
        query = query.order('created_at', { ascending: false });
        
        // Sorguyu çalıştır
        const { data: books, error } = await query;
        
        if (error) {
            console.error('Kitaplar yüklenirken hata:', error);
            throw error;
        }
        
        displayBooks(books, filterInfo);
    } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
        displayError('Kitaplar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
    }
}

// Kitapları göster
function displayBooks(books, filterInfo = '') {
    const booksGrid = document.querySelector('.books-grid');
    if (!booksGrid) return;
    
    // Filtreleme bilgisi varsa göster
    if (filterInfo) {
        // Filtreleme bilgisini göster
        const filterContainer = document.querySelector('.filter-info-container');
        if (filterContainer) {
            filterContainer.innerHTML = filterInfo;
        }
    }
    
        if (!books || books.length === 0) {
            booksGrid.innerHTML = `
            <div class="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <div class="text-gray-400 text-5xl mb-4">
                    <i class="ri-book-open-line"></i>
                    </div>
                <h3 class="text-xl font-medium text-gray-700 mb-2">Kitap Bulunamadı</h3>
                <p class="text-gray-500">Aradığınız kriterlere uygun kitap bulunamadı.</p>
                </div>
            `;
            return;
        }
        
    booksGrid.innerHTML = books.map(book => {
        // Yazar adını daha güvenli bir şekilde al ve XSS koruması ekle
    let authorName = 'Bilinmeyen Yazar';
    if (book.authors) {
        if (typeof book.authors === 'string') {
                authorName = escapeHtml(book.authors);
        } else if (book.authors.name) {
                authorName = escapeHtml(book.authors.name);
        } else if (Array.isArray(book.authors) && book.authors.length > 0) {
                authorName = escapeHtml(book.authors[0].name || 'Bilinmeyen Yazar');
        }
    }
    
        // Kitap başlığını güvenli hale getir
        const bookTitle = escapeHtml(book.title || '');
        
        // Kitap ID'sini güvenli hale getir
        const bookId = parseInt(book.id) || 0;
    
        // Etiketleri belirle
        let isNew = '';
        
        // is_new özelliği true olan kitaplar için "Yeni" etiketi göster
        if (book.is_new === true) {
            isNew = '<div class="absolute top-3 right-3"><span class="bg-primary text-white text-xs px-2 py-1 rounded-full">Yeni</span></div>';
        }
        
        // Görsel URL'sini işle ve güvenli hale getir
        let coverUrl = 'images/placeholder.png';
        if (book.cover_url) {
            // Base64 verisi ise doğrudan kullan
            if (typeof book.cover_url === 'string' && book.cover_url.startsWith('data:')) {
                coverUrl = book.cover_url;
            } else if (typeof book.cover_url === 'string') {
                // URL enjeksiyon saldırılarını önlemek için
                coverUrl = book.cover_url.replace(/["'<>]/g, '');
            }
        }
    
    return `
            <div class="book-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <a href="kitap-detay.html?kitap_id=${bookId}" class="block">
                    <div class="aspect-square overflow-hidden bg-gray-100 relative">
                        <img src="${coverUrl}" alt="${bookTitle}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onerror="this.src='images/placeholder.png'">
                        ${isNew}
            </div>
            <div class="p-4">
                        <h3 class="font-bold text-gray-800 mb-1 line-clamp-2">${bookTitle}</h3>
                <p class="text-gray-600 text-sm mb-2">${authorName}</p>
                        <div class="flex justify-end items-center mt-2">
                            <span class="bg-primary text-white text-xs px-3 py-1 rounded-full">İncele</span>
                        </div>
                    </div>
                    </a>
        </div>
    `;
    }).join('');
} 