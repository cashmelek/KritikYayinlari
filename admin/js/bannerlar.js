// Bannerlar JS - Kritik Yayınları Admin Paneli

// Banner yönetimi için gerekli fonksiyonlar
let banners = [];
let filteredBanners = [];
let bannerImageFile = null;

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    // Supabase bağlantısını kontrol et
    if (!window.supabaseClient) {
        console.error('Supabase bağlantısı bulunamadı!');
        showNotification('Veritabanı bağlantısı kurulamadı. Lütfen sayfayı yenileyin.', 'error');
        return;
    }
    
    // Banner verilerini yükle
    loadBanners();
    
    // Modal açma butonu
    const addBannerBtn = document.getElementById('addBannerButton');
    if (addBannerBtn) {
        addBannerBtn.addEventListener('click', () => {
            openAddBannerModal();
        });
    }
    
    // Resim yükleme fonksiyonlarını başlat
    initializeImageUpload();
    
    // Hedef türü değiştiğinde gösterilecek alanları güncelle
    const targetTypeSelect = document.getElementById('bannerTargetType');
    if (targetTypeSelect) {
        targetTypeSelect.addEventListener('change', updateTargetFields);
    }
    
    // Form gönderimi
    const addBannerForm = document.getElementById('addBannerForm');
    if (addBannerForm) {
        addBannerForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Arama, filtreleme ve sıralama
    setupFilters();
});

// Hedef türüne göre form alanlarını güncelle
function updateTargetFields() {
    const targetType = document.getElementById('bannerTargetType').value;
    const targetIdContainer = document.getElementById('targetIdContainer');
    const linkContainer = document.getElementById('linkContainer');
    
    if (targetType === 'yazar' || targetType === 'yazar_kitaplari') {
        // Yazar hedefi seçildiyse, yazar ID alanını göster, link alanını gizle
        targetIdContainer.classList.remove('hidden');
        linkContainer.classList.add('hidden');
        
        // Etiket metnini güncelle
        const targetIdLabel = document.querySelector('label[for="bannerTargetId"]');
        if (targetIdLabel) {
            targetIdLabel.textContent = 'Yazar ID';
        }
        
        // Açıklama metnini güncelle
        const targetIdHelpText = targetIdContainer.querySelector('.text-xs.text-gray-500');
        if (targetIdHelpText) {
            targetIdHelpText.innerHTML = targetType === 'yazar_kitaplari' 
                ? 'Yazarın <strong>sadece kitaplarını</strong> gösterecek sayfaya yönlendirir.'
                : 'Yazarın <strong>profil sayfasına</strong> yönlendirir.';
        }
    } else {
        // Standart hedef (link) seçildiyse, link alanını göster, yazar ID alanını gizle
        linkContainer.classList.remove('hidden');
        targetIdContainer.classList.add('hidden');
    }
}

// Resim yükleme işlevini başlat
function initializeImageUpload() {
    const imagePreview = document.getElementById('imagePreview');
    const bannerImage = document.getElementById('bannerImage');
    
    if (!imagePreview || !bannerImage) return;
    
    // Resim seçme alanına tıklandığında dosya seçme
    imagePreview.addEventListener('click', () => {
        bannerImage.click();
    });
    
    // Dosya seçildiğinde önizleme gösterme
    bannerImage.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Dosya boyut kontrolü (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('Görsel boyutu 2MB\'dan küçük olmalıdır.', 'error');
                return;
            }
            
            // Dosya türü kontrolü
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showNotification('Lütfen desteklenen bir görsel formatı seçin (JPG, PNG, GIF, WEBP)', 'error');
                return;
            }
            
            bannerImageFile = file;
            
            // Yükleniyor göster
            imagePreview.innerHTML = `
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p class="text-gray-500 mt-2">Görsel işleniyor...</p>
            `;
            
            try {
                // ImageScaler modülünü kullan
                if (window.ImageScaler) {
                    // Banner tipinde optimize et (3:1 oranında)
                    const optimizedImage = await window.ImageScaler.optimizeImage(file, 'banner');
                    
                    imagePreview.innerHTML = `
                        <div class="w-full aspect-[3/1] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                            <img src="${optimizedImage.dataUrl}" alt="Banner önizleme" class="max-w-full max-h-full">
                        </div>
                        <button type="button" class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md" id="removeImageBtn">
                            <i class="ri-delete-bin-line text-red-500"></i>
                        </button>
                        <p class="text-xs text-primary mt-2 text-center">Görsel başarıyla optimize edildi (${optimizedImage.width}x${optimizedImage.height})</p>
                    `;
                    
                    // Base64 olarak sakla
                    bannerImageFile = optimizedImage.dataUrl;
                    
                    console.log('Banner görseli optimize edildi:', {
                        boyut: `${optimizedImage.width}x${optimizedImage.height}`,
                        orijinalBoyut: `${optimizedImage.originalWidth}x${optimizedImage.originalHeight}`,
                        oran: '3:1 (banner formatı)'
                    });
                } else {
                    // Eski yöntem - ImageScaler yoksa
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreview.innerHTML = `
                            <div class="w-full aspect-[3/1] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                                <img src="${e.target.result}" alt="Banner önizleme" class="max-w-full max-h-full">
                            </div>
                            <button type="button" class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md" id="removeImageBtn">
                                <i class="ri-delete-bin-line text-red-500"></i>
                            </button>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
                
                imagePreview.classList.add('has-image');
                
                // Görsel kaldırma butonu
                setTimeout(() => {
                document.getElementById('removeImageBtn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    resetImagePreview();
                });
                }, 100);
            } catch (error) {
                console.error('Görsel işlenirken hata:', error);
                resetImagePreview();
                showNotification('Görsel işlenirken bir hata oluştu: ' + error.message, 'error');
            }
        }
    });
    
    // Sürükle bırak desteği
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imagePreview.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Sürükleme efektleri
    ['dragenter', 'dragover'].forEach(eventName => {
        imagePreview.addEventListener(eventName, () => {
            imagePreview.classList.add('bg-gray-100', 'border-primary');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        imagePreview.addEventListener(eventName, () => {
            imagePreview.classList.remove('bg-gray-100', 'border-primary');
        }, false);
    });
    
    // Dosya bırakıldığında işleme
    imagePreview.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            
            // Dosya boyut kontrolü (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('Görsel boyutu 2MB\'dan küçük olmalıdır.', 'error');
                return;
            }
            
            bannerImage.files = e.dataTransfer.files;
            bannerImageFile = file;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `
                    <img src="${e.target.result}" alt="Banner önizleme" class="max-h-full">
                    <button type="button" class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md" id="removeImageBtn">
                        <i class="ri-delete-bin-line text-red-500"></i>
                    </button>
                `;
                imagePreview.classList.add('has-image');
                
                // Görsel kaldırma butonu
                document.getElementById('removeImageBtn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    resetImagePreview();
                });
            };
            reader.readAsDataURL(file);
        }
    }, false);
}

// Bannerları yükle
async function loadBanners() {
    try {
        // Yükleniyor göstergesini göster
        const bannerContainer = document.getElementById('bannersContainer');
        if (bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="col-span-full flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    <span class="ml-3 text-gray-600">Bannerlar yükleniyor...</span>
                </div>
            `;
        }
        
        // Supabase'den bannerları çek
        const { data, error } = await supabaseClient
            .from('banners')
            .select('id, title, subtitle, description, image_url, link, is_active, order_number, target_type, target_id, click_count, created_at, updated_at')
            .order('order_number', { ascending: true });
        
        if (error) {
            throw error;
        }
        
        // Banner listesini güncelle
        banners = data || [];
        filteredBanners = [...banners];
        
        console.log('Bannerlar yüklendi:', banners);
        
        // Banner istatistiklerini güncelle
        updateBannerStats();
        
        // Bannerları render et
        renderBanners(filteredBanners);
        
        // Banner olaylarını ata
        attachBannerEventListeners();
    } catch (error) {
        console.error('Bannerlar yüklenirken hata:', error);
        showNotification('Bannerlar yüklenirken bir hata oluştu: ' + error.message, 'error');
        
        // Hata durumunda boş bir konteyner göster
        const bannerContainer = document.getElementById('bannersContainer');
        if (bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <div class="text-red-400 text-6xl mb-4">
                        <i class="ri-error-warning-line"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-500 mb-2">Bannerlar Yüklenemedi</h3>
                    <p class="text-gray-400 mb-4">Lütfen daha sonra tekrar deneyin veya sayfayı yenileyin.</p>
                    <button id="retryLoadBannersBtn" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="ri-refresh-line mr-1"></i> Yeniden Dene
                    </button>
                </div>
            `;
            
            // Yeniden deneme butonu
            document.getElementById('retryLoadBannersBtn')?.addEventListener('click', loadBanners);
        }
    }
}

// İstatistikleri güncelle
function updateBannerStats() {
    // İstatistik kartları
    const totalBannerElement = document.querySelector('.banner-stats-total');
    const activeBannerElement = document.querySelector('.banner-stats-active');
    const inactiveBannerElement = document.querySelector('.banner-stats-inactive');
    const totalClicksElement = document.querySelector('.banner-stats-clicks');
    
    if (totalBannerElement) {
        totalBannerElement.textContent = banners.length;
    }
    
    if (activeBannerElement) {
        // Aktif banner sayısı
        const activeBanners = banners.filter(banner => banner.is_active === true);
        activeBannerElement.textContent = activeBanners.length;
    }
    
    if (inactiveBannerElement) {
        // Pasif banner sayısı
        const inactiveBanners = banners.filter(banner => banner.is_active === false);
        inactiveBannerElement.textContent = inactiveBanners.length;
    }
    
    if (totalClicksElement) {
        // Toplam tıklama sayısı
        const totalClicks = banners.reduce((total, banner) => total + (banner.click_count || 0), 0);
        totalClicksElement.textContent = totalClicks;
    }
}

// Bannerları render et
function renderBanners(bannersToRender) {
    const bannerContainer = document.getElementById('bannersContainer');
    if (!bannerContainer) return;
    
    if (!bannersToRender || bannersToRender.length === 0) {
        bannerContainer.innerHTML = `
            <div class="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <div class="text-gray-400 text-6xl mb-4">
                    <i class="ri-image-line"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-500 mb-2">Henüz Banner Bulunmuyor</h3>
                <p class="text-gray-400 mb-4">Yeni bir banner ekleyin veya mevcut bannerları düzenleyin.</p>
                <button id="addBannerBtnEmpty" class="bg-primary hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="ri-add-line mr-1"></i> Yeni Banner Ekle
                </button>
            </div>
        `;
        
        document.getElementById('addBannerBtnEmpty')?.addEventListener('click', openAddBannerModal);
        return;
    }
    
    // HTML oluştur
    let cardsHTML = '';
    
    // Her banner için kart oluştur
    bannersToRender.forEach(banner => {
        const createdDate = new Date(banner.created_at).toLocaleDateString('tr-TR');
        const imageUrl = banner.image_url || 'https://via.placeholder.com/300x150?text=Banner+G%C3%B6rseli';
        const isActive = banner.is_active;
        
        // Hedef türü ve bağlantı bilgisi
        let targetInfo = '';
        if (banner.target_type === 'yazar') {
            targetInfo = `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Yazar ID: ${banner.target_id || 'Belirsiz'}</span>`;
        } else if (banner.target_type === 'yazar_kitaplari') {
            targetInfo = `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Yazarın Kitapları ID: ${banner.target_id || 'Belirsiz'}</span>`;
        } else if (banner.link) {
            targetInfo = `<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">${truncateText(banner.link, 30)}</span>`;
        } else {
            targetInfo = `<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Bağlantı Yok</span>`;
        }
        
        cardsHTML += `
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <!-- Banner Görsel -->
                <div class="aspect-[3/1] relative overflow-hidden bg-gray-100">
                    <img src="${imageUrl}" alt="${banner.title}" class="w-full h-full object-cover">
                    <div class="absolute top-2 right-2 flex space-x-1">
                        <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}">
                            ${isActive ? 'Aktif' : 'Pasif'}
                        </span>
                        <span class="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            Sıra: ${banner.order_number || 0}
                        </span>
                    </div>
                </div>
                
                <!-- Banner İçerik -->
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">${banner.title}</h3>
                    <p class="text-sm text-gray-500 mb-3 line-clamp-2">${banner.subtitle || ''}</p>
                    
                    <!-- Hedef Bilgisi -->
                    <div class="mb-3">
                        ${targetInfo}
                    </div>
                    
                    <!-- İstatistikler -->
                    <div class="flex items-center text-sm text-gray-500 mb-4">
                        <div class="flex items-center mr-4">
                            <i class="ri-eye-line mr-1"></i>
                            <span>${banner.click_count || 0} tıklama</span>
                        </div>
                        <div class="flex items-center">
                            <i class="ri-calendar-line mr-1"></i>
                            <span>${createdDate}</span>
                        </div>
                    </div>
                    
                    <!-- İşlem Butonları -->
                    <div class="flex space-x-2">
                        <button class="edit-banner flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded transition-colors" data-id="${banner.id}">
                            <i class="ri-edit-line mr-1"></i> Düzenle
                        </button>
                        <button class="toggle-banner flex-1 ${isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' : 'bg-green-50 hover:bg-green-100 text-green-600'} px-3 py-1.5 rounded transition-colors" data-id="${banner.id}">
                            <i class="ri-${isActive ? 'pause-line' : 'play-line'} mr-1"></i> ${isActive ? 'Durdur' : 'Aktifleştir'}
                        </button>
                        <button class="delete-banner bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded transition-colors" data-id="${banner.id}">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    // HTML'i konteyner içine yerleştir
    bannerContainer.innerHTML = cardsHTML;
    
    // Event listener'ları ekle
    attachBannerEventListeners();
}

// Metin kısaltma fonksiyonu
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Konum değerine göre etiket döndür
function getLabelForLocation(location) {
    switch (location) {
        case 'homepage':
            return 'Ana Sayfa';
        case 'books':
            return 'Kitaplar';
        case 'authors':
            return 'Yazarlar';
        case 'all':
            return 'Tüm Sayfalar';
        default:
            return location;
    }
}

// Banner işlem butonları için event listener'lar
function attachBannerEventListeners() {
    // Düzenleme butonları
    document.querySelectorAll('.edit-banner').forEach(btn => {
        btn.addEventListener('click', () => {
            const bannerId = btn.dataset.id;
            editBanner(bannerId);
        });
    });
    
    // Durum değiştirme butonları
    document.querySelectorAll('.toggle-banner').forEach(btn => {
        btn.addEventListener('click', () => {
            const bannerId = btn.dataset.id;
            toggleBannerStatus(bannerId);
        });
    });
    
    // Silme butonları
    document.querySelectorAll('.delete-banner').forEach(btn => {
        btn.addEventListener('click', () => {
            const bannerId = btn.dataset.id;
            deleteBanner(bannerId);
        });
    });
}

// Banner durumunu değiştir
async function toggleBannerStatus(bannerId) {
    try {
        // Banner'ı bul
        const banner = banners.find(b => b.id == bannerId);
        if (!banner) {
            throw new Error('Banner bulunamadı');
        }
        
        // Durumu tersine çevir
        const newStatus = !banner.is_active;
        
        // Supabase'de güncelle
        const { error } = await supabaseClient
            .from('banners')
            .update({ is_active: newStatus, updated_at: new Date().toISOString() })
            .eq('id', bannerId);
        
        if (error) {
            throw error;
        }
        
        // Yerel banner listesini güncelle
        banner.is_active = newStatus;
        
        // Bildirim göster
        showNotification(`Banner durumu ${newStatus ? 'aktif' : 'pasif'} olarak değiştirildi.`, 'success');
        
        // Banner listesini yeniden render et
        renderBanners(filteredBanners);
    } catch (error) {
        console.error('Banner durumu değiştirilirken hata:', error);
        showNotification('Banner durumu değiştirilirken bir hata oluştu: ' + error.message, 'error');
    }
}

// Banner sil
async function deleteBanner(bannerId) {
    // Onay al
    if (!confirm('Bu banner\'ı silmek istediğinize emin misiniz?')) {
        return;
    }
    
    try {
        // Supabase'den sil
        const { error } = await supabaseClient
            .from('banners')
            .delete()
            .eq('id', bannerId);
            
        if (error) throw error;
        
        // Başarılı bildirim
        showNotification('Banner başarıyla silindi', 'success');
        
        // Verileri yeniden yükle
        loadBanners();
        
    } catch (error) {
        console.error('Banner silinirken hata:', error);
        showNotification('Banner silinirken bir hata oluştu', 'error');
    }
}

// Modalı kapat
function closeModal() {
    const modal = document.getElementById('addBannerModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Sayfa scrollunu aktifleştir
    }
}

// Banner ekleme modalını aç
function openAddBannerModal() {
    // Form ve modal elementlerini al
    const modal = document.getElementById('addBannerModal');
    const form = document.getElementById('addBannerForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !form) return;
    
    // Form başlığını güncelle
    if (modalTitle) {
        modalTitle.textContent = 'Yeni Banner Ekle';
    }
        
    // Form içeriğini sıfırla
        resetForm();
        
    // Görsel önizleme alanını düzgünce göster
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.classList.remove('hidden');
    }
    
    // Gönder butonunu güncelle
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Ekle';
    }
    
    // Modalı göster
    modal.classList.remove('hidden');
    modal.classList.add('active');
        
    // ESC tuşu ile kapatma
    const escKeyHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escKeyHandler);
        }
    };
    document.addEventListener('keydown', escKeyHandler);
}

// Banner düzenleme işlemi
async function editBanner(bannerId) {
    try {
        // Bannerı bul
        const banner = banners.find(b => b.id == bannerId);
        if (!banner) {
            throw new Error('Düzenlenecek banner bulunamadı');
        }
        
        console.log('Düzenlenecek banner verileri:', banner);
        
        // Modal başlığını güncelle
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Banner Düzenle';
        }
        
        // Form alanlarını doldur
        const form = document.getElementById('addBannerForm');
        if (form) {
            // Banner ID'sini forma ekle
            form.setAttribute('data-banner-id', banner.id);
            
            // Form alanlarını doldur
            document.getElementById('bannerTitle').value = banner.title || '';
            document.getElementById('bannerSubtitle').value = banner.subtitle || '';
            document.getElementById('bannerDescription').value = banner.description || '';
            document.getElementById('bannerLink').value = banner.link || '';
            document.getElementById('bannerOrder').value = banner.order_number || '';
            
            // Aktif durumu
            document.getElementById('isActive').checked = banner.is_active || false;
            
            // Target type ve id ayarla
            const targetTypeSelect = document.getElementById('bannerTargetType');
            if (targetTypeSelect) {
                targetTypeSelect.value = banner.target_type || '';
            }
            
            const targetIdInput = document.getElementById('bannerTargetId');
            if (targetIdInput) {
                targetIdInput.value = banner.target_id || '';
            }
            
            // Hedef alanlarını güncelle
            updateTargetFields();
            
            // Resmi göster
            if (banner.image_url) {
                const imagePreview = document.getElementById('imagePreview');
                if (imagePreview) {
                    imagePreview.innerHTML = `
                        <div class="relative group">
                            <img src="${banner.image_url}" alt="${banner.title}" class="w-full h-auto rounded-lg object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <button type="button" class="bg-white text-red-500 p-2 rounded-full hover:bg-red-100 transition" onclick="removeImage()">
                                    <i class="ri-delete-bin-line text-xl"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    imagePreview.classList.remove('hidden');
                }
            }
        }
        
        // Modalı aç
        const modal = document.getElementById('addBannerModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // ESC tuşu ile modalı kapatma
            const escKeyHandler = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escKeyHandler);
                }
            };
            document.addEventListener('keydown', escKeyHandler);
        }
    } catch (error) {
        console.error('Banner düzenleme hatası:', error);
        showNotification('Banner düzenlenirken bir hata oluştu: ' + error.message, 'error');
    }
}

// Form gönderildiğinde
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Form elementlerini al
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formTitle = document.getElementById('modalTitle');
    const isEditMode = formTitle?.textContent.includes('Düzenle');
    
    // Buton durumunu güncelle
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> Kaydediliyor...`;
    }
    
    try {
        // Form verilerini al
        const title = form.querySelector('#bannerTitle')?.value.trim();
        const subtitle = form.querySelector('#bannerSubtitle')?.value.trim();
        const description = form.querySelector('#bannerDescription')?.value.trim();
        const targetType = form.querySelector('#bannerTargetType')?.value.trim();
        const targetId = form.querySelector('#bannerTargetId')?.value.trim();
        const link = form.querySelector('#bannerLink')?.value.trim();
        const orderNumber = parseInt(form.querySelector('#bannerOrder')?.value || '0');
        const isActive = form.querySelector('#isActive')?.checked || false;
        
        // Validation
        if (!title) {
            throw new Error('Banner başlığı gereklidir.');
        }
        
        // Hedef türüne göre validasyon
        if ((targetType === 'yazar' || targetType === 'yazar_kitaplari') && !targetId) {
            throw new Error('Yazar ID alanı boş bırakılamaz.');
        }

        // Banner ID (düzenleme modu için)
        const bannerId = form.getAttribute('data-banner-id');
        
        // Görsel kontrolü
        let imageUrl = null;
        
        // Düzenleme modunda ve görsel değiştirilmediyse, mevcut URL'yi kullan
        if (isEditMode && !bannerImageFile && bannerId) {
            const existingBanner = banners.find(b => b.id == bannerId);
            if (existingBanner) {
                imageUrl = existingBanner.image_url;
            }
        } else if (bannerImageFile === 'remove') {
            // Görsel kaldırılmak isteniyorsa null olarak ayarla
            imageUrl = null;
        } else if (bannerImageFile) {
            // Yeni görsel yükleme
            if (typeof bannerImageFile === 'string' && bannerImageFile.startsWith('data:')) {
                // Base64 formatında zaten
                imageUrl = bannerImageFile;
            } else {
                // Dosya nesnesini base64'e dönüştür
                imageUrl = await convertFileToBase64(bannerImageFile);
            }
        }
        
        // Yeni banner eklerken görsel kontrolü yap
        if (!isEditMode && !imageUrl) {
            throw new Error('Lütfen bir banner görseli seçiniz.');
        }
        
        // Banner verisi oluştur
        const bannerData = {
            title,
            subtitle,
            description,
            is_active: isActive,
            order_number: orderNumber,
            updated_at: new Date().toISOString()
        };
        
        // Hedef türü ve ID'si
        if (targetType === 'yazar' || targetType === 'yazar_kitaplari') {
            bannerData.target_type = targetType;
            bannerData.target_id = targetId;
            bannerData.link = null; // Yazar hedefiyse link alanını temizle
        } else {
            bannerData.target_type = null;
            bannerData.target_id = null;
            bannerData.link = link;
        }
        
        // Eğer görsel varsa veya kaldırılmak isteniyorsa ekle
        if (bannerImageFile === 'remove') {
            // Görsel kaldırılıyor
            bannerData.image_url = null;
        } else if (imageUrl) {
            bannerData.image_url = imageUrl;
        }
        
        console.log('Kaydedilecek banner verisi:', bannerData);
        console.log('Banner ID:', bannerId);
        console.log('Düzenleme modu:', isEditMode);
        
        let result;
        
        // Düzenleme veya ekleme işlemi
        if (isEditMode && bannerId) {
            // Banner güncelleme
            result = await supabaseClient
                .from('banners')
                .update(bannerData)
                .eq('id', bannerId);
                
            console.log('Güncelleme sonucu:', result);
        } else {
            // Yeni banner ekleme
            bannerData.created_at = new Date().toISOString();
            bannerData.click_count = 0;
            
            result = await supabaseClient
                .from('banners')
                .insert([bannerData]);
                
            console.log('Ekleme sonucu:', result);
        }
        
        const { error } = result;
        
        if (error) {
            throw new Error(`Banner ${isEditMode ? 'güncellenirken' : 'eklenirken'} bir hata oluştu: ${error.message}`);
        }
        
        // Başarılı mesajı göster
        showNotification(`Banner başarıyla ${isEditMode ? 'güncellendi' : 'eklendi'}.`, 'success');
        
        // Modalı kapat ve listeyi yenile
        closeModal();
        
        // Form sıfırla
        resetForm();
        
        // Banner listesini yenile
        loadBanners();
        
    } catch (error) {
        console.error('Form gönderilirken hata:', error);
        showNotification(error.message, 'error');
    } finally {
        // Buton durumunu eski haline getir
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = isEditMode ? 'Güncelle' : 'Ekle';
        }
    }
}

// Form alanlarını sıfırla
function resetForm() {
    const form = document.getElementById('addBannerForm');
    if (!form) return;
    
    // Form verilerini temizle
    form.reset();
    
    // Banner ID'sini kaldır
    form.removeAttribute('data-banner-id');
    
    // Resim önizleme alanını sıfırla
    resetImagePreview();
    
    // Hedef türünü sıfırla
    const targetTypeSelect = document.getElementById('bannerTargetType');
    if (targetTypeSelect) {
        targetTypeSelect.value = '';
    }
    
    // Hedef ID ve link alanlarını düzenle
    updateTargetFields();
    
    // Hata mesajlarını temizle
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    
    // Gönder butonunu sıfırla
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Kaydet';
    }
}

// Dosyayı base64'e çevir
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Görsel önizlemeyi sıfırla
function resetImagePreview() {
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        // Önce mevcut içeriği temizle
        imagePreview.innerHTML = `
            <i class="ri-image-add-line text-3xl text-gray-400"></i>
            <p class="text-sm text-gray-500 mt-2">Görsel seçmek için tıklayın veya sürükleyin</p>
            <p class="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Max. 2MB)</p>
        `;
        imagePreview.classList.remove('has-image');
        imagePreview.classList.remove('hidden');
    }
    
    // Resim dosyasını sıfırla
    bannerImageFile = null;
    
    // Resim girişi elementini sıfırla (yeniden oluşturmadan)
    const bannerImageInput = document.getElementById('bannerImage');
    if (bannerImageInput) {
        bannerImageInput.value = '';
    }
}

// Resmi kaldır (düzenleme modunda)
function removeImage() {
    // Görsel önizlemeyi sıfırla
    resetImagePreview();
    // Banner içerisindeki resmi null olarak işaretle (güncelleme sırasında kaldırılacak)
    bannerImageFile = 'remove';
}

// Arama, filtreleme ve sıralama
function setupFilters() {
    // Arama
    const searchInput = document.querySelector('input[placeholder="Banner ara..."]');
    if (searchInput) {
        searchInput.addEventListener('input', filterBanners);
    }
    
    // Konum filtresi
    const locationFilter = document.querySelector('select:has(option[value="homepage"])');
    if (locationFilter) {
        locationFilter.addEventListener('change', filterBanners);
    }
    
    // Durum filtresi
    const statusFilter = document.querySelector('select:has(option[value="active"])');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterBanners);
    }
    
    // Sıralama
    const sortSelect = document.querySelector('select:has(option[value="newest"])');
    if (sortSelect) {
        sortSelect.addEventListener('change', filterBanners);
    }
}

// Bannerlara filtre uygula
function filterBanners() {
    // Filtre değerlerini al
    const searchTerm = document.querySelector('input[placeholder="Banner ara..."]')?.value.toLowerCase() || '';
    const locationFilter = document.querySelector('select:has(option[value="homepage"])')?.value || '';
    const statusFilter = document.querySelector('select:has(option[value="active"])')?.value || '';
    const sortBy = document.querySelector('select:has(option[value="newest"])')?.value || 'newest';
    
    // Filtreleme
    filteredBanners = banners.filter(banner => {
        // Arama terimiyle eşleşme
        const matchesSearch = banner.title.toLowerCase().includes(searchTerm) || 
                             (banner.description && banner.description.toLowerCase().includes(searchTerm));
        
        // Konum filtresi
        const matchesLocation = !locationFilter || banner.location === locationFilter;
        
        // Durum filtresi
        const matchesStatus = !statusFilter || banner.is_active === (statusFilter === 'active');
        
        return matchesSearch && matchesLocation && matchesStatus;
    });
    
    // Sıralama
    sortBanners(sortBy);
    
    // Sonuçları göster
    renderBanners(filteredBanners);
}

// Bannerlara sıralama uygula
function sortBanners(sortBy) {
    switch (sortBy) {
        case 'newest':
            filteredBanners.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredBanners.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'mostClicked':
            filteredBanners.sort((a, b) => (b.click_count || 0) - (a.click_count || 0));
            break;
        case 'leastClicked':
            filteredBanners.sort((a, b) => (a.click_count || 0) - (b.click_count || 0));
            break;
    }
}

// Bildirim göster
function showNotification(message, type = 'success') {
    // Eğer bildirim konteyner yoksa oluştur
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
        document.body.appendChild(notificationContainer);
    }
    
    // Bildirim elementi oluştur
    const notification = document.createElement('div');
    notification.className = `flex items-center px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Bildirim tipine göre stil belirle
    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500', 'text-white');
    } else if (type === 'warning') {
        notification.classList.add('bg-yellow-500', 'text-white');
    } else {
        notification.classList.add('bg-blue-500', 'text-white');
    }
    
    // Bildirim içeriğini oluştur
    notification.innerHTML = `
        <i class="ri-${type === 'success' ? 'check' : type === 'error' ? 'close' : 'information'}-line mr-2"></i>
        <span>${message}</span>
    `;
    
    // Bildirim konteynerine ekle
    notificationContainer.appendChild(notification);
    
    // Animasyon için gecikme
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    // Bildirimi otomatik kapat
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 