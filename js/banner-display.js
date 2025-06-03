// Banner Display JS - Kritik Yayınları
// Bu dosya, web sitesinde bannerların gösterilmesi için gerekli fonksiyonları içerir

// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', () => {
    // Supabase bağlantısını kontrol et
    if (!window.supabaseClient) {
        console.error('Supabase bağlantısı bulunamadı!');
        return;
    }
    
    // Banner gösterim alanlarını bul
    setupBannerAreas();
});

// Banner gösterim alanlarını belirle ve yükle
async function setupBannerAreas() {
    try {
        // Mevcut sayfanın türünü belirle
        const pageType = getPageType();
        
        // Sayfa türüne göre banner gösterim alanlarını ayarla
        if (pageType === 'homepage') {
            // Ana sayfa için banner alanları
            await loadBanners('homepage', 'hero-slider-container');
            await loadBanners('homepage', 'promo-banner-container');
        } else if (pageType === 'books') {
            // Kitaplar sayfası için banner alanları
            await loadBanners('books', 'books-page-banner-container');
        } else if (pageType === 'authors') {
            // Yazarlar sayfası için banner alanları
            await loadBanners('authors', 'authors-page-banner-container');
        }
        
        // Tüm sayfalarda gösterilecek bannerlar
        await loadBanners('all', 'all-pages-banner-container');
        
    } catch (error) {
        console.error('Banner alanları ayarlanırken hata:', error);
    }
}

// Bannerları yükle ve göster
async function loadBanners(location, containerId) {
    try {
        // Konteyner elementini bul
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Bugünün tarihini al
        const today = new Date().toISOString().split('T')[0];
        
        // Bannerları Supabase'den çek
        const { data: banners, error } = await supabaseClient
            .from('banners')
            .select('*')
            .eq('location', location)
            .eq('is_active', true)
            .or(`start_date.is.null,start_date.lte.${today}`)
            .or(`end_date.is.null,end_date.gte.${today}`)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        // Eğer banner yoksa
        if (!banners || banners.length === 0) {
            // Konteyner varsa gizle
            if (container) {
                container.style.display = 'none';
            }
            return;
        }
        
        // Bannerları göster
        displayBanners(banners, container, containerId);
        
        // Banner görüntüleme istatistiklerini güncelle
        updateBannerViewStats(banners);
        
    } catch (error) {
        console.error(`${location} konumu için bannerlar yüklenirken hata:`, error);
        
        // Hata durumunda banner konteynerini gizle
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }
}

// Bannerları göster
function displayBanners(banners, container, containerId) {
    // Konteyner içeriğini temizle
    container.innerHTML = '';
    
    // Konteyner türüne göre banner görünümünü ayarla
    if (containerId.includes('hero-slider')) {
        // Hero slider için banner görünümü
        displayHeroSliderBanners(banners, container);
    } else if (containerId.includes('promo')) {
        // Promosyon banner'ları için görünüm
        displayPromoBanners(banners, container);
    } else {
        // Standart banner görünümü
        displayStandardBanners(banners, container);
    }
    
    // Banner konteynerini görünür yap
    container.style.display = 'block';
}

// Hero slider banner görünümü
function displayHeroSliderBanners(banners, container) {
    // En fazla 3 banner göster
    const sliderBanners = banners.slice(0, 3);
    
    // Hero slider HTML yapısını oluştur
    let sliderHTML = `
        <div class="relative">
            <div class="flex transition-transform duration-500 ease-in-out" id="heroSlider">
    `;
    
    // Her banner için slide oluştur
    sliderBanners.forEach((banner, index) => {
        sliderHTML += `
            <div class="min-w-full banner-item" data-banner-id="${banner.id}">
                <div class="flex flex-col md:flex-row items-center">
                    <div class="md:w-1/2 mb-10 md:mb-0">
                        <h1 class="text-4xl md:text-5xl font-bold text-secondary mb-6">${banner.title}</h1>
                        <p class="text-gray-600 mb-8 text-lg">${banner.description}</p>
                        <div class="flex flex-wrap gap-4">
                            <a href="${banner.link_url || '#'}" class="bg-primary text-white px-6 py-3 !rounded-button font-medium hover:bg-opacity-90 transition whitespace-nowrap banner-link" data-banner-id="${banner.id}">
                                Detaylar
                            </a>
                        </div>
                    </div>
                    <div class="md:w-1/2 flex justify-center">
                        <img src="${banner.image_url}" alt="${banner.title}" class="rounded-lg shadow-lg object-cover w-full max-w-lg">
                    </div>
                </div>
            </div>
        `;
    });
    
    // Slider navigasyon düğmelerini ekle
    sliderHTML += `
            </div>
            <!-- Slider Navigation -->
            <button class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-white rounded-full text-secondary transition shadow-lg" id="heroPrevBtn">
                <i class="ri-arrow-left-s-line ri-2x"></i>
            </button>
            <button class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-white rounded-full text-secondary transition shadow-lg" id="heroNextBtn">
                <i class="ri-arrow-right-s-line ri-2x"></i>
            </button>
            <!-- Slider Indicators -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" id="heroIndicators">
    `;
    
    // Her slide için gösterge ekle
    for (let i = 0; i < sliderBanners.length; i++) {
        sliderHTML += `
            <button class="w-2 h-2 rounded-full bg-secondary/30 transition" data-slide="${i}"></button>
        `;
    }
    
    sliderHTML += `
            </div>
        </div>
    `;
    
    // HTML'i konteyner'a ekle
    container.innerHTML = sliderHTML;
    
    // Slider fonksiyonlarını başlat
    setupHeroSlider();
    
    // Banner tıklama olaylarını ekle
    setupBannerClickEvents();
}

// Promosyon bannerları görünümü
function displayPromoBanners(banners, container) {
    // Promosyon banner HTML yapısını oluştur
    container.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6', 'my-8');
    
    // Her banner için kart oluştur
    banners.forEach(banner => {
        const bannerDiv = document.createElement('div');
        bannerDiv.className = 'banner-item bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
        bannerDiv.dataset.bannerId = banner.id;
        
        bannerDiv.innerHTML = `
            <a href="${banner.link_url || '#'}" class="block banner-link" data-banner-id="${banner.id}">
                <img src="${banner.image_url}" alt="${banner.title}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-secondary">${banner.title}</h3>
                    <p class="text-sm text-gray-600 mt-2">${banner.description}</p>
                </div>
            </a>
        `;
        
        container.appendChild(bannerDiv);
    });
    
    // Banner tıklama olaylarını ekle
    setupBannerClickEvents();
}

// Standart banner görünümü
function displayStandardBanners(banners, container) {
    // Standart banner HTML yapısını oluştur
    banners.forEach(banner => {
        const bannerDiv = document.createElement('div');
        bannerDiv.className = 'banner-item bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow my-4';
        bannerDiv.dataset.bannerId = banner.id;
        
        bannerDiv.innerHTML = `
            <a href="${banner.link_url || '#'}" class="block banner-link" data-banner-id="${banner.id}">
                <img src="${banner.image_url}" alt="${banner.title}" class="w-full h-auto object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-secondary">${banner.title}</h3>
                    <p class="text-sm text-gray-600 mt-2">${banner.description}</p>
                </div>
            </a>
        `;
        
        container.appendChild(bannerDiv);
    });
    
    // Banner tıklama olaylarını ekle
    setupBannerClickEvents();
}

// Hero slider fonksiyonları
function setupHeroSlider() {
    const slider = document.getElementById('heroSlider');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    const indicators = document.querySelectorAll('#heroIndicators button');
    
    if (!slider || !prevBtn || !nextBtn || indicators.length === 0) return;
    
    let currentSlide = 0;
    const slideCount = indicators.length;
    
    // İlk göstergeyi aktif yap
    indicators[0].classList.add('w-4', 'bg-secondary');
    
    // Önceki slide'a git
    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSlider();
    });
    
    // Sonraki slide'a git
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlider();
    });
    
    // Gösterge tıklamaları
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateSlider();
        });
    });
    
    // Slider'ı güncelle
    function updateSlider() {
        // Slide'ı kaydır
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Göstergeleri güncelle
        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('w-4', 'bg-secondary');
            } else {
                indicator.classList.remove('w-4', 'bg-secondary');
            }
        });
    }
    
    // Otomatik slider
    let interval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlider();
    }, 5000);
    
    // Fare üzerine geldiğinde otomatik slider'ı durdur
    slider.addEventListener('mouseenter', () => {
        clearInterval(interval);
    });
    
    // Fare ayrıldığında otomatik slider'ı başlat
    slider.addEventListener('mouseleave', () => {
        interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slideCount;
            updateSlider();
        }, 5000);
    });
}

// Banner tıklama olaylarını ekle
function setupBannerClickEvents() {
    const bannerLinks = document.querySelectorAll('.banner-link');
    
    bannerLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            const bannerId = link.dataset.bannerId;
            if (!bannerId) return;
            
            // Banner tıklama istatistiğini güncelle
            try {
                const { data, error } = await supabaseClient
                    .rpc('increment_banner_clicks', { banner_id: bannerId });
                    
                if (error) throw error;
            } catch (error) {
                console.error('Banner tıklama istatistiği güncellenirken hata:', error);
            }
        });
    });
}

// Banner görüntüleme istatistiklerini güncelle
async function updateBannerViewStats(banners) {
    try {
        // Her banner için görüntüleme sayısını artır
        for (const banner of banners) {
            const { data, error } = await supabaseClient
                .rpc('increment_banner_views', { banner_id: banner.id });
                
            if (error) throw error;
        }
    } catch (error) {
        console.error('Banner görüntüleme istatistikleri güncellenirken hata:', error);
    }
}

// Sayfa türünü belirle
function getPageType() {
    const path = window.location.pathname;
    
    if (path.includes('anasayfa') || path === '/' || path.endsWith('/')) {
        return 'homepage';
    } else if (path.includes('kitaplar')) {
        return 'books';
    } else if (path.includes('yazarlar')) {
        return 'authors';
    } else {
        return 'other';
    }
} 