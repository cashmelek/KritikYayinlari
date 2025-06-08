// Anasayfa.js - Anasayfa için JavaScript fonksiyonları

// Sayfa yükleme olayını dinle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Anasayfa yükleniyor...');
    
    // Banner yükleme
    loadPageBanners('homepage');
    
    // Kitap ve yazar verilerini yükle
    loadNewBooks();
    loadBestsellers();
    loadAuthors();
});

// Banner yükleme fonksiyonu
async function loadPageBanners(location = 'homepage') {
    try {
        console.log('Banner\'lar yükleniyor...', 'location:', location);
        
        // Supabase client kontrolü
        if (!window.supabaseClient) {
            console.error('Supabase client henüz yüklenmemiş');
            setTimeout(() => loadPageBanners(location), 1000); // 1 saniye sonra tekrar dene
            return;
        }
        
        const bannerContainer = document.getElementById('banner-container');
        if (!bannerContainer) {
            console.error('Banner container bulunamadı');
            return;
        }
        
        // Supabase'den aktif banner'ları getir
        console.log('Supabase sorgusu başlatılıyor...');
        const { data: banners, error } = await window.supabaseClient
            .from('banners')
            .select('*')
            .eq('is_active', true)
            .eq('location', location)
            .order('order_number', { ascending: true });
            
        console.log('Supabase sorgu tamamlandı');
        console.log('Sorgu hatası:', error);
        console.log('Gelen banner sayısı:', banners ? banners.length : 0);
        
        if (error) {
            console.error('Banner\'lar yüklenirken Supabase hatası:', error);
            throw error;
        }
        
        if (!banners || banners.length === 0) {
            console.warn('Banner verileri bulunamadı, varsayılan banner korunuyor.');
            // Varsayılan banner göster
            bannerContainer.innerHTML = `
                <div class="container mx-auto px-8 h-full flex items-center">
                    <div class="text-left max-w-2xl">
                        <div class="mb-4">
                            <i class="ri-book-open-line text-6xl text-primary"></i>
                        </div>
                        <h2 class="text-3xl font-bold text-secondary mb-2">Kritik Yayınları'na Hoş Geldiniz</h2>
                        <p class="text-lg text-gray-600 mb-4">Edebiyatın dünyasını en seçkin eserlerle keşfedin</p>
                        <a href="kitaplar.html" class="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                            Kitapları İncele
                            <i class="ri-arrow-right-line ml-2"></i>
                        </a>
                    </div>
                </div>
            `;
            return;
        }
        
        console.log('Banner verileri:', banners);
        
        // Banner slider HTML'ini oluştur
        bannerContainer.innerHTML = `
            <div class="banner-slider w-full h-full relative overflow-hidden">
                ${banners.map((banner, index) => {
                    // Banner görselinin var olup olmadığını kontrol et
                    const imageUrl = banner.image_url || 'https://via.placeholder.com/1200x400?text=Banner+G%C3%B6rseli';
                    // Base64 formatında bir görsel mi kontrol et
                    const isBase64Image = typeof imageUrl === 'string' && imageUrl.startsWith('data:image');
                    
                    // Sadece debug amaçlı
                    console.log(`Banner ${index} görseli:`, imageUrl.substring(0, 50) + (imageUrl.length > 50 ? '...' : ''));
                    
                    // Görsel URL'ini düzelt
                    const fixedImageUrl = window.ImageHelper ? window.ImageHelper.fixImageUrl(imageUrl) : imageUrl;
                    
                    return `
                    <div class="slide ${index === 0 ? 'active' : ''} absolute inset-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100' : 'opacity-0'}">
                        <div class="slide-bg w-full h-full relative">
                            <img src="${fixedImageUrl}" alt="${banner.title}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/1200x400?text=G%C3%B6rsel+Bulunamad%C4%B1'; this.onerror=null;">
                            <div class="absolute inset-0 bg-black bg-opacity-40"></div>
                        </div>
                        <div class="absolute inset-0 flex items-center justify-start">
                            <div class="container mx-auto px-8">
                                <div class="text-left text-white max-w-2xl">
                                    <h2 class="text-3xl md:text-4xl font-bold mb-4">${banner.title}</h2>
                                    ${banner.subtitle ? `<p class="text-xl mb-4">${banner.subtitle}</p>` : ''}
                                    ${banner.description ? `<p class="text-lg mb-6">${banner.description}</p>` : ''}
                                    ${banner.link ? `<a href="${banner.link}" class="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">Detaylar</a>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `}).join('')}
                
                ${banners.length > 1 ? `
                    <!-- Navigation Arrows -->
                    <button class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors" onclick="previousSlide()">
                        <i class="ri-arrow-left-line text-xl"></i>
                    </button>
                    <button class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors" onclick="nextSlide()">
                        <i class="ri-arrow-right-line text-xl"></i>
                    </button>
                    
                    <!-- Dots Indicator -->
                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        ${banners.map((_, index) => `
                            <button class="w-3 h-3 rounded-full transition-colors ${index === 0 ? 'bg-white' : 'bg-white/50'}" onclick="goToSlide(${index})"></button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Slider fonksiyonlarını başlat
        if (banners.length > 1) {
            setupBannerSlider(banners.length);
        }
        
        // Hover event'lerini ayarla
        setupSliderHoverEvents();
        
        // Görselleri düzelt (ImageHelper mevcut ise)
        if (window.ImageHelper) {
            setTimeout(() => {
                const bannerSliderImages = bannerContainer.querySelectorAll('img');
                bannerSliderImages.forEach((img, index) => {
                    if (img && banners[index]) {
                        window.ImageHelper.renderSafeImage(img, banners[index].image_url);
                    }
                });
            }, 100);
        }
        
        console.log('Banner\'lar başarıyla yüklendi ve gösterildi');
    } catch (error) {
        console.error('Banner\'lar yüklenirken hata:', error);
        const bannerContainer = document.getElementById('banner-container');
        if (bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="container mx-auto px-8 h-full flex items-center">
                    <div class="text-left max-w-2xl">
                        <div class="mb-4">
                            <i class="ri-book-open-line text-6xl text-primary"></i>
                        </div>
                        <h2 class="text-3xl font-bold text-secondary mb-2">Kritik Yayınları'na Hoş Geldiniz</h2>
                        <p class="text-lg text-gray-600 mb-4">Edebiyatın dünyasını en seçkin eserlerle keşfedin</p>
                        <a href="kitaplar.html" class="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                            Kitapları İncele
                            <i class="ri-arrow-right-line ml-2"></i>
                        </a>
                    </div>
                </div>
            `;
        }
    }
}

// Banner slider fonksiyonları
let currentSlide = 0;
let totalSlides = 0;
let slideInterval;

function setupBannerSlider(slideCount) {
    totalSlides = slideCount;
    currentSlide = 0;
    
    // Otomatik geçiş başlat
    startAutoSlide();
}

function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Mevcut slide'ı gizle
    const currentSlideElement = document.querySelector('.slide.active');
    if (currentSlideElement) {
        currentSlideElement.classList.remove('opacity-100');
        currentSlideElement.classList.add('opacity-0');
        currentSlideElement.classList.remove('active');
    }
    
    // Yeni slide'ı göster
    const slides = document.querySelectorAll('.slide');
    if (slides[index]) {
        slides[index].classList.add('active');
        slides[index].classList.remove('opacity-0');
        slides[index].classList.add('opacity-100');
    }
    
    // Dots'ları güncelle
    updateDots(index);
    
    currentSlide = index;
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % totalSlides;
    goToSlide(nextIndex);
}

function previousSlide() {
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prevIndex);
}

function updateDots(activeIndex) {
    const dots = document.querySelectorAll('.banner-slider button[onclick*="goToSlide"]');
    dots.forEach((dot, index) => {
        if (index === activeIndex) {
            dot.classList.remove('bg-white/50');
            dot.classList.add('bg-white');
        } else {
            dot.classList.remove('bg-white');
            dot.classList.add('bg-white/50');
        }
    });
}

function startAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // 5 saniyede bir geçiş
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// Mouse hover'da otomatik geçişi durdur
function setupSliderHoverEvents() {
    const bannerContainer = document.getElementById('banner-container');
    if (bannerContainer) {
        bannerContainer.addEventListener('mouseenter', stopAutoSlide);
        bannerContainer.addEventListener('mouseleave', startAutoSlide);
    }
}

// Yeni çıkan kitapları yükle
async function loadNewBooks() {
    try {
        // Doğrudan Supabase'den sadece is_new=true olan kitapları al
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

// Kitaplarımız bölümü için kitapları yükle
async function loadBestsellers() {
    try {
        // Supabase'den tüm kitapları getir - en son eklenenler
        const { data: allBooks, error } = await window.supabaseClient
                .from('books')
                .select('*, authors(*)')
                .order('created_at', { ascending: false })
                .limit(4);
            
        if (error) {
            console.error('Kitaplar sorgulanırken hata:', error);
            const container = document.getElementById('bestsellerBooksContainer');
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-6">
                        <p class="text-gray-500">Henüz kitap eklenmemiş</p>
                    </div>
                `;
            }
            return;
        }
        
        // Verileri göster
        displayBooks(allBooks, 'bestsellerBooksContainer');
    } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
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
                    <div class="aspect-square overflow-hidden bg-gray-100">
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
        
        // Kitap başlığını güvenli hale getir
        const bookTitle = book.title || '';
        
        // Kitap ID'sini güvenli hale getir
        const bookId = parseInt(book.id) || 0;
        
        // Etiketleri belirle
        let isNew = '';
        
        // is_new özelliği true olan kitaplar için "Yeni" etiketi göster
        if (book.is_new === true) {
            isNew = '<div class="absolute top-3 right-3"><span class="bg-primary text-white text-xs px-2 py-1 rounded-full">Yeni</span></div>';
        }
        
        // Görsel URL'sini işle
        let coverUrl = 'images/placeholder.png';
        if (book.cover_url) {
            coverUrl = book.cover_url;
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
