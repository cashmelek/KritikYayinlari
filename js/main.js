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
            .eq('active', true)
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
                <img src="${book.image_url || book.cover || 'images/placeholder-book.jpg'}" alt="${book.title}" loading="lazy">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${book.authors ? book.authors.name : book.author || 'Bilinmeyen Yazar'}</p>
                    <button class="btn view-details" data-book-id="${book.id}">İncele</button>
                </div>
            </div>
        `).join('');
        
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
                <img src="${author.image_url || author.image || 'https://i.pravatar.cc/150?img=' + author.id}" alt="${author.name}" loading="lazy">
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
                        <p>${banner.subtitle || banner.description || ''}</p>
                        ${banner.link_url ? `<a href="${banner.link_url}" class="btn btn-primary">Detaylar</a>` : ''}
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