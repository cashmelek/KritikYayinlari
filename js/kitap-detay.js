// Kitap detaylarını gösterir
function displayBookDetails(book) {
    if (!book) return;
    
    // Sayfa başlığını güncelle
    document.title = `${book.title} - Kritik Yayınları`;
    
    // Yazar adını al
    let authorName = "Bilinmeyen Yazar";
    let authorId = null;
    
    if (book.authors) {
        if (typeof book.authors === 'string') {
            authorName = book.authors;
        } else if (book.authors.name) {
            authorName = book.authors.name;
            authorId = book.authors.id;
        }
    }
    
    // Kapak resmini kontrol et
    const coverUrl = book.cover_url || 'images/placeholder.png';
    
    // Kitabın çıkış yılı
    const publishYear = book.year || 'Belirtilmemiş';
    
    // Sayfa sayısı
    const pageCount = book.pages || 'Belirtilmemiş';
    
    // Kitap detay alanını güncelle
    const bookDetailContainer = document.getElementById('bookDetailContainer');
    if (bookDetailContainer) {
        bookDetailContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Kitap Kapak Resmi -->
                <div class="md:col-span-1">
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <img src="${coverUrl}" alt="${book.title}" class="w-full h-auto object-cover" onerror="this.src='images/placeholder.png'">
                        ${book.is_new ? '<div class="absolute top-3 right-3"><span class="bg-primary text-white text-xs px-2 py-1 rounded-full">Yeni</span></div>' : ''}
                    </div>
                </div>
                
                <!-- Kitap Bilgileri -->
                <div class="md:col-span-2">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">${book.title}</h1>
                    <div class="flex items-center mb-4">
                        <a href="yazarlar.html?yazar_id=${authorId}" class="text-primary hover:underline">${authorName}</a>
                    </div>
                    
                    <div class="mb-6">
                        <p class="text-gray-700 leading-relaxed">${book.description || 'Bu kitap için henüz açıklama bulunmuyor.'}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <span class="text-gray-500 text-sm">Yayın Yılı</span>
                            <p class="font-medium">${publishYear}</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <span class="text-gray-500 text-sm">Sayfa Sayısı</span>
                            <p class="font-medium">${pageCount}</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <span class="text-gray-500 text-sm">Kategori</span>
                            <p class="font-medium">${book.category || 'Belirtilmemiş'}</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-3">
                        <a href="#kitap-hakkinda" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">
                            Kitap Hakkında
                        </a>
                        <a href="yazarlar.html?yazar_id=${authorId}" class="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors">
                            Yazar Hakkında
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
} 