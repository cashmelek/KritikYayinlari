// Anasayfa.js - Anasayfa için JavaScript fonksiyonları

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', async function() {
    // Banner'ları yükle
    if (typeof loadPageBanners === 'function') {
        await loadPageBanners('homepage');
    }
    
    // Yeni çıkan kitapları ve çok satanları yükle
    await loadNewBooks();
    await loadBestsellers();
    
    // Yazarları yükle
    await loadAuthors();
    
    // Gerçek zamanlı güncellemeleri başlat
    setupHomePageRealtime();
});

// Yeni çıkan kitapları yükle
async function loadNewBooks() {
    try {
        // Doğrudan Supabase'den gerçek verileri al
        const { data: newBooks, error } = await window.supabaseClient
                .from('books')
                .select('*, authors(*)')
            .eq('is_new', true)
                .order('created_at', { ascending: false })
                .limit(4);
            
        if (error) {
            console.error('Yeni kitaplar sorgulanırken hata:', error);
            const container = document.getElementById('newBooksContainer');
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-6">
                        <p class="text-gray-500">Henüz yeni kitap eklenmemiş</p>
                    </div>
                `;
            }
            return;
        }
        
        // Verileri göster
        displayBooks(newBooks, 'newBooksContainer');
    } catch (error) {
        console.error('Yeni kitaplar yüklenirken hata:', error);
    }
}

// Çok satan kitapları yükle
async function loadBestsellers() {
    try {
        // Supabase'den gerçek verileri al
        const { data: bestsellers, error } = await window.supabaseClient
                .from('books')
                .select('*, authors(*)')
            .eq('is_bestseller', true)
                .order('created_at', { ascending: false })
                .limit(4);
            
        if (error) {
            console.error('Çok satan kitaplar sorgulanırken hata:', error);
            const container = document.getElementById('bestsellerBooksContainer');
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-6">
                        <p class="text-gray-500">Henüz çok satan kitap eklenmemiş</p>
                    </div>
                `;
            }
            return;
        }
        
        // Verileri göster
        displayBooks(bestsellers, 'bestsellerBooksContainer');
    } catch (error) {
        console.error('Çok satan kitaplar yüklenirken hata:', error);
    }
}

// Yazarları yükle
async function loadAuthors() {
    try {
        // Yazarlar bölümündeki grid container'ı
        const authorsContainer = document.getElementById('authorsContainer');
        
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
            authorsContainer.innerHTML = `
                <div class="col-span-full text-center py-6">
                    <p class="text-gray-500">Yazarlar yüklenirken hata oluştu</p>
                </div>
            `;
            return;
        }
        
        if (!authors || authors.length === 0) {
            console.log('Henüz hiç yazar eklenmemiş');
            authorsContainer.innerHTML = `
                <div class="col-span-full text-center py-6">
                    <p class="text-gray-500">Henüz yazar eklenmemiş</p>
                </div>
            `;
            return;
        }
        
        // Yazarları HTML olarak oluştur
        const authorsHTML = authors.map(author => {
            // Kitap sayısını hesapla
            let bookCount = 0;
            if (author.books) {
                if (Array.isArray(author.books)) {
                    bookCount = author.books.length;
                } else if (typeof author.book_count === 'number') {
                    bookCount = author.book_count;
                }
            }
            
            // Yazar fotoğrafı
            const photoUrl = author.photo_url || 'images/placeholder-author.png';
            
            return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                <a href="yazarlar.html?yazar_id=${author.id}" class="block">
                    <div class="relative h-48 overflow-hidden bg-gray-100">
                        <img src="${photoUrl}" alt="${author.name}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onerror="this.src='images/placeholder-author.png'">
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-bold text-secondary line-clamp-1">${author.name}</h3>
                        <p class="text-gray-600 line-clamp-2 h-12 mb-2">${author.bio || 'Yazar hakkında bilgi bulunmuyor'}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">${bookCount} Kitap</span>
                            <span class="text-primary">Detay <i class="ri-arrow-right-line"></i></span>
                        </div>
                    </div>
                </a>
                </div>
            `;
        }).join('');
        
        // HTML'i sayfaya ekle
        authorsContainer.innerHTML = authorsHTML;
    } catch (error) {
        console.error('Yazarlar yüklenirken hata:', error);
        const authorsContainer = document.getElementById('authorsContainer');
        if (authorsContainer) {
            authorsContainer.innerHTML = `
                <div class="col-span-full text-center py-6">
                    <p class="text-gray-500">Yazarlar yüklenirken hata oluştu</p>
                </div>
            `;
        }
    }
}

// Kitapları göster
function displayBooks(books, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Eğer kitap yoksa
    if (!books || books.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-6">
                <p class="text-gray-500">Henüz kitap eklenmemiş</p>
            </div>
        `;
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
        
        // Fiyat bilgisini kontrol et
        const price = book.price || '';
        const originalPrice = book.original_price || '';
        const hasDiscount = book.discount && book.discount > 0;
        
        // İndirim yüzdesi
        const discountPercent = book.discount || 0;
        
        // Kapak görseli URL'i
        const coverUrl = book.cover_url || 'images/placeholder.png';
        
        // Kitap kartını oluştur
        return `
        <div class="book-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
            <a href="kitap-detay.html?id=${book.id}" class="block">
                <div class="relative h-64 overflow-hidden bg-gray-100">
                    <img src="${coverUrl}" alt="${book.title}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onerror="this.src='images/placeholder.png'">
                    ${hasDiscount ? `<div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">%${discountPercent} İndirim</div>` : ''}
                    ${book.is_new ? `<div class="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">Yeni</div>` : ''}
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold text-secondary line-clamp-2 h-14">${book.title}</h3>
                    <p class="text-gray-600 mb-2">${authorName}</p>
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-primary font-bold">${price}</span>
                            ${hasDiscount ? `<span class="text-gray-400 line-through text-sm ml-2">${originalPrice}</span>` : ''}
                        </div>
                        <button class="bg-primary hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                            İncele
                        </button>
                    </div>
                </div>
            </a>
        </div>
        `;
    }).join('');
    
    // HTML'i sayfaya ekle
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
                        await loadBestsellers();
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
            await loadBestsellers();
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
                await loadBestsellers();
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
                    await loadBestsellers();
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
