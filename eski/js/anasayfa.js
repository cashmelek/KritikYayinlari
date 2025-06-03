// Anasayfa.js - Anasayfa için JavaScript fonksiyonları

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', async function() {
    // Banner'ları yükle
    if (typeof loadPageBanners === 'function') {
        await loadPageBanners('homepage');
    }
    
    // Yeni çıkan kitapları yükle
    await loadNewBooks();
    
    // Çok satan kitapları yükle
    await loadBestsellerBooks();
    
    // Yazarları yükle
    await loadAuthors();
    
    // Gerçek zamanlı güncellemeleri başlat
    setupHomePageRealtime();
});

// Yeni çıkan kitapları yükle
async function loadNewBooks() {
    try {
        let newBooks = await fetchNewBooks();
        
        // Eğer yeni kitap yoksa, tüm kitaplardan en son eklenenlerı al
        if (!newBooks || newBooks.length === 0) {
            const { data: allBooks, error } = await window.supabaseClient
                .from('books')
                .select('*, authors(*)')
                .order('created_at', { ascending: false })
                .limit(4);
            
            if (!error && allBooks) {
                newBooks = allBooks;
            }
        }
        
        displayBooks(newBooks, 'newBooksContainer');
    } catch (error) {
        console.error('Yeni kitaplar yüklenirken hata:', error);
    }
}

// Çok satan kitapları yükle
async function loadBestsellerBooks() {
    try {
        let bestsellers = await fetchBestsellers();
        
        // Eğer çok satan kitap yoksa, tüm kitaplardan rastgele seç
        if (!bestsellers || bestsellers.length === 0) {
            const { data: allBooks, error } = await window.supabaseClient
                .from('books')
                .select('*, authors(*)')
                .order('created_at', { ascending: false })
                .limit(4);
            
            if (!error && allBooks) {
                bestsellers = allBooks;
            }
        }
        
        displayBooks(bestsellers, 'bestsellerBooksContainer');
    } catch (error) {
        console.error('Çok satan kitaplar yüklenirken hata:', error);
    }
}

// Yazarları yükle
async function loadAuthors() {
    try {
        // Yazarlar bölümündeki grid container'ını daha basit şekilde bul
        const authorsContainer = document.querySelector('section:nth-of-type(3) .grid') || 
                                document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4');
        
        if (!authorsContainer) {
            console.error('Yazarlar için container bulunamadı');
            return;
        }
        
        // Supabase'den yazarları getir
        const { data: authors, error } = await window.supabaseClient
            .from('authors')
            .select('*, books(id)')
            .order('name')
            .limit(4);
        
        if (error) {
            console.error('Yazarlar yüklenirken hata:', error);
            authorsContainer.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Yazarlar yüklenirken hata oluştu</div>';
            return;
        }
        
        if (!authors || authors.length === 0) {
            console.log('Henüz hiç yazar eklenmemiş');
            authorsContainer.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Henüz yazar eklenmemiş</div>';
            return;
        }
        
        // Yazarları HTML olarak ekle
        let html = '';
        
        authors.forEach(author => {
            const bookCount = author.books ? author.books.length : 0;
            
            html += `
                <div class="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow">
                    <div class="relative overflow-hidden">
                        <img src="${author.photo_url || 'site_resimleri/placeholder.png'}" alt="${author.name}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                            <a href="yazar-detay.html?id=${author.id}" class="bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-opacity-90 transition mb-4">
                                Kitapları Gör
                            </a>
                        </div>
                    </div>
                    <div class="p-4 text-center">
                        <h3 class="text-lg font-semibold text-secondary mb-1">${author.name}</h3>
                        <p class="text-sm text-primary font-medium">${bookCount} Kitap</p>
                    </div>
                </div>
            `;
        });
        
        // Yazarları sayfaya ekle
        authorsContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Yazarlar yüklenirken beklenmeyen bir hata oluştu:', error);
    }
}

// Kitapları göster
function displayBooks(books, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Eğer kitap yoksa
    if (!books || books.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Kitap bulunamadı</div>';
        return;
    }
    
    // Kitapları HTML olarak oluştur
    const booksHTML = books.map(book => {
        // Yazar adını daha güvenli bir şekilde al
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
        
        // Etiketleri container'a göre belirle
        let isNew = '';
        let isBestseller = '';
        
        // Sadece newBooksContainer'da "Yeni" etiketi göster
        if (containerId === 'newBooksContainer' && book.is_new) {
            isNew = '<div class="absolute top-3 right-3"><span class="bg-primary text-white text-xs px-2 py-1 rounded-full">Yeni</span></div>';
        }
        
        // Her iki container'da da "Çok Satan" etiketi göster
        if (book.is_bestseller) {
            isBestseller = '<div class="absolute top-3 left-3"><span class="flex items-center bg-white text-secondary text-xs px-2 py-1 rounded-full shadow-sm"><i class="ri-star-fill text-yellow-400 mr-1"></i> Çok Satan</span></div>';
        }
        
        // Görsel URL'sini işle - ImageScaler modülü ile uyumlu hale getir
        let coverUrl = 'site_resimleri/placeholder.png';
        if (book.cover_url) {
            // Base64 verisi ise doğrudan kullan
            if (book.cover_url.startsWith('data:')) {
                coverUrl = book.cover_url;
            } else {
                // Normal URL ise kontrol et
                coverUrl = book.cover_url;
            }
        }
        
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col">
                <div class="relative overflow-hidden flex-shrink-0">
                    <div class="bg-gradient-to-br from-gray-50 to-gray-100 h-80 w-full flex items-center justify-center overflow-hidden book-image-container">
                        <img src="${coverUrl}" alt="${book.title}" class="max-h-full max-w-full object-contain p-2 transition-all duration-300 group-hover:scale-105" crossorigin="anonymous" onerror="this.src='site_resimleri/placeholder.png'">
                    </div>
                    ${isNew}
                    ${isBestseller}
                </div>
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-secondary mb-2 line-clamp-2 leading-tight">${book.title}</h3>
                        <p class="text-sm text-gray-600 mb-3 font-medium">${authorName}</p>
                    </div>
                    <div class="flex justify-between items-center mt-auto">
                        <a href="kitap-detay.html?id=${book.id}" class="text-primary hover:underline font-medium">Detaylar</a>
                        <a href="kitap-detay.html?id=${book.id}" class="text-secondary hover:text-primary transition-colors">
                            <i class="ri-arrow-right-circle-line text-xl"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = booksHTML;
}

// Anasayfa için gerçek zamanlı güncellemeleri ayarla
function setupHomePageRealtime() {
    try {
        // Kitaplar için gerçek zamanlı güncellemeler
        if (window.supabaseClient) {
            const booksChannel = window.supabaseClient.channel('public:books')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'books' },
                    async (payload) => {
                        console.log('Kitaplar güncellendi:', payload);
                        
                        // Yeni kitapları yeniden yükle
                        await loadNewBooks();
                        
                        // Çok satan kitapları yeniden yükle
                        await loadBestsellerBooks();
                    }
                )
                .subscribe();
                
            console.log('Kitaplar için gerçek zamanlı güncellemeler başlatıldı');
            
            // Yazarlar için gerçek zamanlı güncellemeler
            const authorsChannel = window.supabaseClient.channel('public:authors')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'authors' },
                    async (payload) => {
                        console.log('Yazarlar güncellendi:', payload);
                        
                        // Yazarları yeniden yükle
                        await loadAuthors();
                    }
                )
                .subscribe();
                
            console.log('Yazarlar için gerçek zamanlı güncellemeler başlatıldı');
        }
        
        // Admin panelinden gelen olayları dinle
        window.addEventListener('book-added', async (event) => {
            console.log('Yeni kitap eklendi olayı alındı:', event.detail);
            await loadNewBooks();
            await loadBestsellerBooks();
        });
        
        window.addEventListener('author-added', async (event) => {
            console.log('Yeni yazar eklendi olayı alındı:', event.detail);
            await loadAuthors();
        });
        
        // Mock Supabase insert olaylarını dinle
        window.addEventListener('supabase-insert', async (event) => {
            if (event.detail && event.detail.table === 'books') {
                console.log('Mock Supabase: Kitap eklendi olayı alındı:', event.detail);
                await loadNewBooks();
                await loadBestsellerBooks();
            } else if (event.detail && event.detail.table === 'authors') {
                console.log('Mock Supabase: Yazar eklendi olayı alındı:', event.detail);
                await loadAuthors();
            }
        });
        
        // Broadcast Channel dinleyicisi
        try {
            const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
            broadcastChannel.onmessage = async (event) => {
                console.log('Broadcast mesajı alındı:', event.data);
                
                if (event.data.type === 'book') {
                    await loadNewBooks();
                    await loadBestsellerBooks();
                } else if (event.data.type === 'author') {
                    await loadAuthors();
                }
            };
            
            console.log('Broadcast dinleyici başlatıldı');
        } catch (e) {
            console.warn('Broadcast Channel başlatılamadı:', e);
        }
    } catch (error) {
        console.error('Gerçek zamanlı güncellemeler başlatılırken hata:', error);
    }
}
