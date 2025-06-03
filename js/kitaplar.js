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
        } else if (urlParams.get('filter') === 'bestseller') {
            query = query.eq('is_bestseller', true);
            filterInfo = 'çok satanlar';
        }
        
        // Sıralama
        query = query.order('created_at', { ascending: false });
        
        // Sorguyu çalıştır
        const { data: books, error } = await query;
        
        // Hata kontrolü
        if (error) {
            console.error('Kitaplar yüklenirken hata:', error);
            booksGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Kitaplar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
                </div>
            `;
            return;
        }
        
        // Kitap yoksa
        if (!books || books.length === 0) {
            booksGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="mb-4">
                        <i class="ri-book-2-line text-5xl text-gray-300"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-600 mb-2">Kitap Bulunamadı</h3>
                    <p class="text-gray-500">Aradığınız kriterlere uygun kitap bulunmuyor.</p>
                </div>
            `;
            return;
        }
        
        // Filtre bilgisini güncelle
        const filterInfoElement = document.getElementById('filter-info');
        if (filterInfoElement && filterInfo) {
            filterInfoElement.textContent = filterInfo;
            filterInfoElement.classList.remove('hidden');
        }
        
        // Kitapları listeleme
        const booksHTML = books.map(book => createBookCard(book)).join('');
        booksGrid.innerHTML = booksHTML;
        
    } catch (error) {
        console.error('Kitaplar yüklenirken beklenmeyen hata:', error);
        const booksGrid = document.querySelector('.books-grid');
        if (booksGrid) {
            booksGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                </div>
            `;
        }
    }
}

// Kitap kartı oluştur
function createBookCard(book) {
    // Yazar adını al - authors tablosundan
    let authorName = 'Bilinmeyen Yazar';
    if (book.authors) {
        if (typeof book.authors === 'string') {
            authorName = book.authors;
        } else if (book.authors.name) {
            authorName = book.authors.name;
        } else if (Array.isArray(book.authors) && book.authors.length > 0) {
            authorName = book.authors[0].name || 'Bilinmeyen Yazar';
        }
    }
    
    // Kapak resmi URL'sini kontrol et
    const coverUrl = book.cover_url || 'images/placeholder.png';
    
    // Fiyat bilgisini kontrol et
    const price = book.price || '';
    const originalPrice = book.original_price || '';
    const hasDiscount = book.discount && book.discount > 0;
    
    // İndirim yüzdesi
    const discountPercent = book.discount || 0;
    
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="book-image-container h-64 flex items-center justify-center bg-gray-100 overflow-hidden">
                <a href="kitap-detay.html?kitap_id=${book.id}" class="block w-full h-full relative">
                    <img src="${coverUrl}" alt="${book.title}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onerror="this.src='images/placeholder.png'">
                    ${hasDiscount ? `<div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">%${discountPercent} İndirim</div>` : ''}
                    ${book.is_new ? `<div class="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">Yeni</div>` : ''}
                </a>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-secondary line-clamp-2 h-12 mb-1">${book.title}</h3>
                <p class="text-gray-600 text-sm mb-2">${authorName}</p>
                <div class="flex justify-between items-center">
                    <div>
                        <span class="text-primary font-bold">${price}</span>
                        ${hasDiscount ? `<span class="text-gray-400 line-through text-sm ml-2">${originalPrice}</span>` : ''}
                    </div>
                    <a href="kitap-detay.html?kitap_id=${book.id}" class="bg-primary hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        İncele
                    </a>
                </div>
            </div>
        </div>
    `;
} 