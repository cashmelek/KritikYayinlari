// Yerel veri dosyaları
const BOOKS_JSON = 'data/books.json';
const AUTHORS_JSON = 'data/authors.json';
const BANNERS_JSON = 'data/banners.json';

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

// Veri yükleme fonksiyonları
async function fetchBooks() {
    try {
        const response = await fetch(BOOKS_JSON);
        if (!response.ok) throw new Error('Kitaplar yüklenirken bir hata oluştu');
        return await response.json();
    } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
        // Yerel örnek veri
        return [
            {
                id: 1,
                title: 'Beyoğlu Rapsodisi',
                author: 'Ahmet Ümit',
                authorId: 1,
                cover: 'site_resimleri/1.png',
                description: 'İstanbul\'un kalbinin attığı Beyoğlu\'nda geçen sürükleyici bir polisiye. Başkomser Nevzat\'ın çözdüğü gizemli bir cinayet vakasını konu alır.',
                price: '45,90 ₺',
                originalPrice: '55,90 ₺',
                discount: 18,
                category: 'Polisiye',
                year: 2003,
                pages: 480,
                publisher: 'Kritik Yayınları',
                language: 'Türkçe',
                isbn: '9789752895584',
                rating: 4.5,
                reviewCount: 124,
                isNew: true,
                isBestseller: true,
                stock: 150,
                excerpt: 'Komiser Nevzat, bu kez de Beyoğlu\'nun arka sokaklarında işlenen gizemli bir cinayetin peşine düşüyor...'
            },
            {
                id: 2,
                title: 'İstanbul Hatırası',
                author: 'Ahmet Ümit',
                authorId: 1,
                cover: 'site_resimleri/1.png',
                description: 'İstanbul\'un tarihi mekanlarında geçen, gizem dolu bir cinayet romanı.',
                price: '42,50 ₺',
                originalPrice: '52,50 ₺',
                discount: 19,
                category: 'Polisiye',
                year: 2010,
                pages: 520,
                publisher: 'Kritik Yayınları',
                language: 'Türkçe',
                isbn: '9789752895589',
                rating: 4.2,
                reviewCount: 89,
                isNew: false,
                isBestseller: true,
                stock: 75,
                excerpt: 'İstanbul\'un tarihi yarımadasında bulunan bir el yazması, arkeologlar ve tarihçiler arasında büyük heyecan yaratır...'
            },
            {
                id: 3,
                title: 'Kırlangıç Çığlığı',
                author: 'Ahmet Ümit',
                authorId: 1,
                cover: 'site_resimleri/1.png',
                description: 'Sıradışı bir cinayetin peşinde polisiyenin sınırlarını zorlayan bir roman.',
                price: '48,90 ₺',
                originalPrice: '58,90 ₺',
                discount: 17,
                category: 'Polisiye',
                year: 2023,
                pages: 512,
                publisher: 'Kritik Yayınları',
                language: 'Türkçe',
                isbn: '9789752123463',
                rating: 4.7,
                reviewCount: 156,
                isNew: true,
                isBestseller: true,
                stock: 200,
                excerpt: 'Bir kırlangıç sürüsünün gökyüzünde çizdiği şekiller, eski bir efsanenin izlerini taşımaktadır...'
            }
        ];
    }
}

async function fetchAuthors() {
    try {
        const response = await fetch(AUTHORS_JSON);
        if (!response.ok) throw new Error('Yazarlar yüklenirken bir hata oluştu');
        const data = await response.json();
        return data.authors || [];
    } catch (error) {
        console.error('Yazarlar yüklenirken hata:', error);
        // Yerel örnek veri
        return [
            {
                id: 1,
                name: 'Ahmet Ümit',
                bio: '1960 yılında Gaziantep\'te doğdu. 22 yıldır yazarlık yapmaktadır. Polisiye ve tarihi roman türlerinde eserler vermektedir.',
                image: 'https://i.pravatar.cc/150?img=1',
                books: [1, 2, 3]
            },
            {
                id: 2,
                name: 'Elif Şafak',
                bio: '1971 yılında Strazburg\'ta doğdu. Romanları kırktan fazla dile çevrilmiştir. Eserlerinde Doğu-Batı çatışması, kimlik, göç gibi temaları işler.',
                image: 'https://i.pravatar.cc/150?img=2',
                books: [7, 9]
            },
            {
                id: 3,
                name: 'Orhan Pamuk',
                bio: '1952 yılında İstanbul\'da doğdu. 2006 yılında Nobel Edebiyat Ödülü\'nü kazandı. Eserlerinde İstanbul\'un farklı yüzlerini yansıtır.',
                image: 'https://i.pravatar.cc/150?img=3',
                books: [5, 6]
            },
            {
                id: 4,
                name: 'Sabahattin Ali',
                bio: '1907 yılında Gümülcine\'de doğdu. Türk edebiyatının en önemli yazarlarından biridir. Eserlerinde toplumsal gerçekçiliği işlemiştir.',
                image: 'https://i.pravatar.cc/150?img=4',
                books: [4, 8]
            },
            {
                id: 5,
                name: 'Zülfü Livaneli',
                bio: '1946 yılında Konya\'da doğdu. Müzisyen, yazar ve yönetmen kimliğiyle tanınır. Eserlerinde Anadolu insanının yaşamını konu alır.',
                image: 'https://i.pravatar.cc/150?img=5',
                books: [10]
            }
        ];
    }
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
                <img src="${book.image}" alt="${book.title}" loading="lazy">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${book.author}</p>
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
                <img src="${author.image}" alt="${author.name}" loading="lazy">
                <h3>${author.name}</h3>
                <p class="bio">${author.bio.substring(0, 150)}...</p>
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

// Ana Slider İşlevleri
function initMainSlider() {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    
    const slides = document.querySelectorAll('.slider .slide');
    const indicators = document.querySelectorAll('.slider .indicator');
    const prevBtn = document.querySelector('.slider .slider-nav.prev');
    const nextBtn = document.querySelector('.slider .slider-nav.next');
    let currentSlide = 0;
    let slideInterval;

    // Slider'ı başlat
    function startSlider() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Sonraki slayta geç
    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }

    // Önceki slayta geç
    function prevSlide() {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }

    // Belirli bir slayta git
    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        currentSlide = n;
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }

    // Olay dinleyicilerini ekle
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            startSlider();
        });

        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            startSlider();
        });
    }

    // İndikatörlere tıklama olayını ekle
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(index);
            startSlider();
        });
    });

    // Fare slaytın üzerine geldiğinde otomatik geçişi durdur
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    slider.addEventListener('mouseleave', () => {
        startSlider();
    });

    // Slider'ı başlat
    startSlider();
}

// Kart Slider'ı için genel fonksiyon
function initCardSlider(containerClass, prevBtnClass, nextBtnClass, indicatorsClass, cardsPerView = 4) {
    const container = document.querySelector(`.${containerClass}`);
    if (!container) return;

    const wrapper = container.querySelector('.slider-wrapper');
    const prevBtn = container.querySelector(`.${prevBtnClass}`);
    const nextBtn = container.querySelector(`.${nextBtnClass}`);
    const indicators = container.querySelectorAll(`.${indicatorsClass} .indicator`);
    
    const cards = wrapper.children;
    const totalCards = cards.length;
    let currentIndex = 0;
    let slideInterval;

    // Slider'ı başlat
    function startSlider() {
        if (totalCards <= cardsPerView) return; // Eğer görüntülenecek kadar kart yoksa başlatma
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Sonraki slayta geç
    function nextSlide() {
        if (currentIndex < totalCards - cardsPerView) {
            currentIndex++;
            updateSlider();
        } else {
            // Son slayta ulaşıldıysa başa dön
            currentIndex = 0;
            updateSlider();
        }
    }

    // Önceki slayta geç
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        } else {
            // İlk slayttaysa sona git
            currentIndex = Math.max(0, totalCards - cardsPerView);
            updateSlider();
        }
    }

    // Belirli bir slayta git
    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
    }

    // Slider'ı güncelle
    function updateSlider() {
        const cardWidth = cards[0].offsetWidth + 20; // Kart genişliği + gap
        wrapper.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        
        // İndikatörleri güncelle
        updateIndicators();
    }

    // İndikatörleri güncelle
    function updateIndicators() {
        const totalSlides = Math.ceil(totalCards / cardsPerView);
        const currentSlide = Math.floor(currentIndex / cardsPerView);
        
        indicators.forEach((indicator, index) => {
            if (index < totalSlides) {
                indicator.style.display = 'block';
                if (index === currentSlide) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            } else {
                indicator.style.display = 'none';
            }
        });
    }

    // Olay dinleyicilerini ekle
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            startSlider();
        });

        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            startSlider();
        });
    }

    // İndikatörlere tıklama olayını ekle
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(index * cardsPerView);
            startSlider();
        });
    });

    // Slider'ı başlat
    startSlider();
    
    // Pencere boyutu değiştiğinde slider'ı güncelle
    window.addEventListener('resize', () => {
        updateSlider();
    });
}

// Kitapları yükle ve grid olarak göster
async function loadBooksAndInitSlider() {
    const books = await fetchBooks();
    const booksGrid = document.querySelector('.books-grid');
    
    if (!booksGrid) return;
    
    if (books && books.length > 0) {
        booksGrid.innerHTML = books.map(book => `
            <div class="book-card">
                <img src="${book.image || 'images/placeholder-book.jpg'}" 
                     alt="${book.title}" 
                     loading="lazy"
                     onerror="this.src='images/placeholder-book.jpg'">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${book.author || 'Yazar Bilgisi Yok'}</p>
                    <button class="btn" data-book-id="${book.id}">İncele</button>
                </div>
            </div>
        `).join('');
        
        // Kitap detay butonlarına tıklama olayı ekle
        document.querySelectorAll('.book-card .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookId = e.target.getAttribute('data-book-id');
                showBookDetails(bookId);
            });
        });
    } else {
        booksGrid.innerHTML = '<p class="no-books">Henüz kitap bulunmamaktadır.</p>';
    }
}

// Yazarları yükle ve slider'ı başlat
async function loadAuthorsAndInitSlider() {
    const authors = await fetchAuthors();
    if (authors && authors.length > 0) {
        const authorGrid = document.querySelector('.author-slider .slider-wrapper');
        if (authorGrid) {
            authorGrid.innerHTML = authors.map(author => `
                <div class="author-card">
                    <img src="${author.image}" alt="${author.name}" loading="lazy">
                    <h3>${author.name}</h3>
                    <p class="bio">${author.bio}</p>
                    <button class="btn" data-author-id="${author.id}">Kitapları Gör</button>
                </div>
            `).join('');
            
            // Yazar detay butonlarına tıklama olayı ekle
            document.querySelectorAll('.author-card .btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const authorId = e.target.getAttribute('data-author-id');
                    showAuthorBooks(authorId);
                });
            });
            
            // Yazar slider'ını başlat
            initCardSlider('author-slider', 'author-prev', 'author-next', 'author-indicators');
        }
    }
}

// Kitapları yükleme işlemi
async function loadBooks() {
    try {
        const response = await fetch('data/books.json');
        if (!response.ok) {
            throw new Error('Kitaplar yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        // Eğer dizi içinde dizi varsa, ilk diziyi döndür
        return Array.isArray(data[0]) ? data[0] : data;
    } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
        return [];
    }
}

// Kitap kartı oluşturma
function createBookCard(book) {
    if (!book) return '';
    
    return `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover">
                <img src="${book.cover}" alt="${book.title}" loading="lazy">
                <a href="kitap-detay.html?id=${book.id}" class="book-overlay">
                    <span>Detaylı Bilgi</span>
                </a>
            </div>
            <div class="book-details">
                <h3 class="book-title">${book.title || 'İsimsiz Kitap'}</h3>
                <p class="book-author">${book.author || 'Bilinmeyen Yazar'}</p>
                ${book.excerpt ? `<p class="book-excerpt">${book.excerpt}</p>` : ''}
                <div class="book-meta">
                <a href="kitap-detay.html?id=${book.id}" class="btn btn-block">İncele</a>
            </div>
        </div>
    `;
}

// Kitapları yükle ve göster
async function loadAndDisplayBooks(containerId, filterFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
        // Yükleniyor durumunu göster
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Kitaplar yükleniyor...</p>
            </div>`;
        
        const books = await loadBooks();
        if (!books || books.length === 0) {
            throw new Error('Hiç kitap bulunamadı');
        }
        
        const filteredBooks = filterFn ? books.filter(filterFn) : books;
        
        if (filteredBooks.length === 0) {
            container.innerHTML = `
                <div class="no-books">
                    <i class="fas fa-book-open"></i>
                    <p>Gösterilecek kitap bulunamadı</p>
                </div>`;
            return;
        }
        
        // Kitapları ekrana ekle
        container.innerHTML = '';
        filteredBooks.slice(0, 8).forEach(book => {
            container.insertAdjacentHTML('beforeend', createBookCard(book));
        });
        
        // Slider'ı başlat (eğer slider ise)
        if (container.classList.contains('book-slider')) {
            initBookSlider(container);
        }
    } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Kitaplar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</p>
                <button class="btn btn-retry" onclick="window.location.reload()">
                    <i class="fas fa-sync-alt"></i> Tekrar Dene
                </button>
            </div>`;
    }
}

// Slider başlatma
function initBookSlider(container) {
    if (typeof tns !== 'undefined') {
        tns({
            container: container,
            items: 1,
            slideBy: 1,
            autoplay: false,
            controls: false,
            nav: false,
            responsive: {
                576: { items: 2 },
                768: { items: 3 },
                992: { items: 4 },
                1200: { items: 5 }
            }
        });
    }
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', function() {
    // Ana slider'ı başlat
    initSlider();
    
    // Kitapları yükle
    loadAndDisplayBooks('newBooksGrid', book => book.isNew);
    loadAndDisplayBooks('bestsellersGrid', book => book.isBestseller);
    
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
    
    // Alt menüleri açıp kapatmak için
    const menuItems = document.querySelectorAll('.main-nav > ul > li > a');
    menuItems.forEach(item => {
        const parentLi = item.parentElement;
        if (parentLi.querySelector('.sub-menu')) {
            item.addEventListener('click', function(e) {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    const subMenu = this.nextElementSibling;
                    if (subMenu && subMenu.classList.contains('sub-menu')) {
                        subMenu.classList.toggle('active');
                    }
                }
            });
        }
    });
    
    // Mobil arama butonu
    const mobileSearchToggle = document.querySelector('.mobile-search-toggle');
    const headerSearch = document.querySelector('.header-search');
    
    if (mobileSearchToggle && headerSearch) {
        mobileSearchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            headerSearch.classList.toggle('active');
            
            // Arama kutusuna odaklan
            if (headerSearch.classList.contains('active')) {
                const searchInput = headerSearch.querySelector('input[type="text"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
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
                });
                
                // Mobil menüyü kapat
                if (navMenu) {
                    navMenu.classList.remove('show');
                }
            }
        });
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

// Görseller yüklendikten sonra çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
    // Banner sistemini yükle
    loadBanners();
    
    // Slider için otomatik geçiş ayarla
    setupSlider();
    
    window.addEventListener('load', function() {
        // Görsellerin yumuşak yüklenmesi
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.complete) {
                img.style.opacity = 1;
            } else {
                img.style.opacity = 0;
                img.style.transition = 'opacity 0.5s ease';
                img.addEventListener('load', function() {
                    this.style.opacity = 1;
                });
            }
        });
    });
});

// Banner yükleme fonksiyonu
async function loadBanners() {
    if (!bannerSlider) return;
    
    try {
        // Admin panelinden eklenen banner'ları JSON dosyasından yükle
        const response = await fetch(BANNERS_JSON);
        if (!response.ok) {
            console.warn('Banner verileri yüklenemedi, varsayılan banner\'lar kullanılıyor.');
            return; // Varsayılan banner'lar zaten HTML'de var
        }
        
        const banners = await response.json();
        if (!banners || banners.length === 0) return;
        
        // Aktif banner'ları filtrele
        const activeBanners = banners.filter(banner => banner.status === 'active');
        if (activeBanners.length === 0) return;
        
        // Banner'ları sırala (pozisyona göre)
        activeBanners.sort((a, b) => a.position - b.position);
        
        // HTML oluştur
        bannerSlider.innerHTML = activeBanners.map((banner, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}">
                <div class="slide-bg">
                    <img src="${banner.imagePath}" alt="${banner.title}">
                </div>
                <div class="container">
                    <div class="slide-content">
                        <h2>${banner.title}</h2>
                        <p>${banner.description || ''}}</p>
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