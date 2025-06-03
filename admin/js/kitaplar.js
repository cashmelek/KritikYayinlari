// Kitaplar.js - Kitap yönetimi için JavaScript fonksiyonları

// Supabase istemcisini al
const supabase = window.supabaseClient;

// Sayfa yüklendiginde çalışacak kodlar
document.addEventListener('DOMContentLoaded', async function() {
    // Önce Supabase şemasını kontrol et
    await checkSupabaseSchema();
    
    // Kitapları yükle
    await loadBooks();
    
    // Arama ve filtreleme olaylarını ekle
    setupEventListeners();
    
    // Modal işlemleri
    setupModalHandlers();
    
    // Yeni Kitap Ekle butonuna tıklama olayı ekle
    const addBookButton = document.getElementById('addBookButton');
    if (addBookButton) {
        addBookButton.addEventListener('click', function() {
            // Modal başlığını ayarla
            document.getElementById('modalTitle').innerHTML = '<i class="ri-add-line mr-2 text-primary"></i><span>Yeni Kitap Ekle</span>';
            
            // Form sıfırla
            document.getElementById('bookId').value = '';
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            document.getElementById('isbn').value = '';
            document.getElementById('publishedDate').value = new Date().toISOString().split('T')[0]; // Bugünün tarihi
            document.getElementById('pageCount').value = '';
            // Kategori alanı kaldırıldı
            document.getElementById('bookStock').value = '0';
            document.getElementById('description').value = '';
            document.getElementById('aboutBook').value = ''; // Kitap Hakkında alanını sıfırla
            document.getElementById('isNew').checked = false;
            document.getElementById('isBestseller').checked = false;
            document.getElementById('bookCoverPreview').src = '../images/placeholder.png';
            
            // Modalı aç
            openModal();
        });
    }
    
    // Kitap formunu ayarla
    setupBookForm();
});

// Supabase şemasını kontrol et
async function checkSupabaseSchema() {
    try {
        // books tablosunun şemasını kontrol et
        console.log('Supabase şeması kontrol ediliyor...');
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .limit(1);
            
        if (error) throw error;
        
        if (data && data.length > 0) {
            console.log('Books tablosu şeması:', Object.keys(data[0]));
            window.booksSchema = Object.keys(data[0]);
        } else {
            console.log('Books tablosu boş veya erişilemedi.');
            window.booksSchema = [];
        }
    } catch (error) {
        console.error('Supabase şeması kontrol edilirken hata:', error);
        window.booksSchema = [];
    }
}

// Modal işlemlerini ayarla
function setupModalHandlers() {
    // Modal kapatma butonları
    const closeButtons = document.querySelectorAll('[data-close-modal]');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModal();
        });
    });
    
    // Modal dışına tıklandığında kapat
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    // ESC tuşuna basıldığında modalı kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Kitapları yükle
async function loadBooks() {
    try {
        const booksContainer = document.getElementById('booksContainer');
        if (!booksContainer) return;
        
        // Yükleniyor göster
        booksContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="flex flex-col items-center">
                    <div class="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p class="text-lg text-gray-600">Kitaplar yükleniyor...</p>
                </div>
            </div>
        `;
        
        // Filtreleri al
        const searchQuery = document.getElementById('search')?.value || '';
        const authorFilter = document.getElementById('author')?.value || '';
        const categoryFilter = document.getElementById('category')?.value || '';
        const stockFilter = document.getElementById('stock')?.value || '';
        
        // Supabase sorgusu oluştur - authors tablosunu da join et
        let query = window.supabaseClient
            .from('books')
            .select('*, authors(id, name)');
        
        // Filtreleri uygula
        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,isbn.ilike.%${searchQuery}%`);
        }
        
        if (authorFilter) {
            query = query.eq('author_id', authorFilter);
        }
        
        if (categoryFilter) {
            query = query.eq('category', categoryFilter);
        }
        
        if (stockFilter) {
            switch(stockFilter) {
                case 'inStock':
                    query = query.gt('stock', 10);
                    break;
                case 'lowStock':
                    query = query.gt('stock', 0).lte('stock', 10);
                    break;
                case 'outOfStock':
                    query = query.eq('stock', 0);
                    break;
            }
        }
        
        // Verileri çek
        const { data: books, error } = await query;
        
        if (error) {
            console.error('Kitaplar yüklenirken hata oluştu:', error);
            booksContainer.innerHTML = `
                <div class="col-span-full text-center py-12 bg-red-50 border border-red-100 rounded-lg">
                    <div class="flex flex-col items-center">
                        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <i class="ri-error-warning-line text-4xl text-red-400"></i>
                        </div>
                        <h3 class="text-xl font-bold text-red-800 mb-2">Hata</h3>
                        <p class="text-red-600 mb-2">Kitaplar yüklenirken bir sorun oluştu:</p>
                        <p class="text-red-500 text-sm bg-white p-3 rounded-md border border-red-200 mb-6 max-w-lg">
                            ${error.message || 'Bilinmeyen bir hata oluştu'}
                        </p>
                        <button id="retryButton" class="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-red-700 transition-colors">
                            <i class="ri-refresh-line mr-2"></i>
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            `;
            
            // Tekrar deneme butonu işlevselliği
            document.getElementById('retryButton')?.addEventListener('click', () => {
                loadBooks();
            });
            
            return;
        }
        
        if (!books || books.length === 0) {
            booksContainer.innerHTML = `
                <div class="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
                    <div class="flex flex-col items-center">
                        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <i class="ri-book-open-line text-5xl text-gray-300"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-700 mb-2">Kitap bulunamadı</h3>
                        <p class="text-gray-500 mb-6 max-w-md">Henüz bir kitap eklenmemiş veya arama kriterlerinize uygun kitap bulunamadı.</p>
                        <button onclick="document.getElementById('addBookButton').click()" class="bg-primary text-white px-6 py-2 rounded-lg flex items-center hover:bg-primary/90 transition-colors">
                            <i class="ri-add-line mr-2"></i>
                            Yeni Kitap Ekle
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Kitapları göster
        booksContainer.innerHTML = '';
        
        books.forEach(book => {
            // Stok durumuna göre renk belirleme
            let stockStatus, stockColor;
            if (book.stock === 0) {
                stockStatus = 'Tükendi';
                stockColor = 'bg-red-100 text-red-800';
            } else if (book.stock <= 10) {
                stockStatus = 'Az Kaldı';
                stockColor = 'bg-yellow-100 text-yellow-800';
            } else {
                stockStatus = 'Stokta';
                stockColor = 'bg-green-100 text-green-800';
            }
            
            // Yazar adını al - authors tablosundan
            const authorName = book.authors ? book.authors.name : 'Bilinmeyen Yazar';
            
            // Kitap kartı HTML'i
            const bookCard = `
                <div class="book-card bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-[520px] flex flex-col">
                    <div class="relative group flex-shrink-0">
                        <div class="bg-gradient-to-br from-gray-50 to-gray-100 h-80 w-full flex items-center justify-center overflow-hidden">
                            <img src="${book.cover_url || '../images/placeholder.png'}" alt="${book.title}" class="max-h-full max-w-full object-contain p-2 transition-all duration-300 group-hover:scale-105">
                        </div>
                        <div class="absolute top-3 right-3">
                            <span class="${stockColor} text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">${stockStatus}</span>
                        </div>
                        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <div class="flex space-x-3">
                                <button class="bg-white text-primary p-3 rounded-full hover:bg-primary hover:text-white transition-all duration-200 shadow-lg transform hover:scale-110" onclick="editBook('${book.id}')" title="Düzenle">
                                    <i class="ri-edit-line text-lg"></i>
                                </button>
                                <button class="bg-white text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg transform hover:scale-110" onclick="deleteBook('${book.id}')" title="Sil">
                                    <i class="ri-delete-bin-line text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-secondary text-lg mb-2 line-clamp-2 leading-tight" title="${book.title}">${book.title}</h3>
                            <p class="text-gray-600 mb-3 font-medium text-sm">${authorName}</p>
                        </div>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">${book.year || 'Tarih Yok'}</span>
                            <div class="flex space-x-2">
                                <button class="text-primary hover:text-primary/80 p-2 hover:bg-primary/10 rounded-full transition-all duration-200" onclick="editBook('${book.id}')" title="Düzenle">
                                    <i class="ri-edit-line text-lg"></i>
                                </button>
                                <button class="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all duration-200" onclick="deleteBook('${book.id}')" title="Sil">
                                    <i class="ri-delete-bin-line text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            booksContainer.innerHTML += bookCard;
        });
        
    } catch (error) {
        console.error('Kitaplar yüklenirken beklenmeyen bir hata oluştu:', error);
        document.getElementById('booksContainer').innerHTML = `<div class="col-span-full text-center py-8 text-red-500">Beklenmeyen bir hata oluştu</div>`;
    }
}

// Event listener'ları ayarla
function setupEventListeners() {
    // Arama kutusu
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            loadBooks();
        }, 500));
    }
    
    // Filtreler
    const filters = ['author', 'category', 'stock'];
    filters.forEach(filter => {
        const element = document.getElementById(filter);
        if (element) {
            element.addEventListener('change', function() {
                loadBooks();
            });
        }
    });
    
    // Filtreleri temizle butonu
    const clearFiltersButton = document.getElementById('clearFilters');
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', function() {
            // Tüm filtreleri sıfırla
            document.getElementById('search').value = '';
            document.getElementById('author').value = '';
            document.getElementById('category').value = '';
            document.getElementById('stock').value = '';
            
            // Kitapları yeniden yükle
            loadBooks();
        });
    }
    
    // Menü toggle butonu
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar-wrapper');
            if (sidebar.classList.contains('w-64')) {
                sidebar.classList.remove('w-64');
                sidebar.classList.add('w-0');
            } else {
                sidebar.classList.remove('w-0');
                sidebar.classList.add('w-64');
            }
        });
    }
    
    // Kullanıcı menüsü
    const userButton = document.getElementById('userButton');
    if (userButton) {
        userButton.addEventListener('click', function() {
            const userMenu = document.getElementById('userDropdownMenu');
            userMenu.classList.toggle('hidden');
        });
        
        // Dışarı tıklandığında menüyü kapat
        document.addEventListener('click', function(e) {
            const userMenu = document.getElementById('userDropdownMenu');
            if (!userButton.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }
}

// Kitap düzenle fonksiyonu
async function editBook(bookId) {
    try {
        // Kitap verilerini al - yazarlar tablosuyla birleştirerek
        const { data: book, error } = await window.supabaseClient
            .from('books')
            .select('*, authors(id, name)')
            .eq('id', bookId)
            .single();
        
        if (error) throw error;
        
        if (!book) {
            showNotification('Kitap bulunamadı', 'error');
            return;
        }
        
        console.log('Düzenlenecek kitap:', book);
        
        // Modal başlığını ayarla
        document.getElementById('modalTitle').innerHTML = '<i class="ri-edit-line mr-2 text-primary"></i><span>Kitap Düzenle</span>';
        
        // Kitap bilgilerini formlara yükle
        document.getElementById('bookId').value = book.id;
        document.getElementById('bookTitle').value = book.title || '';
        
        if (book.authors) {
            document.getElementById('bookAuthor').value = book.authors.name || '';
        }
        
        document.getElementById('isbn').value = book.isbn || '';
        document.getElementById('publishedDate').value = book.year ? `${book.year}-01-01` : '';
        document.getElementById('pageCount').value = book.pages || '';
        document.getElementById('bookStock').value = book.stock || 0;
        document.getElementById('description').value = book.description || '';
        document.getElementById('aboutBook').value = book.about_book || '';
        document.getElementById('isNew').checked = book.is_new || false;
        document.getElementById('isBestseller').checked = book.is_bestseller || false;
        document.getElementById('bookCoverPreview').src = book.cover_url || '../images/placeholder.png';
        
        // Modalı aç
        openModal();
    } catch (error) {
        console.error('Kitap bilgileri alınırken hata oluştu:', error);
        showNotification('Kitap bilgileri alınırken bir hata oluştu', 'error');
    }
}

// Kitap sil
async function deleteBook(bookId) {
    if (confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
        try {
            const { error } = await supabase
                .from('books')
                .delete()
                .eq('id', bookId);
            
            if (error) throw error;
            
            showNotification('Kitap başarıyla silindi', 'success');
            loadBooks(); // Kitapları yeniden yükle
            
        } catch (error) {
            console.error('Kitap silinirken hata oluştu:', error);
            showNotification('Kitap silinirken bir hata oluştu', 'error');
        }
    }
}

// Modal açma fonksiyonu
function openModal() {
    document.getElementById('addBookModal').classList.remove('hidden');
    document.getElementById('modalOverlay').classList.remove('hidden');
}

// Modal kapatma fonksiyonu
function closeModal() {
    document.getElementById('addBookModal').classList.add('hidden');
    document.getElementById('modalOverlay').classList.add('hidden');
    
    // Formu temizle
    document.getElementById('addBookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('bookCoverPreview').src = '../images/placeholder.png';
    document.getElementById('bookCoverPreview').removeAttribute('data-base64');
    
    // Modal başlığını varsayılan hale getir
    document.getElementById('modalTitle').innerHTML = '<i class="ri-book-open-line mr-2 text-primary"></i><span>Yeni Kitap Ekle</span>';
}

// Kitap formunu ayarla
async function setupBookForm() {
    const bookForm = document.getElementById('addBookForm');
    if (!bookForm) return;
    
    // Kapak resmi yükleme
    const coverImageInput = document.getElementById('bookCover');
    if (coverImageInput) {
        coverImageInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                try {
                    // Görsel Ölçeklendirme Modülünü kullan
                    if (window.ImageScaler) {
                        // Yükleniyor göstergesi
                        const previewImage = document.getElementById('bookCoverPreview');
                        previewImage.src = '../images/placeholder.png';
                        
                        try {
                            // Görseli ölçeklendir (2:3 oranında)
                            const optimizedImage = await window.ImageScaler.optimizeImage(file, 'book');
                            
                            // Görseli ön izleme için göster
                            previewImage.src = optimizedImage.dataUrl;
                            
                            // Base64 veriyi sakla
                            previewImage.setAttribute('data-base64', optimizedImage.dataUrl);
                            
                            // İstatistikleri loga yazdır
                            console.log('Görsel ölçeklendirildi:', {
                                boyut: `${optimizedImage.width}x${optimizedImage.height}`,
                                orijinalBoyut: `${optimizedImage.originalWidth}x${optimizedImage.originalHeight}`,
                                oran: '2:3 (standart kitap kapağı)'
                            });
                            
                            // Başarı mesajı göster
                            showNotification(`Görsel başarıyla ölçeklendirildi: ${optimizedImage.width}x${optimizedImage.height} (2:3)`, 'success');
                        } catch (error) {
                            console.error('Görsel ölçeklendirme hatası:', error);
                            previewImage.src = '../images/placeholder.png';
                            showNotification('Görsel ölçeklendirilirken hata oluştu: ' + error.message, 'error');
                        }
                    } else {
                        // Eski metod - ImageScaler mevcut değilse
                        // Dosya boyutunu kontrol et (max 10MB)
                        if (file.size > 10 * 1024 * 1024) {
                            showNotification('Dosya boyutu çok büyük (max 10MB)', 'error');
                            return;
                        }
                        
                        // Dosya türünü kontrol et
                        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                        if (!validTypes.includes(file.type)) {
                            showNotification('Lütfen desteklenen bir görsel formatı seçin (JPG, PNG, GIF, WEBP)', 'error');
                            return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            // Görseli ön izleme için göster
                            const previewImage = document.getElementById('bookCoverPreview');
                            previewImage.src = e.target.result;
                            
                            // Base64 veriyi sakla
                            previewImage.setAttribute('data-base64', e.target.result);
                            
                            console.log('Görsel yüklendi ve ön izleme gösteriliyor');
                        };
                        reader.readAsDataURL(file);
                    }
                } catch (error) {
                    console.error('Görsel yükleme hatası:', error);
                    showNotification('Görsel yüklenirken bir hata oluştu: ' + error.message, 'error');
                }
            }
        });
    }
    
    // Form gönderildiğinde
    bookForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const bookId = document.getElementById('bookId').value;
        const isEditing = bookId !== '';
        
        // Zorunlu alanları kontrol et
        const title = document.getElementById('bookTitle').value.trim();
        const authorName = document.getElementById('bookAuthor').value.trim();
        const isbn = document.getElementById('isbn').value.trim();
        const publishedDate = document.getElementById('publishedDate').value;
        const pageCount = document.getElementById('pageCount').value;
        const stock = document.getElementById('bookStock').value;

        if (!title || !authorName || !isbn || !publishedDate || !pageCount || !stock) {
            showNotification('Lütfen tüm zorunlu alanları doldurun', 'error');
            return;
        }
        
        try {
            // Önce yazarı kontrol et/ekle
            let authorId;
            
            // Yazar adıyla yazarı ara
            const { data: existingAuthors, error: searchError } = await window.supabaseClient
                .from('authors')
                .select('id, name')
                .ilike('name', authorName);
            
            if (searchError) {
                console.error('Yazar arama hatası:', searchError);
                throw searchError;
            }
            
            if (existingAuthors && existingAuthors.length > 0) {
                // Yazar zaten var, mevcut ID'yi kullan
                authorId = existingAuthors[0].id;
                console.log('Mevcut yazar bulundu:', existingAuthors[0]);
            } else {
                // Yazar yok, yeni yazar ekle
                const newAuthorData = {
                    name: authorName,
                    bio: `${authorName} tarafından yazılan kitaplar.`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                const { data: newAuthor, error: authorError } = await window.supabaseClient
                    .from('authors')
                    .insert([newAuthorData])
                    .select()
                    .single();
                
                if (authorError) {
                    console.error('Yeni yazar ekleme hatası:', authorError);
                    throw authorError;
                }
                
                authorId = newAuthor.id;
                console.log('Yeni yazar eklendi:', newAuthor);
                showNotification(`Yeni yazar "${authorName}" eklendi`, 'success');
        }
        
        const bookData = {
                title: title,
                author_id: authorId,
                description: document.getElementById('description').value.trim(),
                about_book: document.getElementById('aboutBook').value.trim(),
            cover_url: document.getElementById('bookCoverPreview').getAttribute('data-base64') || 
                         document.getElementById('bookCoverPreview').src || 
                         'data:image/png;base64,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QiBBIEMgQKBCoEGgQ6BAYEJgQWBDYEDgQuBA4EPgQBBCEEEQQxBAkEKQQZBDkECQQpBBkEOQQFBCUEFQQ1BA0ELQQNBD0EAwQjBBMEMwQLBCsEGwQ7BAcEJwQXBDcEDwQvBA8EPwQAhCCEEIQwhAiEKIQYhDiECIQohBiEOIQEhCSEFIQ0hAyELIQMhCyEHIQ8hAKEIoQShDKECoQqhBqEOoQGhCaEFoQ2hA6ELoQOhD6EAYQhhBGEMYQJhCmEGYQ5hAmEKYQZhDmEBYQlhBWENYQNhC2EDYQ9hAOEI4QThDOEC4QrhBuEO4QLhCuEG4Q7hAeEJ4QXhDeEF4Q3hA+EP4QARAiECEQoRAhEKEQYRDhECEQoRBhEOEQERCREFEQ0RAxELEQMRCxEHEQ8RAJEIkQSRDJECkQqRBpEOkQGRCZEFkQ2RA5ELkQORD5EAUQhRBFEMUQJRClEGUQ5RAlEKUQZRDlEBUQlRBVENUQNRC1EDUQ9RANEo0QTRHNEC0QrRBtEO0QLRCtEG0Q7RAdEJ0QXRDdED0QvRA9EL0QfRD9EAMUgxBDEMMQIxCjEGMQ4xAjEKMQYxDjEBMQkxBTENMQMxCzEDMQsxBzEPMQCxCLEEsQyxArEKsQaxDrEBsQmxBbENsQOxC7EDsQ+xAHEIcQRxDHECcQpxBnEOcQJxCnEGcQ5xAXEJcQVxDXEDcQtxA3ELcQdxD3EAcQhxBHEMcQJxCnEGcQ5xAnEKcQZxDnEBcQlxBXENcQNxC3EDcQtxB3EPcQDxCPEE8QzxAvEK8QbxDvEC8QrxBvEO8QHxCfEF8Q3xA/EL8QPxC/EH8Q/xAAkICQgJCAkECQwJAgkKCQYJDgkCCQoJBgkOCQEJCQkFCQ0JAwkLCQMJCwkHCQ8JAIkIiQSJDIkCiQqJBokOiQGJCYkFiQ2JA4kLiQOJD4kASQhJBEkMSQJJCkkGSQ5JAkkKSQZJDkkBSQlJBUkNSQNJC0kDSQtJB0kPSQDJCMkEyQzJAskKyQbJDskCyQrJBskOyQHJCckFyQ3JA8kLyQPJC8kHyQ/JAAUABQgFBAUMBQIFCgUGBQ4FAgUKBQYFDgUBBQkFBQUNBQMFCwUDBQsFBwUPBQCFCIUEhQyFAoUKhQaFDoUBhQmFBYUNhQOFC4UDhQ+FAEUIRQRFDEUCRQpFBkUORQJFCkUGRQ5FAUUJRQVFDUUDRQtFA0ULRQNFD0UAxQjFBMUMxQLFCsUGxQ7FAsUKxQbFDsUBxQnFBcUNxQPFC8UDxQvFB8UPxQANAAUIBQQFDAUCBQoFBgUOBQIFCgUGBQ4FAQUJBQUFDQUDBQsFAwULBQcFDwUAhQiFBIUMhQKFCoUGhQ6FAYUJhQWFDYUDhQuFA4UPhQBFCEUERQxFAkUKRQZFDkUCRQpFBkUORQFFCUUFRQ1FA0ULRQNFD0UAxQjFBMUMxQLFCsUGxQ7FAsUKxQbFDsUBxQnFBcUNxQPFC8UDxQvFB8UPxQANAAUIBQQFDAUCBQoFBgUOBQIFCgUGBQ4FAQUJBQUFDQUDBQsFAwULBQcFDwUAhQiFBIUMhQKFCoUGhQ6FAYUJhQWFDYUDhQuFA4UPhQBFCEUERQxFAkUKRQZFDkUCRQpFBkUORQFFCUUFRQ1FA0ULRQNFCkUDRQ9FAMUIxQTFDMUCxQrFBsUOxQLFCsUGxQ7FAcUJxQXFDcUDxQvFA8ULxQfFD8UADQAFCAUEBQwFAgUKBQYFDgUCBQoFBgUOBQEFCQUFBQ0FAwULBQMFCwUHBQ8FAIUIhQSFDIUChQqFBoUOhQGFCYUFhQ2FA4ULhQOFD4UARQhFBEUMRQJFCkUGRQ5FAkUKRQZFDkUBRQlFBUUNRQNFC0UDRQtFA0UPRQDFCMUExQzFAsUKxQbFDsUCxQrFBsUOxQLFCsUGxQ7FAcUJxQXFDcUDxQvFA8ULxQfFD8UAA==',
                year: parseInt(publishedDate.split('-')[0]) || new Date().getFullYear(),
                pages: parseInt(pageCount),
            publisher: document.getElementById('publisher')?.value || '', // Varsa publisher alanını kullan
            language: 'Türkçe', // Varsayılan değer
                isbn: isbn,
            is_new: document.getElementById('isNew').checked || false,
            is_bestseller: document.getElementById('isBestseller').checked || false,
                stock: parseInt(stock),
            updated_at: new Date().toISOString()
        };
        
            // Konsola debug için yazdır
            console.log('Gönderilecek kitap verileri:', bookData);
        
            if (isEditing) {
                // Kitabı güncelle
                const { data, error } = await window.supabaseClient
                    .from('books')
                    .update(bookData)
                    .eq('id', bookId)
                    .select();
                
                if (error) {
                    console.error('Kitap güncelleme hatası:', error);
                    throw error;
                }
                
                console.log('Güncellenen kitap:', data);
                
                // Kitap değişikliğini bildir
                if (typeof notifyBookChange === 'function') {
                    notifyBookChange(data[0], 'update');
                }
                
                showNotification('Kitap başarıyla güncellendi', 'success');
            } else {
                // Yeni kitap ekle
                bookData.created_at = new Date().toISOString();
                
                console.log('Eklenecek kitap verileri:', bookData);
                
                const { data, error } = await window.supabaseClient
                    .from('books')
                    .insert([bookData])
                    .select();
                
                if (error) {
                    console.error('Kitap ekleme hatası:', error);
                    throw error;
                }
                
                console.log('Eklenen kitap:', data);
                
                // Kitap değişikliğini bildir
                if (typeof notifyBookChange === 'function') {
                    notifyBookChange(data[0], 'insert');
                }
                
                showNotification('Kitap başarıyla eklendi', 'success');
            }
            
            // Modalı kapat
            closeModal();
            
            // Kitapları yeniden yükle
            loadBooks();
        } catch (error) {
            console.error('Kitap kaydedilirken hata oluştu:', error);
            
            // Hata detayını kullanıcıya göster
            let errorMessage = 'Kitap kaydedilirken bir hata oluştu.';
            if (error.message) {
                errorMessage += ` Detay: ${error.message}`;
            }
            if (error.hint) {
                errorMessage += ` İpucu: ${error.hint}`;
            }
            
            showNotification(errorMessage, 'error');
        }
    });
}

// Debounce fonksiyonu (arama için)
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.innerHTML = `
        <i class="ri-${type === 'success' ? 'check' : 'close'}-line mr-2"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}