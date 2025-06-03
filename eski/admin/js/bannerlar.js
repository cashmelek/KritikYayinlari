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
    const addBannerBtn = document.getElementById('addBannerBtn');
    if (addBannerBtn) {
        addBannerBtn.addEventListener('click', () => {
            openAddBannerModal();
        });
    }
    
    // Resim yükleme
    const imagePreview = document.getElementById('imagePreview');
    const bannerImage = document.getElementById('bannerImage');
    
    if (imagePreview && bannerImage) {
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
                                <img src="${e.target.result}" alt="Banner önizleme" class="max-h-full">
                                <button type="button" class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md" id="removeImageBtn">
                                    <i class="ri-delete-bin-line text-red-500"></i>
                                </button>
                            `;
                            imagePreview.classList.add('has-image');
                        };
                        reader.readAsDataURL(file);
                    }
                    
                    imagePreview.classList.add('has-image');
                    
                    // Görsel kaldırma butonu
                    document.getElementById('removeImageBtn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        resetImagePreview();
                    });
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
    
    // Form gönderimi
    const addBannerForm = document.getElementById('addBannerForm');
    if (addBannerForm) {
        addBannerForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Arama, filtreleme ve sıralama
    setupFilters();
});

// Banner verilerini yükle
async function loadBanners() {
    try {
        // Yükleniyor göstergesini göster
        const bannerContainer = document.getElementById('bannerContainer');
        if (bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="col-span-full flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <span class="ml-3 text-gray-600">Bannerlar yükleniyor...</span>
                </div>
            `;
        }
        
        // Banners tablosunu kontrol et
        const { data, error } = await supabaseClient
            .from('banners')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            // Tablo yoksa veya erişilemiyorsa uyarı göster
            bannerContainer.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div class="text-yellow-500 text-5xl mb-4">
                        <i class="ri-alert-line"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">Banner Tablosu Bulunamadı</h3>
                    <p class="text-gray-500 mb-2 text-center max-w-lg">Banner tablosu henüz oluşturulmamış. Lütfen Supabase panelinizden aşağıdaki SQL kodunu çalıştırın:</p>
                    <div class="bg-gray-800 text-green-400 p-4 rounded-lg my-4 w-full max-w-2xl overflow-auto">
                        <pre>CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  image_url TEXT,
  link TEXT,
  click_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);</pre>
                    </div>
                </div>
            `;
            console.error('Banner tablosu yüklenemedi:', error);
            return;
        }
        
        // Banner verilerini kaydet
        banners = data || [];
        filteredBanners = [...banners];
        
        // İstatistikleri güncelle
        updateBannerStats();
        
        // Banner kartlarını oluştur
        renderBanners(banners);
        
    } catch (error) {
        console.error('Bannerlar yüklenirken hata:', error);
        showNotification('Bannerlar yüklenirken bir hata oluştu', 'error');
        
        // Hata mesajını göster
        const bannerContainer = document.getElementById('bannerContainer');
        if (bannerContainer) {
            bannerContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-500 text-6xl mb-4">
                        <i class="ri-error-warning-line"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">Veriler Yüklenemedi</h3>
                    <p class="text-gray-500 mb-4">Banner verileri yüklenirken bir hata oluştu.</p>
                    <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors" id="retryBtn">
                        <i class="ri-refresh-line mr-1"></i> Tekrar Dene
                    </button>
                </div>
            `;
            
            // Tekrar deneme butonu
            document.getElementById('retryBtn')?.addEventListener('click', loadBanners);
        }
    }
}

// Banner istatistiklerini güncelle
function updateBannerStats() {
    // Toplam banner sayısı
    const totalBannerElement = document.querySelector('.border-l-4.border-primary .text-2xl');
    if (totalBannerElement) {
        totalBannerElement.textContent = banners.length;
    }
    
    // Aktif banner sayısı
    const activeBanners = banners.filter(banner => banner.status === 'active');
    const activeBannerElement = document.querySelector('.border-l-4.border-green-500 .text-2xl');
    if (activeBannerElement) {
        activeBannerElement.textContent = activeBanners.length;
    }
    
    // Pasif banner sayısı
    const inactiveBanners = banners.filter(banner => banner.status === 'inactive');
    const inactiveBannerElement = document.querySelector('.border-l-4.border-red-500 .text-2xl');
    if (inactiveBannerElement) {
        inactiveBannerElement.textContent = inactiveBanners.length;
    }
    
    // Toplam tıklanma sayısı
    const totalClicks = banners.reduce((sum, banner) => sum + (banner.click_count || 0), 0);
    const clicksElement = document.querySelector('.border-l-4.border-blue-500 .text-2xl');
    if (clicksElement) {
        clicksElement.textContent = totalClicks;
    }
}

// Banner kartlarını oluştur
function renderBanners(bannersToRender) {
    const bannerContainer = document.getElementById('bannerContainer');
    if (!bannerContainer) return;
    
    if (bannersToRender.length === 0) {
        bannerContainer.innerHTML = `
            <div class="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="text-gray-400 text-6xl mb-4">
                    <i class="ri-image-line"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-700 mb-2">Henüz Banner Bulunmuyor</h3>
                <p class="text-gray-500 mb-4">Yeni bir banner ekleyerek başlayabilirsiniz.</p>
                <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors" id="addFirstBannerBtn">
                    <i class="ri-add-line mr-1"></i> Yeni Banner Ekle
                </button>
            </div>
        `;
        
        // Yeni banner ekleme butonu
        document.getElementById('addFirstBannerBtn')?.addEventListener('click', () => {
            openAddBannerModal();
        });
        
        return;
    }
    
    // Banner kartlarını oluştur
    bannerContainer.innerHTML = bannersToRender.map(banner => `
        <div class="banner-card bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div class="relative">
                <img src="${banner.image_url}" alt="${banner.title}" class="w-full h-48 object-cover">
                <div class="absolute top-2 right-2 flex space-x-1">
                    <span class="status-badge ${banner.status === 'active' ? 'bg-green-500' : 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full">
                        ${banner.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                    <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        ${getLabelForLocation(banner.location)}
                    </span>
                </div>
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
                    <h3 class="font-bold">${banner.title}</h3>
                </div>
            </div>
            <div class="p-4">
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${banner.description || 'Açıklama yok'}</p>
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                        ${banner.click_count || 0} Tıklama
                    </div>
                    <div class="banner-actions flex space-x-1">
                        <button class="edit-banner-btn p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" data-id="${banner.id}">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="toggle-banner-btn p-2 ${banner.status === 'active' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} rounded hover:${banner.status === 'active' ? 'bg-red-100' : 'bg-green-100'}" data-id="${banner.id}" data-status="${banner.status}">
                            <i class="ri-${banner.status === 'active' ? 'pause-line' : 'play-line'}"></i>
                        </button>
                        <button class="delete-banner-btn p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" data-id="${banner.id}">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Banner işlem butonları için event listener'lar
    attachBannerEventListeners();
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
    document.querySelectorAll('.edit-banner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bannerId = btn.dataset.id;
            editBanner(bannerId);
        });
    });
    
    // Durum değiştirme butonları
    document.querySelectorAll('.toggle-banner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bannerId = btn.dataset.id;
            const currentStatus = btn.dataset.status;
            toggleBannerStatus(bannerId, currentStatus);
        });
    });
    
    // Silme butonları
    document.querySelectorAll('.delete-banner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bannerId = btn.dataset.id;
            deleteBanner(bannerId);
        });
    });
}

// Banner durumunu değiştir
async function toggleBannerStatus(bannerId, currentStatus) {
    try {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        // Supabase'de güncelle
        const { error } = await supabaseClient
            .from('banners')
            .update({ status: newStatus })
            .eq('id', bannerId);
            
        if (error) throw error;
        
        // Başarılı bildirim
        const statusText = newStatus === 'active' ? 'aktif' : 'pasif';
        showNotification(`Banner başarıyla ${statusText} hale getirildi`, 'success');
        
        // Verileri yeniden yükle
        loadBanners();
        
    } catch (error) {
        console.error('Banner durumu değiştirilirken hata:', error);
        showNotification('Banner durumu değiştirilirken bir hata oluştu', 'error');
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

// Modal kapat ve sıfırla
function closeModal() {
    // Modalı kapat
    const modal = document.getElementById('addBannerModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Formu sıfırla
    const form = document.getElementById('addBannerForm');
    if (form) {
        form.reset();
    }
    
    const bannerIdInput = document.getElementById('bannerId');
    if (bannerIdInput) {
        bannerIdInput.value = '';
    }
    
    resetImagePreview();
    
    // Modal başlığını varsayılana döndür
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Yeni Banner Ekle';
    }
    
    // Submit butonunu sıfırla
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ri-save-line mr-1"></i><span id="submitBtnText">Banner Ekle</span>';
    }
    
    if (submitBtnText) {
        submitBtnText.textContent = 'Banner Ekle';
    }
}

// Yeni banner ekleme modalını aç
function openAddBannerModal() {
    // Modal başlığını güncelle
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Yeni Banner Ekle';
    }
    
    // Submit butonunu sıfırla
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ri-save-line mr-1"></i><span id="submitBtnText">Banner Ekle</span>';
    }
    
    if (submitBtnText) {
        submitBtnText.textContent = 'Banner Ekle';
    }
    
    // Formu sıfırla
    const form = document.getElementById('addBannerForm');
    if (form) {
        form.reset();
    }
    
    const bannerIdInput = document.getElementById('bannerId');
    if (bannerIdInput) {
        bannerIdInput.value = '';
    }
    
    resetImagePreview();
    
    // Modalı aç
    const modal = document.getElementById('addBannerModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Banner düzenle
async function editBanner(bannerId) {
    try {
        // Banner verilerini getir
        const { data: banner, error } = await supabaseClient
            .from('banners')
            .select('*')
            .eq('id', bannerId)
            .single();
            
        if (error) throw error;
        
        if (!banner) {
            showNotification('Banner bulunamadı', 'error');
            return;
        }
        
        // Modal başlığını güncelle
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Banner Düzenle';
        }
        
        // Submit butonunu düzenleme moduna ayarla
        const submitBtn = document.getElementById('submitBtn');
        const submitBtnText = document.getElementById('submitBtnText');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="ri-save-line mr-1"></i><span id="submitBtnText">Banner Güncelle</span>';
        }
        
        if (submitBtnText) {
            submitBtnText.textContent = 'Banner Güncelle';
        }
        
        // Form alanlarını doldur
        document.getElementById('bannerId').value = banner.id;
        document.getElementById('bannerTitle').value = banner.title || '';
        document.getElementById('bannerDescription').value = banner.description || '';
        document.getElementById('bannerLocation').value = banner.location || '';
        document.getElementById('bannerStatus').value = banner.status || 'active';
        document.getElementById('bannerLink').value = banner.link || '';
        document.getElementById('startDate').value = banner.start_date || '';
        document.getElementById('endDate').value = banner.end_date || '';
        
        // Mevcut görseli göster
        if (banner.image_url) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `
                <div class="w-full aspect-[3/1] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="${banner.image_url}" alt="Banner önizleme" class="max-w-full max-h-full object-contain">
                </div>
                <button type="button" class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md" id="removeImageBtn">
                    <i class="ri-delete-bin-line text-red-500"></i>
                </button>
                <p class="text-xs text-gray-500 mt-2 text-center">Mevcut banner görseli</p>
            `;
            imagePreview.classList.add('has-image');
            
            // Görsel kaldırma butonu
            document.getElementById('removeImageBtn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                resetImagePreview();
            });
        }
        
        // Modalı aç
        document.getElementById('addBannerModal').classList.add('active');
        
    } catch (error) {
        console.error('Banner düzenlenirken hata:', error);
        showNotification('Banner verileri yüklenirken bir hata oluştu: ' + error.message, 'error');
    }
}

// Form gönderildiğinde
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Form verilerini al
    const title = document.getElementById('bannerTitle').value.trim();
    const description = document.getElementById('bannerDescription').value.trim();
    const location = document.getElementById('bannerLocation').value;
    const status = document.getElementById('bannerStatus').value;
    const link = document.getElementById('bannerLink').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    console.log('Form verileri:', { title, description, location, status, link, startDate, endDate });
    
    // Zorunlu alan kontrolü
    if (!title || !location) {
        showNotification('Lütfen başlık ve konum alanlarını doldurun', 'error');
        return;
    }
    
    // Resim zorunlu
    if (!bannerImageFile && !document.getElementById('imagePreview').querySelector('img')) {
        showNotification('Lütfen bir banner görseli seçin', 'error');
        return;
    }
    
    // Submit buton referanslarını al
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const originalBtnText = submitBtnText ? submitBtnText.textContent : 'Kaydet';
    
    // Yükleniyor göster
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-2-line animate-spin mr-1"></i> Kaydediliyor...';
    }
    
    try {
        
        let imageUrl = '';
        
        // Eğer yeni bir resim yüklendiyse
        if (bannerImageFile) {
            try {
                // ImageScaler modülünü kullan
                if (window.ImageScaler) {
                    // Banner tipinde optimize et (3:1 oranında)
                    const optimizedImage = await window.ImageScaler.optimizeImage(bannerImageFile, 'banner');
                    imageUrl = optimizedImage.dataUrl;
                    
                    console.log('Banner görseli optimize edildi:', {
                        boyut: `${optimizedImage.width}x${optimizedImage.height}`,
                        orijinalBoyut: `${optimizedImage.originalWidth}x${optimizedImage.originalHeight}`,
                        oran: '3:1 (banner formatı)'
                    });
                } else {
                    // Eski yöntem - modül yoksa normal base64 dönüşümü yap
                    imageUrl = await convertFileToBase64(bannerImageFile);
                }
            } catch (error) {
                console.error('Görsel optimize edilirken hata:', error);
                showNotification('Görsel işlenirken bir hata oluştu', 'error');
                return;
            }
        } else {
            // Mevcut görseli kullan (düzenleme durumunda)
            const imgElement = document.getElementById('imagePreview').querySelector('img');
            if (imgElement) {
                imageUrl = imgElement.src;
            }
        }
        
        // Banner verisini hazırla
        const bannerData = {
            title,
            description,
            location,
            link,
            image_url: imageUrl,
            status: status
        };
        
        console.log('Kaydedilecek banner verisi:', bannerData);
        
        // Tarih değerleri varsa ekle (yoksa ekleme)
        if (startDate) bannerData.start_date = startDate;
        if (endDate) bannerData.end_date = endDate;
        
        // Düzenleme veya yeni ekleme
        const bannerId = document.getElementById('bannerId')?.value;
        
        let result;
        if (bannerId && bannerId.trim() !== '') {
            // Mevcut bannerı güncelle
            result = await supabaseClient
                .from('banners')
                .update(bannerData)
                .eq('id', bannerId)
                .select();
                
            if (result.error) throw result.error;
            
            showNotification('Banner başarıyla güncellendi', 'success');
        } else {
            // Yeni banner ekle
            result = await supabaseClient
                .from('banners')
                .insert([bannerData])
                .select();
                
            if (result.error) throw result.error;
            
            showNotification('Banner başarıyla eklendi', 'success');
        }
        
        // Submit butonunu başarılı duruma getir
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="ri-check-line mr-1"></i>Başarılı!';
            
            // Kısa bir süre sonra modalı kapat
            setTimeout(() => {
                closeModal();
            }, 500);
        } else {
            // Submit butonu bulunamazsa direkt kapat
            closeModal();
        }
        
        // Banner listesini yenile
        loadBanners();
        
        // Başarılı işlemde return et, finally bloğu çalışmasın
        return;
        
    } catch (error) {
        console.error('Banner kaydedilirken hata:', error);
        
        // Tablonun olmaması durumunda veya sütunlar uyuşmuyorsa özel mesaj göster
        if (error.code === 'PGRST204' || error.code === 'PGRST205') {
            showNotification('Banner tablosu bulunamadı veya yapısı farklı. Lütfen admin paneline bakın.', 'error');
        } else {
            showNotification('Banner kaydedilirken bir hata oluştu: ' + error.message, 'error');
        }
        
        // Hata durumunda submit butonunu eski haline getir
        if (submitBtn) {
            try {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="ri-save-line mr-1"></i><span id="submitBtnText">${originalBtnText}</span>`;
            } catch (btnError) {
                console.error('Submit butonu sıfırlanırken hata:', btnError);
                // Basit bir geri yükleme
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ri-save-line mr-1"></i>Kaydet';
            }
        }
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
        imagePreview.innerHTML = `
            <i class="ri-image-add-line text-4xl text-gray-400"></i>
            <p class="text-gray-500 mt-2">Görsel seçmek için tıklayın veya sürükleyin</p>
            <p class="text-gray-400 text-sm mt-1">PNG, JPG, WEBP (Max. 2MB)</p>
            <input type="file" id="bannerImage" name="bannerImage" class="hidden" accept="image/*">
        `;
        imagePreview.classList.remove('has-image');
        
        // Dosya seçimi için yeniden event listener ekle
        const bannerImage = document.getElementById('bannerImage');
        if (bannerImage) {
            imagePreview.addEventListener('click', () => {
                bannerImage.click();
            });
            bannerImage.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
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
                        document.getElementById('removeImageBtn')?.addEventListener('click', (e) => {
                            e.stopPropagation();
                            resetImagePreview();
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    bannerImageFile = null;
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
        const matchesStatus = !statusFilter || banner.status === statusFilter;
        
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