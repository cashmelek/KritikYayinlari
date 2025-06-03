// Yerel veri dosyaları
const BOOKS_JSON = 'data/books.json';
const AUTHORS_JSON = 'data/authors.json';

// DOM Elementleri
const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.main-nav ul');
const bookGrid = document.querySelector('.books-grid');
const authorGrid = document.querySelector('.authors-grid');

// Mobil menü açıp kapatma
if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        mobileMenuBtn.classList.toggle('active');
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

// Kitapları yükle ve göster
async function loadBooks(containerId = 'books-container', limit = 10) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
        const books = await fetchBooks();
        
        if (books && books.length > 0) {
            container.innerHTML = '';
            
            const booksToShow = books.slice(0, limit);
            
            booksToShow.forEach(book => {
                const bookCard = createBookCard(book);
                container.appendChild(bookCard);
            });
        } else {
            container.innerHTML = '<p class="text-center">Kitap bulunamadı.</p>';
        }
    } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
        container.innerHTML = '<p class="text-center text-danger">Kitaplar yüklenirken bir hata oluştu.</p>';
    }
}

// Yazarları yükle ve göster
async function loadAuthors(containerId = 'authors-container', limit = 5) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
        const authors = await fetchAuthors();
        
        if (authors && authors.length > 0) {
            container.innerHTML = '';
            
            const authorsToShow = authors.slice(0, limit);
            
            authorsToShow.forEach(author => {
                const authorCard = createAuthorCard(author);
                container.appendChild(authorCard);
            });
        } else {
            container.innerHTML = '<p class="text-center">Yazar bulunamadı.</p>';
        }
    } catch (error) {
        console.error('Yazarlar yüklenirken hata:', error);
        container.innerHTML = '<p class="text-center text-danger">Yazarlar yüklenirken bir hata oluştu.</p>';
    }
}

// Kitap kartı oluşturma
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    // Kitap kapağı
    const cover = document.createElement('div');
    cover.className = 'book-cover';
    
    const img = document.createElement('img');
    img.src = book.cover || 'images/placeholder.jpg';
    img.alt = book.title;
    cover.appendChild(img);
    
    // Rozet (badge) - Yeni veya Çok Satan
    if (book.isNew || book.isBestseller) {
        const badges = document.createElement('div');
        badges.className = 'book-badges';
        
        if (book.isNew) {
            const newBadge = document.createElement('span');
            newBadge.className = 'badge new';
            newBadge.textContent = 'Yeni';
            badges.appendChild(newBadge);
        }
        
        if (book.isBestseller) {
            const bestsellerBadge = document.createElement('span');
            bestsellerBadge.className = 'badge bestseller';
            bestsellerBadge.textContent = 'Çok Satan';
            badges.appendChild(bestsellerBadge);
        }
        
        cover.appendChild(badges);
    }
    
    // İndirim rozeti
    if (book.discount && book.discount > 0) {
        const discountBadge = document.createElement('span');
        discountBadge.className = 'badge discount';
        discountBadge.textContent = `%${book.discount} İndirim`;
        
        const badges = document.querySelector('.book-badges');
        if (!badges) {
            const newBadges = document.createElement('div');
            newBadges.className = 'book-badges';
            newBadges.appendChild(discountBadge);
            cover.appendChild(newBadges);
        } else {
            badges.appendChild(discountBadge);
        }
    }
    
    // Kitap detayları
    const details = document.createElement('div');
    details.className = 'book-details';
    
    // Kitap başlığı
    const title = document.createElement('h3');
    title.className = 'book-title';
    title.textContent = book.title;
    details.appendChild(title);
    
    // Yazar
    const author = document.createElement('p');
    author.className = 'book-author';
    author.textContent = book.author;
    details.appendChild(author);
    
    // Kategori
    if (book.category) {
        const category = document.createElement('span');
        category.className = 'book-category';
        category.textContent = book.category;
        details.appendChild(category);
    }
    
    // Fiyat
    if (book.price) {
        const priceDiv = document.createElement('div');
        priceDiv.className = 'book-price';
        
        const currentPrice = document.createElement('span');
        currentPrice.className = 'current-price';
        currentPrice.textContent = book.price;
        priceDiv.appendChild(currentPrice);
        
        if (book.originalPrice) {
            const originalPrice = document.createElement('span');
            originalPrice.className = 'original-price';
            originalPrice.textContent = book.originalPrice;
            priceDiv.appendChild(originalPrice);
        }
        
        details.appendChild(priceDiv);
    }
    
    // Sepete ekle butonu
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'add-to-cart';
    addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Sepete Ekle';
    details.appendChild(addToCartBtn);
    
    // Kart yapısını birleştir
    card.appendChild(cover);
    card.appendChild(details);
    
    return card;
}

// Yazar kartı oluşturma
function createAuthorCard(author) {
    const card = document.createElement('div');
    card.className = 'author-card';
    
    // Yazar fotoğrafı
    const imageContainer = document.createElement('div');
    imageContainer.className = 'author-image';
    
    const img = document.createElement('img');
    img.src = author.image || 'images/author-placeholder.jpg';
    img.alt = author.name;
    imageContainer.appendChild(img);
    
    // Yazar bilgileri
    const info = document.createElement('div');
    info.className = 'author-info';
    
    // Yazar adı
    const name = document.createElement('h3');
    name.className = 'author-name';
    name.textContent = author.name;
    info.appendChild(name);
    
    // Kitap sayısı
    if (author.books && author.books.length) {
        const bookCount = document.createElement('p');
        bookCount.className = 'author-books';
        bookCount.textContent = `${author.books.length} Kitap`;
        info.appendChild(bookCount);
    }
    
    // Detay butonu
    const detailBtn = document.createElement('a');
    detailBtn.href = `yazar-detay.html?id=${author.id}`;
    detailBtn.className = 'btn btn-sm';
    detailBtn.textContent = 'Kitapları Gör';
    info.appendChild(detailBtn);
    
    // Kart yapısını birleştir
    card.appendChild(imageContainer);
    card.appendChild(info);
    
    return card;
}

// Ana slider fonksiyonu
function initSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;
    
    const slides = sliderContainer.querySelectorAll('.slide');
    const prevBtn = sliderContainer.querySelector('.prev');
    const nextBtn = sliderContainer.querySelector('.next');
    const indicators = sliderContainer.querySelector('.slider-indicators');
    
    let currentSlide = 0;
    let slideInterval;
    const intervalTime = 5000;
    
    // İndikatörleri oluştur
    if (indicators) {
        slides.forEach((_, index) => {
            const button = document.createElement('button');
            button.className = index === 0 ? 'indicator active' : 'indicator';
            button.setAttribute('data-slide', index);
            button.setAttribute('aria-label', `${index + 1}. Slayt`);
            
            button.addEventListener('click', () => {
                goToSlide(index);
                resetInterval();
            });
            
            indicators.appendChild(button);
        });
    }
    
    // Slider'ı başlat
    function startSlider() {
        slideInterval = setInterval(() => {
            nextSlide();
        }, intervalTime);
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
        
        if (indicators) {
            indicators.children[currentSlide].classList.remove('active');
        }
        
        currentSlide = n;
        
        slides[currentSlide].classList.add('active');
        
        if (indicators) {
            indicators.children[currentSlide].classList.add('active');
        }
    }
    
    // Interval'i sıfırla
    function resetInterval() {
        clearInterval(slideInterval);
        startSlider();
    }
    
    // Olay dinleyicileri
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetInterval();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });
    }
    
    // Slider'ı başlat
    startSlider();
}

// Kitapları yükle ve göster
async function loadBooksAndDisplay() {
    // Yeni çıkanlar
    const newBooksContainer = document.getElementById('newBooksGrid');
    if (newBooksContainer) {
        try {
            const books = await fetchBooks();
            const newBooks = books.filter(book => book.isNew);
            
            if (newBooks.length > 0) {
                newBooksContainer.innerHTML = '';
                
                newBooks.forEach(book => {
                    const bookCard = createBookCard(book);
                    newBooksContainer.appendChild(bookCard);
                });
            }
        } catch (error) {
            console.error('Yeni çıkan kitaplar yüklenirken hata:', error);
        }
    }
    
    // Çok satanlar
    const bestsellersContainer = document.getElementById('bestsellersGrid');
    if (bestsellersContainer) {
        try {
            const books = await fetchBooks();
            const bestsellers = books.filter(book => book.isBestseller);
            
            if (bestsellers.length > 0) {
                bestsellersContainer.innerHTML = '';
                
                bestsellers.forEach(book => {
                    const bookCard = createBookCard(book);
                    bestsellersContainer.appendChild(bookCard);
                });
            }
        } catch (error) {
            console.error('Çok satan kitaplar yüklenirken hata:', error);
        }
    }
}

// Admin paneli için kitapları yükle
async function loadBooksForAdmin() {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    
    try {
        const books = await fetchBooks();
        
        if (books && books.length > 0) {
            booksContainer.innerHTML = '';
            
            books.forEach(book => {
                const col = document.createElement('div');
                col.className = 'col-md-3 mb-4';
                
                const card = document.createElement('div');
                card.className = 'book-card position-relative';
                
                // Kitap kapağı
                const img = document.createElement('img');
                img.src = book.cover;
                img.alt = book.title;
                img.className = 'book-cover';
                card.appendChild(img);
                
                // Stok durumu rozeti
                const badge = document.createElement('div');
                badge.className = 'book-badge';
                
                let badgeHtml = '';
                if (book.stock > 100) {
                    badgeHtml = '<span class="badge bg-success">Stokta</span>';
                } else if (book.stock > 0) {
                    badgeHtml = '<span class="badge bg-warning text-dark">Az Stok</span>';
                } else {
                    badgeHtml = '<span class="badge bg-danger">Tükendi</span>';
                }
                
                badge.innerHTML = badgeHtml;
                card.appendChild(badge);
                
                // Kitap aksiyonları
                const actions = document.createElement('div');
                actions.className = 'book-actions';
                actions.innerHTML = `
                    <button class="btn btn-sm btn-primary" data-bs-toggle="tooltip" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" data-bs-toggle="tooltip" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                card.appendChild(actions);
                
                // Kitap meta bilgileri
                const meta = document.createElement('div');
                meta.className = 'book-meta';
                meta.innerHTML = `
                    <h5 class="book-title">${book.title}</h5>
                    <span class="book-author">${book.author}</span>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="book-category badge bg-light text-dark">${book.category}</span>
                        <span class="book-isbn small text-muted">ISBN: ${book.isbn}</span>
                    </div>
                    <div class="book-stock ${book.stock > 100 ? 'in-stock' : book.stock > 0 ? 'low-stock' : 'out-of-stock'} mt-2">
                        <i class="fas ${book.stock > 100 ? 'fa-check-circle' : book.stock > 0 ? 'fa-exclamation-circle' : 'fa-times-circle'} me-1"></i>
                        ${book.stock > 0 ? book.stock + ' adet stokta' : 'Stokta yok'}
                    </div>
                `;
                card.appendChild(meta);
                
                col.appendChild(card);
                booksContainer.appendChild(col);
            });
        }
    } catch (error) {
        console.error('Admin paneli için kitaplar yüklenirken hata:', error);
        booksContainer.innerHTML = '<div class="alert alert-danger">Kitaplar yüklenirken bir hata oluştu.</div>';
    }
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', function() {
    // Ana slider'ı başlat
    initSlider();
    
    // Kitapları yükle
    loadBooksAndDisplay();
    
    // Yazarları yükle
    loadAuthors();
    
    // Admin paneli için kitapları yükle (admin sayfasındaysa)
    if (document.getElementById('books-container') && document.querySelector('.sidebar-wrapper')) {
        loadBooksForAdmin();
    }
    
    // Mobil menü butonu
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Alt menüler için tıklama olayı
    const hasSubMenuItems = document.querySelectorAll('.main-nav li.has-submenu');
    
    hasSubMenuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth < 992) {
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
            headerSearch.classList.toggle('active');
            
            if (headerSearch.classList.contains('active')) {
                const searchInput = headerSearch.querySelector('input');
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
            if (mobileMenu && nav && nav.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
        
        // Arama kutusunu kapat
        if (!e.target.closest('.header-search') && !e.target.closest('.mobile-search-toggle')) {
            const search = document.querySelector('.header-search');
            if (search && search.classList.contains('active')) {
                search.classList.remove('active');
            }
        }
    });
    
    // ESC tuşuna basıldığında menüyü ve aramayı kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Menüyü kapat
            const mobileMenu = document.querySelector('.mobile-menu-toggle');
            const nav = document.querySelector('.main-nav');
            if (mobileMenu && nav && nav.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
            
            // Arama kutusunu kapat
            const search = document.querySelector('.header-search');
            if (search && search.classList.contains('active')) {
                search.classList.remove('active');
            }
        }
    });
    
    // Pencere boyutu değiştiğinde kontrol et
    window.addEventListener('resize', function() {
        // Eğer masaüstü görünümüne geçildiyse mobil menüyü kapat
        if (window.innerWidth > 992) {
            const mobileMenu = document.querySelector('.mobile-menu-toggle');
            const nav = document.querySelector('.main-nav');
            if (mobileMenu && nav) {
                mobileMenu.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
    });
    
    // Yumuşak kaydırma efekti
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Header yüksekliği kadar üst boşluk bırak
                    behavior: 'smooth'
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
