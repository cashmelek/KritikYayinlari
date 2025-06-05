// Banners Client JS - Kritik Yayınları
// Bu dosya, web sitesinin ön yüzünde banner görüntüleme ve işlemleri için kullanılır

// Sayfa bannerlarını yükler
async function loadPageBanners() {
    try {
        // Banner container elementini kontrol et
        const bannerContainer = document.getElementById('banner-container');
        if (!bannerContainer) {
            console.warn('Banner container bulunamadı!');
            return;
        }
        
        // Yükleniyor animasyonu
        bannerContainer.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p class="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        `;
        
        // Eğer Supabase bağlantısı yoksa hata göster
        if (!window.supabaseClient) {
            console.error('Supabase bağlantısı bulunamadı!');
            bannerContainer.innerHTML = '';
            return;
        }
        
        // Aktif bannerları getir
        try {
            console.log('Banner sorgusu yapılıyor, aktif bannerlar getiriliyor');
            
            const { data: banners, error } = await window.supabaseClient
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .order('order_number', { ascending: true });
                
            console.log('Banner sorgu sonucu:', { banners, error });
                
            if (error) {
                throw new Error(`Bannerlar yüklenirken veritabanı hatası: ${error.message}`);
            }
            
            // Eğer banner yoksa container'ı temizle
            if (!banners || banners.length === 0) {
                console.log('Hiç aktif banner bulunamadı');
                bannerContainer.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                        <div class="text-center">
                            <p class="text-gray-500">Henüz banner eklenmemiş</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            console.log('Bannerlar yüklendi:', banners);
            
            // Banner'ları göster
            displayBanners(banners, bannerContainer);
        } catch (dbError) {
            console.error('Veritabanı sorgusu hatası:', dbError);
            // Hata durumunda banner alanını temizle
            bannerContainer.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Banner yükleme hatası (genel):', error.message, error.stack);
        const bannerContainer = document.getElementById('banner-container');
        if (bannerContainer) {
            bannerContainer.innerHTML = '';
            console.log('Banner yükleme hatası, UI temiz kaldı');
        }
    }
}

// Bannerları görüntüle
function displayBanners(banners, container) {
    // Fallback banner'ı temizle
    container.classList.remove('bg-gradient-to-r', 'from-primary/10', 'to-secondary/10', 'flex', 'items-center', 'justify-center');
    
    // Birden fazla banner varsa slider oluştur
    if (banners.length > 1) {
        // Slider HTML yapısı - mobil için responsive tasarım
        container.innerHTML = `
            <div class="relative banner-slider h-[300px] md:h-[400px]">
                <div class="overflow-hidden h-full">
                    <div class="banner-slider-track flex h-full transition-transform duration-500">
                        ${banners.map(banner => createBannerSlide(banner)).join('')}
                    </div>
                </div>
                <button class="banner-prev absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center focus:outline-none z-10">
                    <i class="ri-arrow-left-s-line text-lg md:text-xl"></i>
                </button>
                <button class="banner-next absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center focus:outline-none z-10">
                    <i class="ri-arrow-right-s-line text-lg md:text-xl"></i>
                </button>
                <div class="banner-dots absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    ${banners.map((_, index) => `
                        <button class="banner-dot w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/50 hover:bg-white focus:outline-none ${index === 0 ? 'active bg-white' : ''}"></button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Slider işlevselliğini ekle
        initializeSlider(banners.length);
    } else if (banners.length === 1) {
        // Tek banner varsa direk göster
        container.innerHTML = createBannerSlide(banners[0]);
    } else {
        // Banner yoksa container'ı boşalt
        container.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                    <p class="text-gray-500">Henüz banner eklenmemiş</p>
                </div>
            </div>
        `;
    }
    
    // Banner tıklamalarını kaydet
    attachBannerClickEvents(banners);
}

// Banner slide HTML'i oluştur
function createBannerSlide(banner) {
    // Doğru banner resmini al
    const imageUrl = banner.image_url || '';
    
    // Özel banner hedefi kontrolü
    let bannerLink = banner.link || '#';
    let buttonText = '';
    let additionalInfo = '';
    
    // Hedef türüne göre link ve buton metni oluştur
    if (banner.target_type === 'yazar' && banner.target_id) {
        bannerLink = `yazarlar.html?yazar_id=${banner.target_id}`;
        buttonText = `<button class="mt-3 px-3 py-1.5 text-sm md:text-base bg-primary text-white rounded-md hover:bg-yellow-600 transition-colors">Yazarın Sayfasına Git</button>`;
    } else if (banner.target_type === 'yazar_kitaplari' && banner.target_id) {
        bannerLink = `kitaplar.html?yazar_id=${banner.target_id}&filter_type=yazar_kitaplari`;
        // Buton yerine gösterge
        additionalInfo = `
            <div class="inline-flex items-center text-white mt-3 group">
                <span class="text-white/90 text-sm md:text-base">Yazarın kitaplarını keşfedin</span>
                <span class="ml-2 group-hover:ml-3 transition-all duration-300">
                    <i class="ri-arrow-right-line"></i>
                </span>
            </div>
        `;
    }
    
    // Banner'a tıklandığında olay oluştur
    const slideHtml = `
        <div class="splide__slide banner-slide w-full flex-shrink-0" data-banner-id="${banner.id}" data-target-type="${banner.target_type || ''}" data-target-id="${banner.target_id || ''}">
            <a href="${bannerLink}" class="relative block w-full h-full group">
                <img src="${imageUrl}" alt="${banner.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='images/placeholder.png'">
                <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-6 md:p-10">
                    <h3 class="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">${banner.title}</h3>
                    <p class="text-white/90 text-base md:text-lg font-medium mb-1 md:mb-2">${banner.subtitle || ''}</p>
                    <p class="text-white/80 max-w-md mb-2 md:mb-4 text-sm md:text-base hidden md:block">${banner.description || ''}</p>
                    ${buttonText}
                    ${additionalInfo}
                </div>
            </a>
        </div>
    `;
    
    return slideHtml;
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
    
    // Her slide için genişlik ayarla (tam ekran genişliği)
    slides.forEach(slide => {
        slide.style.width = '100%';
        slide.style.flexShrink = '0';
    });
    
    // Slide'ı değiştir
    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        currentIndex = index;
        const translateValue = index * 100;
        track.style.transform = `translateX(-${translateValue}%)`;
        
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
    
    // İlk slide'a git ve otomatik oynatmayı başlat
    goToSlide(0);
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
        const bannerId = slide.dataset.bannerId;
        if (!bannerId) return;
        
        const banner = banners.find(b => b.id == bannerId);
        
        if (banner) {
            const linkElement = slide.querySelector('a');
            if (linkElement) {
                linkElement.addEventListener('click', async (e) => {
                // Tıklamayı kaydet
                    try {
                        console.log(`Banner tıklandı: ${banner.id}, başlık: ${banner.title}`);
                        
                        // Özel bir olay oluştur
                        const bannerClickEvent = new CustomEvent('bannerClick', { 
                            detail: {
                                id: banner.id,
                                title: banner.title,
                                target_type: banner.target_type,
                                target_id: banner.target_id
                            }
                        });
                        document.dispatchEvent(bannerClickEvent);
                        
                        // Tıklama sayısını güncelle - Supabase fonksiyonu kullanarak
                        await window.supabaseClient.rpc('increment_banner_click', {
                            banner_id: parseInt(bannerId)
                        });
                    } catch (error) {
                        console.error('Banner tıklaması kaydedilirken hata:', error);
                        
                        // Fonksiyon çalışmazsa normal güncelleme yap
                try {
                    await window.supabaseClient
                        .from('banners')
                                .update({ 
                                    click_count: (banner.click_count || 0) + 1,
                                    last_clicked_at: new Date().toISOString()
                                })
                        .eq('id', bannerId);
                        } catch (updateError) {
                            console.error('Banner güncelleme hatası:', updateError);
                        }
                }
            });
            }
        }
    });
}

// Ana sayfa için banner yükleme
document.addEventListener('DOMContentLoaded', function() {
    // Banner container varsa banner yükleme işlemini başlat
    const bannerContainer = document.getElementById('banner-container');
    if (bannerContainer) {
        // Sayfa ayrımı yapmadan tüm bannerları yükle
        loadPageBanners();
    }
}); 