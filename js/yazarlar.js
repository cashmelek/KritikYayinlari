// Yazarları görüntüle
function displayAuthors(authors) {
    const authorsContainer = document.getElementById('authorsContainer');
    if (!authorsContainer) return;
    
    if (!authors || authors.length === 0) {
        authorsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="ri-user-line text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-600 mb-2">Yazar Bulunamadı</h3>
                <p class="text-gray-500">Henüz yazar eklenmemiş.</p>
            </div>
        `;
        return;
    }
    
    authorsContainer.innerHTML = authors.map(author => {
        // Yazar fotoğrafı
        const photoUrl = author.photo_url || 'images/placeholder-author.png';
        
        // Kitap sayısı
        const bookCount = author.book_count || 0;
        
        return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <a href="yazarlar.html?yazar_id=${author.id}" class="block">
                <div class="aspect-square overflow-hidden bg-gray-100">
                    <img src="${photoUrl}" alt="${author.name}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onerror="this.src='images/placeholder-author.png'">
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-1">${author.name}</h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3 h-[4.5rem]">${author.bio || 'Yazar hakkında henüz bilgi girilmemiş'}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-500 text-sm">${bookCount} Kitap</span>
                        <span class="text-primary text-sm font-medium">Detaylar</span>
                    </div>
                </div>
            </a>
        </div>
        `;
    }).join('');
} 