// Anasayfa.js - Anasayfa için JavaScript fonksiyonları

// Banner yükleme fonksiyonu
async function loadPageBanners(location = 'home') {
    try {
        console.log('Banner\'lar yükleniyor...');
        
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
        console.log('Banner verileri:', banners);
            
        if (error) {
            console.error('Banner\'lar yüklenirken Supabase hatası:', error);
            throw error;
        }
        
        if (!banners || banners.length === 0) {
            console.warn('Banner verileri bulunamadı, varsayılan banner korunuyor.');
            return;
        }
        
        // Banner slider HTML'ini oluştur
        bannerContainer.innerHTML = `
            <div class="banner-slider w-full h-full relative overflow-hidden">
                ${banners.map((banner, index) => `
                    <div class="slide ${index === 0 ? 'active' : ''} absolute inset-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100' : 'opacity-0'}">
                        <div class="slide-bg w-full h-full relative">
                            <img src="${banner.image_url}" alt="${banner.title}" class="w-full h-full object-cover">
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
                `).join('')}
                
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
        
        console.log('Banner\'lar başarıyla yüklendi ve gösterildi');
    } catch (error) {
        console.error('Banner\'lar yüklenirken hata:', error);
        const bannerContainer = document.getElementById('banner-container');
        if (bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="w-full h-full bg-red-50 flex items-center justify-center">
                    <div class="text-center text-red-600">
                        <i class="ri-error-warning-line text-4xl mb-4"></i>
                        <p>Banner\'lar yüklenirken bir hata oluştu</p>
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

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM yüklendi, banner\'lar yüklenmeye başlıyor...');
    
    // Supabase client'ın yüklenmesini bekle
    let retryCount = 0;
    const maxRetries = 10;
    
    const waitForSupabase = async () => {
        if (window.supabaseClient) {
            console.log('Supabase client hazır, banner\'lar yükleniyor...');
            // Banner'ları yükle
            await loadPageBanners('home');
            
            // Diğer içerikleri yükle
            await loadNewBooks();
            await loadBestsellers();
            await loadAuthors();
            
            // Gerçek zamanlı güncellemeleri başlat
            setupHomePageRealtime();
        } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Supabase client bekleniyor... (${retryCount}/${maxRetries})`);
            setTimeout(waitForSupabase, 500);
        } else {
            console.error('Supabase client yüklenemedi');
        }
    };
    
    await waitForSupabase();
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
