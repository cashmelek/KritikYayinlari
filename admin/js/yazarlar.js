// Yazarlar.js - Yazarlar sayfası için JavaScript fonksiyonları

// Debounce fonksiyonu - Arama işlemlerinde performans için
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', async function() {
    // Yazarları yükle
    await loadAuthors();
    
    // Event listener'ları ayarla
    setupEventListeners();
    
    // Gerçek zamanlı güncellemeleri başlat
    setupRealtimeUpdates();
    
    // Admin kontrolü
    checkAdminStatus();
});

// Admin kontrolü
function checkAdminStatus() {
    // Gerçek uygulamada oturum kontrolü yapılır
    console.log('Supabase şeması kontrol ediliyor...');
    
    try {
        // Supabase bağlantısını kontrol et
        if (window.supabaseClient) {
            console.log('Supabase bağlantısı başarılı');
        } else {
            console.error('Supabase bağlantısı bulunamadı');
        }
    } catch (error) {
        console.error('Supabase şeması kontrol edilirken hata:', error);
    }
}

// Yazarları yükle
async function loadAuthors() {
    try {
        // Yükleniyor göstergesi
        const authorsContainer = document.getElementById('authorsContainer');
        if (authorsContainer) {
            authorsContainer.innerHTML = `
                <div class="col-span-full flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            `;
        }
        
        // Filtreleme parametrelerini al
        const searchQuery = document.getElementById('searchInput')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const sortFilter = document.getElementById('sortFilter')?.value || 'name_asc';
        
        // Supabase sorgusu oluştur
        let query = window.supabaseClient
            .from('authors')
            .select('*');
        
        // Arama filtresini uygula
        if (searchQuery) {
            query = query.ilike('name', `%${searchQuery}%`);
        }
        
        // Durum filtresini uygula
        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }
        
        // Sıralama filtresini uygula
        if (sortFilter) {
            const [field, direction] = sortFilter.split('_');
            query = query.order(field, { ascending: direction === 'asc' });
        }
        
        // Sorguyu çalıştır
        const { data: authors, error } = await query;
        
        if (error) throw error;
        
        // İstatistikleri güncelle
        updateAuthorStats(authors);
        
        // Yazarları görüntüle
        displayAuthors(authors);
    } catch (error) {
        console.error('Yazarlar yüklenirken beklenmeyen bir hata oluştu:', error);
        const authorsContainer = document.getElementById('authorsContainer');
        if (authorsContainer) {
            authorsContainer.innerHTML = `<div class="col-span-full text-center py-8 text-red-500">Beklenmeyen bir hata oluştu</div>`;
        }
    }
}

// Yazar istatistiklerini güncelle
function updateAuthorStats(authors) {
    try {
        // Tüm yazarlar
        const totalAuthorsElement = document.querySelector('.bg-blue-100 + div .font-bold');
        if (totalAuthorsElement) {
            totalAuthorsElement.textContent = authors ? authors.length : 0;
        }
        
        // Aktif yazarlar
        const activeAuthorsElement = document.querySelector('.bg-green-100 + div .font-bold');
        if (activeAuthorsElement) {
            const activeAuthors = authors ? authors.filter(author => author.status === 'active').length : 0;
            activeAuthorsElement.textContent = activeAuthors;
        }
        
        // Bu ay eklenen yazarlar
        const newAuthorsElement = document.querySelector('.bg-purple-100 + div .font-bold');
        if (newAuthorsElement) {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            
            const newAuthors = authors ? authors.filter(author => {
                const createdAt = new Date(author.created_at);
                return createdAt >= firstDayOfMonth;
            }).length : 0;
            
            newAuthorsElement.textContent = newAuthors;
        }
    } catch (error) {
        console.error('Yazar istatistikleri güncellenirken hata:', error);
    }
}

// Yazarları görüntüle
function displayAuthors(authors) {
    const authorsContainer = document.getElementById('authorsContainer');
    if (!authorsContainer) return;
    
    if (!authors || authors.length === 0) {
        authorsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="ri-error-warning-line text-4xl text-gray-400 mb-4"></i>
                <h2 class="text-xl font-semibold text-gray-600 mb-1">Yazar Bulunamadı</h2>
                <p class="text-gray-500 mb-6">Henüz hiç yazar eklenmemiş veya arama kriterlerinize uygun yazar bulunamadı.</p>
                <button onclick="openModal()" class="inline-flex items-center bg-primary text-white px-4 py-2 rounded-button hover:bg-opacity-90 transition">
                    <i class="ri-add-line mr-2"></i>
                    Yeni Yazar Ekle
                </button>
            </div>
        `;
        return;
    }
    
    // Yazarları listele
    let html = '';
    
    authors.forEach(author => {
        html += `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div class="relative overflow-hidden">
                    <img src="${author.photo_url || '../images/placeholder.png'}" alt="${author.name}" 
                         class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105">
                    <div class="absolute top-0 right-0 p-2 flex space-x-1">
                        <button onclick="editAuthor('${author.id}')" class="bg-white text-primary p-1.5 rounded-full shadow hover:bg-primary hover:text-white transition-colors">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button onclick="deleteAuthor('${author.id}', '${author.name}')" class="bg-white text-red-500 p-1.5 rounded-full shadow hover:bg-red-500 hover:text-white transition-colors">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-secondary mb-1 line-clamp-1">${author.name}</h3>
                    <p class="text-sm text-gray-600 mb-2 line-clamp-2">${author.bio || 'Biyografi bulunmuyor'}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-500">${author.books_count || 0} Kitap</span>
                        <a href="#" onclick="viewAuthorDetails('${author.id}')" class="text-primary text-sm hover:underline">Detaylar</a>
                    </div>
                </div>
            </div>
        `;
    });
    
    authorsContainer.innerHTML = html;
}

// Yazar düzenleme
function editAuthor(authorId) {
    // Yazarı getir
    getAuthorById(authorId).then(author => {
        if (!author) {
            showNotification('Yazar bulunamadı', 'error');
            return;
        }
        
        // Form alanlarını doldur
        document.getElementById('authorId').value = author.id;
        document.getElementById('authorName').value = author.name;
        document.getElementById('authorBio').value = author.bio || '';
        
        // Yazar fotoğrafını göster
        const authorPreview = document.getElementById('authorPreview');
        if (authorPreview) {
            authorPreview.src = author.photo_url || '../images/placeholder.png';
        }
        
        // Modalı aç
        document.getElementById('addAuthorModal').classList.remove('hidden');
        document.getElementById('modalOverlay').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        
        // Modal başlığını güncelle
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="ri-edit-line mr-2 text-primary"></i><span>Yazarı Düzenle</span>';
        }
    }).catch(error => {
        console.error('Yazar bilgileri alınırken hata:', error);
        showNotification('Yazar bilgileri alınırken bir hata oluştu', 'error');
    });
}

// Yazar silme
async function deleteAuthor(authorId, authorName) {
    if (!confirm(`"${authorName}" adlı yazarı silmek istediğinize emin misiniz?`)) {
        return;
    }
    
    try {
        const result = await deleteAuthorById(authorId);
        if (result) {
            showNotification('Yazar başarıyla silindi', 'success');
            loadAuthors(); // Yazarları yeniden yükle
        } else {
            showNotification('Yazar silinirken bir hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Yazar silinirken hata:', error);
        showNotification('Yazar silinirken bir hata oluştu', 'error');
    }
}

// Yazar detaylarını görüntüle
function viewAuthorDetails(authorId) {
    // Yazarı getir
    getAuthorById(authorId).then(author => {
        if (!author) {
            showNotification('Yazar bulunamadı', 'error');
            return;
        }
        
        // Yazar detaylarını içeren bir modal göster
        const detailsHTML = `
            <div class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center" id="authorDetailsModal">
                <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                    <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                        <h3 class="text-xl font-bold text-secondary flex items-center">
                            <i class="ri-user-line mr-2 text-primary"></i>
                            <span>Yazar Detayları</span>
                        </h3>
                        <button type="button" class="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors" onclick="closeAuthorDetailsModal()">
                            <i class="ri-close-line text-2xl"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="md:w-1/3 flex flex-col items-center">
                                <img src="${author.photo_url || 'https://via.placeholder.com/300x400'}" class="w-48 h-48 object-cover rounded-full shadow-md mb-4" alt="${author.name}">
                                <h2 class="text-xl font-semibold text-center">${author.name}</h2>
                            </div>
                            <div class="md:w-2/3">
                                <div class="mb-6">
                                    <h3 class="text-lg font-semibold mb-2 text-primary">Biyografi</h3>
                                    <p class="text-gray-700">${author.bio || 'Biyografi bilgisi mevcut değil.'}</p>
                                </div>
                                <div class="mb-6">
                                    <h3 class="text-lg font-semibold mb-2 text-primary">Kitaplar</h3>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <p class="text-gray-500">Bu yazara ait kitaplar burada gösterilecek.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end mt-6 pt-4 border-t">
                            <button type="button" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-button hover:bg-gray-300 transition-colors flex items-center mr-3" onclick="closeAuthorDetailsModal()">
                                <i class="ri-close-line mr-1"></i>
                                <span>Kapat</span>
                            </button>
                            <button type="button" class="px-4 py-2 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors flex items-center shadow-md" onclick="editAuthor('${author.id}')">
                                <i class="ri-edit-line mr-1"></i>
                                <span>Düzenle</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Modalı DOM'a ekle
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    }).catch(error => {
        console.error('Yazar bilgileri alınırken hata:', error);
        showNotification('Yazar bilgileri alınırken bir hata oluştu', 'error');
    });
}

// Yazar detay modalını kapat
function closeAuthorDetailsModal() {
    const modal = document.getElementById('authorDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// ID'ye göre yazar getir
async function getAuthorById(authorId) {
    try {
        const { data, error } = await window.supabaseClient
            .from('authors')
            .select('*')
            .eq('id', authorId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Yazar bilgileri alınırken hata:', error);
        return null;
    }
}

// ID'ye göre yazar sil
async function deleteAuthorById(authorId) {
    try {
        // Önce bu yazara ait kitapları kontrol et
        const { data: books, error: booksError } = await window.supabaseClient
            .from('books')
            .select('id')
            .eq('author_id', authorId);
        
        if (booksError) throw booksError;
        
        // Eğer yazara ait kitaplar varsa silme
        if (books && books.length > 0) {
            showNotification('Bu yazara ait kitaplar olduğu için silinemez', 'error');
            return false;
        }
        
        // Yazarı sil
        const { error } = await window.supabaseClient
            .from('authors')
            .delete()
            .eq('id', authorId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Yazar silinirken hata:', error);
        return false;
    }
}

// Modal açma fonksiyonu
function openModal() {
    // Form alanlarını temizle
    document.getElementById('authorId').value = '';
    document.getElementById('authorName').value = '';
    document.getElementById('authorBio').value = '';
    
    // Yazar fotoğrafını sıfırla
    const authorPreview = document.getElementById('authorPreview');
    if (authorPreview) {
        authorPreview.src = 'https://via.placeholder.com/300x400';
    }
    
    // Modalı aç
    document.getElementById('addAuthorModal').classList.remove('hidden');
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Modal başlığını güncelle
    document.getElementById('modalTitle').textContent = 'Yeni Yazar Ekle';
    document.getElementById('saveButton').textContent = 'Ekle';
}

// Modal kapatma fonksiyonu
function closeModal() {
    document.getElementById('addAuthorModal').classList.add('hidden');
    document.getElementById('modalOverlay').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

// Event listener'ları ayarla
function setupEventListeners() {
    // Arama kutusu
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            loadAuthors();
        }, 500));
    }
    
    // Durum filtresi
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            loadAuthors();
        });
    }
    
    // Sıralama filtresi
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            loadAuthors();
        });
    }
    
    // Filtreleri temizle butonu
    const clearFilters = document.getElementById('clearFilters');
    if (clearFilters) {
        clearFilters.addEventListener('click', function() {
            // Tüm filtreleri sıfırla
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (sortFilter) sortFilter.value = 'name_asc';
            
            // Yazarları yeniden yükle
            loadAuthors();
        });
    }
    
    // Yazar formu
    const authorForm = document.getElementById('addAuthorForm');
    if (authorForm) {
        authorForm.addEventListener('submit', handleAuthorFormSubmit);
    }
    
    // Yazar fotoğrafı yükleme
    const photoInput = document.getElementById('authorPhoto');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
}

// Yazar formu gönderimi
async function handleAuthorFormSubmit(e) {
    e.preventDefault();
    
    // Form validasyonu
    const authorNameInput = document.getElementById('authorName');
    let isValid = true;
    
    if (!authorNameInput || !authorNameInput.value.trim()) {
        if (authorNameInput) {
            authorNameInput.classList.add('border-red-500');
            authorNameInput.classList.add('ring-red-500');
        }
        isValid = false;
    } else if (authorNameInput) {
        authorNameInput.classList.remove('border-red-500');
        authorNameInput.classList.remove('ring-red-500');
        }
    
    if (!isValid) {
        showNotification('Lütfen tüm zorunlu alanları doldurun', 'error');
        return;
    }
    
    // Yazar verileri
    const authorId = document.getElementById('authorId').value;
    const isEditing = authorId !== '';
    
    // Fotoğraf URL'sini kontrol et
    const authorPreview = document.getElementById('authorPreview');
    let photoUrl = '';
    
    if (authorPreview) {
        // Önce data-base64 özniteliğini kontrol et
        photoUrl = authorPreview.getAttribute('data-base64') || authorPreview.src;
        
        // Data URL'leri ayıkla, çünkü çok uzun olabilirler ve veritabanında saklamak yerine storage'a yüklemek daha iyi olur
        if (photoUrl.startsWith('data:') && photoUrl.length > 1000) {
            console.log('Fotoğraf Data URL formatında, kısaltılıyor');
            // Gerçek uygulamada burada Storage API'ye yükleme yapılmalı
            // Şimdilik data URL'i olduğu gibi kullanacağız
        }
    }
    
    const authorData = {
        name: authorNameInput.value.trim(),
        bio: document.getElementById('authorBio').value || '',
        photo_url: photoUrl
        // is_active sütunu veritabanında bulunmadığı için kaldırıldı
    };
    
    console.log('Gönderilecek yazar verileri:', authorData);
    
    try {
        let result;
        
        if (isEditing) {
            // Yazarı güncelle
            result = await updateAuthor(authorId, authorData);
            if (result) {
                showNotification('Yazar başarıyla güncellendi', 'success');
            } else {
                showNotification('Yazar güncellenirken bir hata oluştu', 'error');
                return;
            }
        } else {
            // Yeni yazar ekle
            result = await addAuthor(authorData);
            if (result) {
                showNotification('Yazar başarıyla eklendi', 'success');
            } else {
                showNotification('Yazar eklenirken bir hata oluştu', 'error');
                return;
            }
        }
        
        // Başarılı işlem sonrası
        loadAuthors(); // Yazarları yeniden yükle
        closeModal();
    } catch (error) {
        console.error('Yazar kaydedilirken hata:', error);
        showNotification('Yazar kaydedilirken bir hata oluştu: ' + error.message, 'error');
    }
}

// Yazar fotoğrafı yükleme
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Dosya boyutunu kontrol et (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Dosya boyutu çok büyük (max 5MB)', 'error');
        return;
    }
    
    // Dosya türünü kontrol et
    if (!file.type.match('image.*')) {
        showNotification('Lütfen geçerli bir görsel dosyası seçin', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Görseli ön izleme için göster
        const previewImage = document.getElementById('authorPreview');
        if (previewImage) {
        previewImage.src = e.target.result;
            // Base64 veriyi öznitelik olarak kaydet
        previewImage.setAttribute('data-base64', e.target.result);
        console.log('Görsel yüklendi ve ön izleme gösteriliyor');
        } else {
            console.error('authorPreview elementi bulunamadı');
        }
    };
    reader.readAsDataURL(file);
}

// Yeni yazar ekle
async function addAuthor(authorData) {
    try {
        console.log('Eklenecek yazar verileri:', authorData);
        
        // Supabase bağlantısını kontrol et
        if (!window.supabaseClient) {
            console.error('supabaseClient bulunamadı!');
            showNotification('Supabase bağlantısı kurulamadı', 'error');
            return null;
        }
        
        // Direkt Supabase'e erişmeyi dene
        const { data, error } = await window.supabaseClient
            .from('authors')
            .insert([authorData])
            .select();
            
        if (error) {
            console.error('Direkt Supabase ile yazar eklerken hata:', error);
            throw error;
        }
        
        const addedAuthor = data[0];
        console.log('Yazar başarıyla eklendi:', addedAuthor);
        
        // Bildirim göster
        showNotification('Yazar başarıyla eklendi', 'success');
        
        return addedAuthor;
    } catch (error) {
        console.error('Yazar eklenirken hata detayları:', error);
        showNotification(`Yazar eklenirken hata: ${error.message || 'Bilinmeyen hata'}`, 'error');
        return null;
    }
}

// Yazar güncelle
async function updateAuthor(authorId, authorData) {
    try {
        console.log('Güncellenecek yazar ID:', authorId);
        console.log('Güncellenecek yazar verileri:', authorData);
        
        // Supabase bağlantısını kontrol et
        if (!window.supabaseClient) {
            console.error('supabaseClient bulunamadı!');
            showNotification('Supabase bağlantısı kurulamadı', 'error');
            return null;
        }
        
        // Direkt Supabase'e erişmeyi dene
        const { data, error } = await window.supabaseClient
            .from('authors')
            .update(authorData)
            .eq('id', authorId)
            .select();
            
        if (error) {
            console.error('Direkt Supabase ile yazar güncellerken hata:', error);
            throw error;
        }
        
        const updatedAuthor = data[0];
        console.log('Yazar başarıyla güncellendi:', updatedAuthor);
        
        // Bildirim göster
        showNotification('Yazar başarıyla güncellendi', 'success');
        
        return updatedAuthor;
    } catch (error) {
        console.error('Yazar güncellenirken hata detayları:', error);
        showNotification(`Yazar güncellenirken hata: ${error.message || 'Bilinmeyen hata'}`, 'error');
        return null;
    }
}

// Gerçek zamanlı güncellemeleri ayarla
function setupRealtimeUpdates() {
    try {
        // Yazarlar için gerçek zamanlı güncellemeler
        if (window.supabaseClient) {
            const authorsChannel = window.supabaseClient.channel('public:authors')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'authors' },
                    async (payload) => {
                        console.log('Yazarlar güncellendi:', payload);
                        
                        // Yazarları yeniden yükle
                        await loadAuthors();
                    }
                )
                .subscribe();
                
            console.log('Yazarlar için gerçek zamanlı güncellemeler başlatıldı');
        }
        
        // Admin panelinden gelen olayları dinle
        window.addEventListener('author-added', async (event) => {
            console.log('Yeni yazar eklendi olayı alındı:', event.detail);
            await loadAuthors();
        });
        
        // Mock Supabase insert olaylarını dinle
        window.addEventListener('supabase-insert', async (event) => {
            if (event.detail && event.detail.table === 'authors') {
                console.log('Mock Supabase: Yazar eklendi olayı alındı:', event.detail);
                await loadAuthors();
            }
        });
        
        // Broadcast Channel dinleyicisi
        try {
            const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
            broadcastChannel.onmessage = async (event) => {
                console.log('Broadcast mesajı alındı:', event.data);
                
                if (event.data.type === 'author') {
                    await loadAuthors();
                }
            };
            
            console.log('Broadcast dinleyici başlatıldı');
        } catch (e) {
            console.warn('Broadcast Channel başlatılamadı:', e);
        }
    } catch (error) {
        console.error('Gerçek zamanlı güncellemeler başlatılırken hata:', error);
    }
}

// Debounce fonksiyonu
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
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

// Dosya yükleme fonksiyonu
async function uploadAuthorPhoto(file) {
    try {
        if (!file) return null;
        
        // Dosya formatını kontrol et
        if (!file.type.match('image.*')) {
            showNotification('Lütfen bir resim dosyası seçin', 'error');
            return null;
        }
        
        // Dosya boyutunu kontrol et (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Dosya boyutu çok büyük (max 5MB)', 'error');
            return null;
        }
        
        // Gerçek bir uygulamada, burada dosyayı bir sunucuya veya Supabase Storage'a yüklersiniz
        // Şimdilik sadece bir data URL döndüreceğiz
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Normalde burada yüklenen dosyanın URL'si döner
                // Şimdilik placeholder kullanıyoruz
                resolve('../images/placeholder.png');
            };
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('Dosya yüklenirken hata:', error);
        showNotification('Dosya yüklenirken bir hata oluştu', 'error');
        return null;
    }
}
