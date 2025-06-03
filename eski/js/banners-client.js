// Banners Client JS - Kritik Yayınları
// Bu dosya, web sitesinin ön yüzünde banner görüntüleme ve işlemleri için kullanılır

// Sayfa bannerlarını yükler
async function loadPageBanners(pageType) {
    try {
        // Banner container elementini kontrol et
        const bannerContainer = document.getElementById('banner-container');
        if (!bannerContainer) {
            console.warn('Banner container bulunamadı!');
            return;
        }
        
        // Yükleniyor animasyonu
        bannerContainer.innerHTML = `
            <div class="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        `;
        
        // Eğer Supabase bağlantısı yoksa hata göster
        if (!window.supabaseClient) {
            console.error('Supabase bağlantısı bulunamadı!');
            bannerContainer.innerHTML = `
                <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <strong class="font-bold">Uyarı!</strong>
                    <span class="block sm:inline"> Veritabanı bağlantısı kurulamadığı için bannerlar gösterilemiyor.</span>
                </div>
            `;
            return;
        }
        
        // Aktif bannerları getir (sayfaya ve tarihe göre filtrelenmiş)
        try {
            // Önce banners tablosunun mevcut olup olmadığını kontrol et
            const { error: tableCheckError } = await window.supabaseClient
                .from('banners')
                .select('count')
                .limit(1);
                
            if (tableCheckError) {
                console.error('Banner tablosu kontrol hatası:', tableCheckError);
                
                // Tablo yoksa veya erişilemiyorsa banner containerı temizle
                bannerContainer.innerHTML = '';
                return;
            }
            
            // Basitleştirilmiş sorgu - Sadece aktif ve sayfa türüne göre bannerları getir
            console.log('Banner sorgusu yapılıyor:', { pageType, locations: [pageType, 'all'] });
            
            const { data: banners, error } = await window.supabaseClient
                .from('banners')
                .select('*')
                .eq('status', 'active')
                .in('location', [pageType, 'all'])
                .order('created_at', { ascending: false });
                
            console.log('Banner sorgu sonucu:', { banners, error });
                
            if (error) {
                throw new Error(`Bannerlar yüklenirken veritabanı hatası: ${error.message}`);
            }
            
            // Eğer banner yoksa container'ı fallback halinde bırak
            if (!banners || banners.length === 0) {
                console.log('Bu sayfa için banner bulunamadı:', pageType);
                // Container'ı temizle
                bannerContainer.innerHTML = '';
                return;
            }
            
            console.log('Bannerlar yüklendi:', banners);
            
            // Banner'ları göster
            displayBanners(banners, bannerContainer);
        } catch (dbError) {
            console.error('Veritabanı sorgusu hatası:', dbError);
            bannerContainer.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong class="font-bold">Hata!</strong>
                    <span class="block sm:inline"> Bannerlar yüklenirken bir sorun oluştu: ${dbError.message}</span>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Banner yükleme hatası (genel):', error.message, error.stack);
        const bannerContainer = document.getElementById('banner-container');
        if (bannerContainer) {
            // Kullanıcıya gösterilen hata mesajını daha kullanıcı dostu hale getirelim
            // Hata mesajı göstermek yerine banner alanını temizleyelim
            bannerContainer.innerHTML = '';
            
            console.log('Banner yükleme hatası kullanıcıya gösterilmedi, UI temiz kaldı');
        }
    }
}

// Bannerları görüntüle
function displayBanners(banners, container) {
    // Fallback banner'ı temizle
    container.classList.remove('bg-gradient-to-r', 'from-primary/10', 'to-secondary/10', 'flex', 'items-center', 'justify-center');
    
    // Birden fazla banner varsa slider oluştur
    if (banners.length > 1) {
        // Slider HTML yapısı
        container.innerHTML = `
            <div class="relative banner-slider h-[400px]">
                <div class="overflow-hidden h-[400px]">
                    <div class="banner-slider-track flex h-[400px] transition-transform duration-500">
                        ${banners.map(banner => createBannerSlide(banner)).join('')}
                    </div>
                </div>
                <button class="banner-prev absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center focus:outline-none z-10">
                    <i class="ri-arrow-left-s-line text-xl"></i>
                </button>
                <button class="banner-next absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center focus:outline-none z-10">
                    <i class="ri-arrow-right-s-line text-xl"></i>
                </button>
                <div class="banner-dots absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    ${banners.map((_, index) => `
                        <button class="banner-dot w-3 h-3 rounded-full bg-white/50 hover:bg-white focus:outline-none ${index === 0 ? 'active bg-white' : ''}"></button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Slider işlevselliğini ekle
        initializeSlider(banners.length);
    } else {
        // Tek banner ise direk göster
        container.innerHTML = createBannerSlide(banners[0]);
    }
    
    // Banner tıklamalarını kaydet
    attachBannerClickEvents(banners);
}

// Banner slide HTML'i oluştur
function createBannerSlide(banner) {
    // Banner görüntüsünün formatı ve doğru ölçeklendirme için ImageScaler kontrol et
    const optimizedImageUrl = window.ImageScaler && banner.image_url ? 
        banner.image_url : banner.image_url;
    
    return `
        <div class="banner-slide w-full h-[400px] flex-shrink-0" data-id="${banner.id}">
            <a href="${banner.link || '#'}" class="block relative w-full h-[400px]">
                <img src="${optimizedImageUrl}" alt="${banner.title}" class="banner-image">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
                    <h3 class="text-white text-lg sm:text-xl md:text-2xl font-bold">${banner.title}</h3>
                    ${banner.subtitle ? `<h4 class="text-white/90 text-base sm:text-lg mt-1">${banner.subtitle}</h4>` : ''}
                    ${banner.description ? `<p class="text-white/80 text-sm sm:text-base mt-1 line-clamp-2">${banner.description}</p>` : ''}
                </div>
            </a>
        </div>
    `;
}

// Slider işlevselliğini başlat
function initializeSlider(slideCount) {
    const track = document.querySelector('.banner-slider-track');
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    const prevButton = document.querySelector('.banner-prev');
    const nextButton = document.querySelector('.banner-next');
    
    if (!track || !slides.length) return;
    
    let currentIndex = 0;
    let autoplayInterval;
    
    // Slide'ı değiştir
    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Aktif noktayı güncelle
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
            dot.classList.toggle('bg-white', idx === currentIndex);
            dot.classList.toggle('bg-white/50', idx !== currentIndex);
        });
    }
    
    // Otomatik oynatma
    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000); // 5 saniyede bir değiştir
    }
    
    // Otomatik oynatmayı durdur
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }
    
    // Event listener'lar
    prevButton?.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        startAutoplay(); // Tıklamadan sonra yeniden başlat
    });
    
    nextButton?.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        startAutoplay(); // Tıklamadan sonra yeniden başlat
    });
    
    // Noktalara tıklamayı ekle
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            goToSlide(idx);
            startAutoplay(); // Tıklamadan sonra yeniden başlat
        });
    });
    
    // Fare üzerine gelince otomatik oynatmayı durdur
    const slider = document.querySelector('.banner-slider');
    slider?.addEventListener('mouseenter', stopAutoplay);
    slider?.addEventListener('mouseleave', startAutoplay);
    
    // Touch sürükle desteği
    let startX;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoplay();
    }, { passive: true });
    
    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        
        // Sürükleme animasyonunu devre dışı bırak
        track.style.transition = 'none';
        
        // Sürükleme miktarını hesapla (slide genişliğinin %30'undan fazla olmasını engelle)
        const slideWidth = slides[0].offsetWidth;
        const maxDrag = slideWidth * 0.3;
        const dragAmount = Math.max(Math.min(diff, maxDrag), -maxDrag);
        
        // Mevcut slide pozisyonunu güncelle
        track.style.transform = `translateX(calc(-${currentIndex * 100}% - ${dragAmount}px))`;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const currentX = e.changedTouches[0].clientX;
        const diff = startX - currentX;
        
        // Animasyonu geri aç
        track.style.transition = 'transform 500ms';
        
        // Eğer yeterli miktarda sürüklendiyse slide değiştir
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex - 1);
            }
        } else {
            // Yeterince sürüklenmemişse mevcut slide'a geri dön
            goToSlide(currentIndex);
        }
        
        startAutoplay();
    }, { passive: true });
    
    // Otomatik oynatmayı başlat
    startAutoplay();
}

// Banner tıklamalarını kaydet
function attachBannerClickEvents(banners) {
    // Supabase bağlantısını kontrol et
    if (!window.supabaseClient) {
        console.warn('Supabase bağlantısı olmadığı için banner tıklama olayları kaydedilmeyecek');
        return;
    }
    
    document.querySelectorAll('.banner-slide').forEach(slide => {
        const bannerId = slide.dataset.id;
        const banner = banners.find(b => b.id == bannerId);
        
        if (banner && banner.link) {
            slide.querySelector('a').addEventListener('click', async (e) => {
                // Tıklamayı kaydet
                try {
                    await window.supabaseClient
                        .from('banners')
                        .update({ click_count: (banner.click_count || 0) + 1 })
                        .eq('id', bannerId);
                } catch (error) {
                    console.error('Banner tıklaması kaydedilirken hata:', error);
                }
            });
        }
    });
}

// Ana sayfa için banner yükleme
document.addEventListener('DOMContentLoaded', function() {
    // Sayfanın tipini belirle
    let pageType = 'homepage'; // Varsayılan olarak ana sayfa
    
    // URL'e bakarak sayfa tipini belirle
    const path = window.location.pathname;
    if (path.includes('kitaplar.html') || path.includes('kitap-detay.html')) {
        pageType = 'books';
    } else if (path.includes('yazarlar.html') || path.includes('yazar-detay.html')) {
        pageType = 'authors';
    }
    
    // Ana banner container için bannerları yükle
    loadPageBanners(pageType);
}); 