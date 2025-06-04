// Supabase veri çekme fonksiyonları
async function fetchBooks() {
    try {
        console.log('Kitaplar Supabase\'den yükleniyor...');
        
        const { data, error } = await supabaseClient
            .from('books')
            .select(`
                *,
                authors (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Kitaplar yüklenirken Supabase hatası:', error);
            throw error;
        }
        
        console.log('Kitaplar başarıyla yüklendi:', data);
        return data || [];
    } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
        // Hata durumunda boş array döndür
        return [];
    }
}

async function fetchAuthors() {
    try {
        console.log('Yazarlar Supabase\'den yükleniyor...');
        
        const { data, error } = await supabaseClient
            .from('authors')
            .select('*')
            .order('name', { ascending: true });
            
        if (error) {
            console.error('Yazarlar yüklenirken Supabase hatası:', error);
            throw error;
        }
        
        console.log('Yazarlar başarıyla yüklendi:', data);
        return data || [];
    } catch (error) {
        console.error('Yazarlar yüklenirken hata:', error);
        // Hata durumunda boş array döndür
        return [];
    }
}

async function fetchBanners() {
    try {
        console.log('Banner\'lar Supabase\'den yükleniyor...');
        
        const { data, error } = await supabaseClient
            .from('banners')
            .select('*')
            .eq('is_active', true)
            .order('order_number', { ascending: true });
            
        if (error) {
            console.error('Banner\'lar yüklenirken Supabase hatası:', error);
            throw error;
        }
        
        console.log('Banner\'lar başarıyla yüklendi:', data);
        return data || [];
    } catch (error) {
        console.error('Banner\'lar yüklenirken hata:', error);
        // Hata durumunda boş array döndür
        return [];
    }
}

// DOM Elementleri
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navMenu = document.querySelector('nav ul');
const bookGrid = document.querySelector('.book-grid');
const authorGrid = document.querySelector('.author-grid');
const bannerSlider = document.getElementById('banner-slider');

// Mobil menü açıp kapatma
if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });
}

// Kitapları yükle
async function loadBooks() {
    if (!bookGrid) return;
    
    bookGrid.innerHTML = '<div class="loading">Kitaplar yükleniyor...</div>';
    
    try {
        const books = await fetchBooks();
        
        if (books.length === 0) {
            bookGrid.innerHTML = '<div class="no-data">Henüz kitap bulunmamaktadır.</div>';
            return;
        }
        
        bookGrid.innerHTML = books.map(book => `
            <div class="book-card" data-book-id="${book.id}">
                <div class="book-cover">
                    <img src="${book.cover_url || 'images/placeholder-book.jpg'}" 
                         alt="${book.title}" 
                         loading="lazy"
                         onerror="this.src='images/placeholder-book.jpg'; this.onerror=null;"
                         onload="this.style.opacity='1'; this.style.animation='fadeInImage 0.5s ease-in-out forwards';">
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${book.authors ? book.authors.name : 'Bilinmeyen Yazar'}</p>
                    <button class="btn view-details" data-book-id="${book.id}">İncele</button>
                </div>
            </div>
        `).join('');
        
        // Görsel yükleme optimizasyonlarını uygula
        optimizeBookImages();
        
        // Detay butonlarına tıklama olayı ekle
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookId = e.target.getAttribute('data-book-id');
                showBookDetails(bookId);
            });
        });
    } catch (error) {
        bookGrid.innerHTML = `<div class="error">Kitaplar yüklenirken bir hata oluştu: ${error.message}</div>`;
    }
}

// Yazarları yükle
async function loadAuthors() {
    if (!authorGrid) return;
    
    authorGrid.innerHTML = '<div class="loading">Yazarlar yükleniyor...</div>';
    
    try {
        const authors = await fetchAuthors();
        
        if (authors.length === 0) {
            authorGrid.innerHTML = '<div class="no-data">Henüz yazar bulunmamaktadır.</div>';
            return;
        }
        
        authorGrid.innerHTML = authors.map(author => `
            <div class="author-card" data-author-id="${author.id}">
                <img src="${author.photo_url || 'https://i.pravatar.cc/150?img=' + author.id}" alt="${author.name}" loading="lazy">
                <h3>${author.name}</h3>
                <p class="bio">${(author.bio || '').substring(0, 150)}...</p>
                <button class="btn view-author" data-author-id="${author.id}">Kitapları Gör</button>
            </div>
        `).join('');
        
        // Yazar detay butonlarına tıklama olayı ekle
        document.querySelectorAll('.view-author').forEach(button => {
            button.addEventListener('click', (e) => {
                const authorId = e.target.getAttribute('data-author-id');
                showAuthorBooks(authorId);
            });
        });
    } catch (error) {
        authorGrid.innerHTML = `<div class="error">Yazarlar yüklenirken bir hata oluştu: ${error.message}</div>`;
    }
}

// Banner yükleme fonksiyonu
async function loadBanners() {
    if (!bannerSlider) return;
    
    try {
        console.log('Banner\'lar yükleniyor...');
        const banners = await fetchBanners();
        
        if (!banners || banners.length === 0) {
            console.warn('Banner verileri bulunamadı, varsayılan banner\'lar kullanılıyor.');
            return; // Varsayılan banner'lar zaten HTML'de var
        }
        
        // HTML oluştur
        bannerSlider.innerHTML = banners.map((banner, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}">
                <div class="slide-bg">
                    <img src="${banner.image_url}" alt="${banner.title}">
                </div>
                <div class="container">
                    <div class="slide-content">
                        <h2>${banner.title}</h2>
                        <p>${banner.description || ''}</p>
                        ${banner.link ? `<a href="${banner.link}" class="btn btn-primary">Detaylar</a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Slider nokta göstergelerini güncelle
        updateSliderDots();
        
    } catch (error) {
        console.error('Banner yüklenirken hata oluştu:', error);
    }
}

// Kitap detaylarını göster
function showBookDetails(bookId) {
    // Burada kitap detay sayfasına yönlendirme yapılabilir
    // Veya bir modal açılabilir
    alert(`Kitap ID: ${bookId} detayları gösterilecek`);
}

// Yazarın kitaplarını göster
function showAuthorBooks(authorId) {
    // Burada yazarın kitaplarını listeleyen bir sayfaya yönlendirme yapılabilir
    // Veya bir modal açılabilir
    alert(`Yazar ID: ${authorId} kitapları listelenecek`);
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', function() {
    // Banner sistemini yükle
    loadBanners();
    
    // Kitapları ve yazarları yükle
    loadBooks();
    loadAuthors();
    
    // Slider için otomatik geçiş ayarla
    setupSlider();
    
    // Mobil menü butonuna tıklama olayı ekle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Dışarı tıklandığında menüyü kapat
    document.addEventListener('click', function(e) {
        // Mobil menüyü kapat
        if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-toggle')) {
            const mobileMenu = document.querySelector('.mobile-menu-toggle');
            const nav = document.querySelector('.main-nav');
            if (mobileMenu && nav) {
                mobileMenu.classList.remove('active');
                nav.classList.remove('active');
                
                // Mobil menüyü kapat
                if (navMenu) {
                    navMenu.classList.remove('show');
                }
            }
        }
    });
    
    // Sayfa kaydırıldığında header'ı şeffaflaştır
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                return;
            }
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Aşağı kaydırılıyorsa header'ı gizle
                header.style.transform = 'translateY(-100%)';
            } else {
                // Yukarı kaydırılıyorsa header'ı göster
                header.style.transform = 'translateY(0)';
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
            
            lastScroll = currentScroll;
        });
    }
});

// Slider ayarları
function setupSlider() {
    const slider = document.querySelector('.main-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const prevBtn = slider.querySelector('.slider-nav.prev');
    const nextBtn = slider.querySelector('.slider-nav.next');
    const dotsContainer = slider.querySelector('.slider-dots');
    
    if (slides.length <= 1) {
        // Tek slide varsa navigasyon butonlarını gizle
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        return;
    }
    
    // Slider nokta göstergelerini oluştur
    updateSliderDots();
    
    // İleri/geri butonlarına tıklama olayı ekle
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const activeSlide = slider.querySelector('.slide.active');
            const prevSlide = activeSlide.previousElementSibling || slides[slides.length - 1];
            
            activeSlide.classList.remove('active');
            prevSlide.classList.add('active');
            
            updateSliderDots();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const activeSlide = slider.querySelector('.slide.active');
            const nextSlide = activeSlide.nextElementSibling || slides[0];
            
            activeSlide.classList.remove('active');
            nextSlide.classList.add('active');
            
            updateSliderDots();
        });
    }
    
    // Otomatik geçiş için zamanlama ayarla
    let slideInterval = setInterval(() => {
        const activeSlide = slider.querySelector('.slide.active');
        const nextSlide = activeSlide.nextElementSibling || slides[0];
        
        activeSlide.classList.remove('active');
        nextSlide.classList.add('active');
        
        updateSliderDots();
    }, 5000); // 5 saniyede bir geçiş yap
    
    // Mouse üzerindeyken otomatik geçişi duraklat
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    slider.addEventListener('mouseleave', () => {
        slideInterval = setInterval(() => {
            const activeSlide = slider.querySelector('.slide.active');
            const nextSlide = activeSlide.nextElementSibling || slides[0];
            
            activeSlide.classList.remove('active');
            nextSlide.classList.add('active');
            
            updateSliderDots();
        }, 5000);
    });
}

// Slider nokta göstergelerini güncelle
function updateSliderDots() {
    const slider = document.querySelector('.main-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const dotsContainer = slider.querySelector('.slider-dots');
    
    if (!dotsContainer) return;
    
    // Nokta göstergelerini oluştur
    dotsContainer.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const dot = document.createElement('span');
        dot.classList.add('slider-dot');
        
        if (slide.classList.contains('active')) {
            dot.classList.add('active');
        }
        
        dot.addEventListener('click', () => {
            // Tüm slide'ların active sınıfını kaldır
            slides.forEach(s => s.classList.remove('active'));
            
            // Seçilen slide'a active sınıfı ekle
            slides[index].classList.add('active');
            
            // Nokta göstergelerini güncelle
            updateSliderDots();
        });
        
        dotsContainer.appendChild(dot);
    });
}

// Kitap görsellerini optimize et
function optimizeBookImages() {
    const bookImages = document.querySelectorAll('.book-card img');
    
    bookImages.forEach((img, index) => {
        // Lazy loading için Intersection Observer kullan
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        
                        // Görsel yükleme başladığında placeholder göster
                        if (!image.complete) {
                            showImagePlaceholder(image);
                        }
                        
                        // Görsel yüklendiğinde optimizasyonları uygula
                        image.addEventListener('load', function() {
                            hideImagePlaceholder(this);
                            applyImageOptimizations(this);
                        });
                        
                        // Hata durumunda placeholder göster
                        image.addEventListener('error', function() {
                            hideImagePlaceholder(this);
                            this.src = 'images/placeholder-book.jpg';
                        });
                        
                        observer.unobserve(image);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            imageObserver.observe(img);
        }
        
        // Progressive loading için küçük bir gecikme ekle
        setTimeout(() => {
            if (img.src && !img.complete) {
                showImagePlaceholder(img);
            }
        }, index * 100); // Her görsel için 100ms gecikme
    });
}

// Görsel placeholder göster
function showImagePlaceholder(img) {
    const bookCover = img.closest('.book-cover');
    if (!bookCover) return;
    
    // Placeholder zaten varsa çık
    if (bookCover.querySelector('.image-placeholder')) return;
    
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
        <div class="placeholder-content">
            <i class="ri-image-line"></i>
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    bookCover.appendChild(placeholder);
    img.style.opacity = '0';
}

// Görsel placeholder gizle
function hideImagePlaceholder(img) {
    const bookCover = img.closest('.book-cover');
    if (!bookCover) return;
    
    const placeholder = bookCover.querySelector('.image-placeholder');
    if (placeholder) {
        placeholder.style.opacity = '0';
        setTimeout(() => {
            if (placeholder.parentElement) {
                placeholder.parentElement.removeChild(placeholder);
            }
        }, 300);
    }
    
    img.style.opacity = '1';
}

// Görsel optimizasyonlarını uygula
function applyImageOptimizations(img) {
    // Görsel boyutlarını kontrol et ve optimize et
    if (img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const idealRatio = 3 / 4; // Kitap kapağı oranı
        
        // Oran uygun değilse object-position ayarla
        if (Math.abs(aspectRatio - idealRatio) > 0.1) {
            img.style.objectPosition = 'center top';
        }
        
        // Çok büyük görseller için uyarı (geliştirme aşamasında)
        if (img.naturalWidth > 1000 || img.naturalHeight > 1500) {
            console.warn(`Büyük görsel tespit edildi: ${img.src} (${img.naturalWidth}x${img.naturalHeight})`);
        }
    }
    
    // Görsel kalitesi filtreleri uygula
    img.style.filter = 'contrast(1.05) saturate(1.05)';
    
    // Hover efekti için hazırla
    img.addEventListener('mouseenter', function() {
        this.style.filter = 'contrast(1.1) saturate(1.1)';
    });
    
    img.addEventListener('mouseleave', function() {
        this.style.filter = 'contrast(1.05) saturate(1.05)';
    });
}