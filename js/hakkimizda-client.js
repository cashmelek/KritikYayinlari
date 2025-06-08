// Hakkımızda sayfası için client-side JavaScript
// Bu dosya, Hakkımızda sayfasının içeriğini veritabanından çekerek dinamik olarak günceller

// Sayfa içeriğinin yüklenip yüklenmediğini takip eden bayrak
let contentLoaded = false;
// Güncelleme kontrolü için interval ID
let updateCheckInterval = null;
// Supabase subscription
let supabaseSubscription = null;
// Son güncellenme zamanı
let lastLoadTime = 0;
// Yeniden yükleme kilidi
let isReloading = false;

document.addEventListener('DOMContentLoaded', function() {
    // Yükleniyor animasyonunu göster
    const loadingOverlay = document.getElementById('loadingOverlay');
    const pageContent = document.getElementById('pageContent');
    
    if (loadingOverlay && pageContent) {
        loadingOverlay.classList.remove('hidden');
        pageContent.classList.remove('loaded');
    }
    
    // Supabase bağlantısını kontrol et
    if (!window.supabaseClient) {
        console.error('Supabase bağlantısı bulunamadı');
        loadDefaultContent();
        return;
    }
    
    // Sayfa içeriğini yükle (direkt Supabase'den)
    loadPageContent();
    
    // Real-time güncellemeler için Supabase subscription kur
    setupRealtimeSubscription();
    
    // localStorage değişikliklerini dinle (fallback için)
    window.addEventListener('storage', handleStorageEvent);
    
    // Periyodik olarak Supabase'den kontrol et (her 30 saniyede bir)
    // Daha uzun aralık ayarlayarak gereksiz yeniden yüklemeleri önle
    if (updateCheckInterval) {
        clearInterval(updateCheckInterval);
    }
    updateCheckInterval = setInterval(checkForSupabaseUpdates, 30000);
});

// Yükleme işlemi bittiğinde yükleniyor animasyonunu kaldır
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const pageContent = document.getElementById('pageContent');
        
        if (loadingOverlay && pageContent) {
            loadingOverlay.classList.add('hidden');
            pageContent.classList.add('loaded');
        }
    }, 500); // 500ms bekle
});

// Sayfa kapatılırken temizlik yap
window.addEventListener('beforeunload', function() {
    if (updateCheckInterval) {
        clearInterval(updateCheckInterval);
        updateCheckInterval = null;
    }
    if (supabaseSubscription) {
        supabaseSubscription.unsubscribe();
        supabaseSubscription = null;
    }
    // Storage event listener'ı kaldır
    window.removeEventListener('storage', handleStorageEvent);
});

// Real-time subscription kur
function setupRealtimeSubscription() {
    if (!window.supabaseClient) return;
    
    try {
        supabaseSubscription = window.supabaseClient
            .channel('about_page_changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'about_page' 
                }, 
                (payload) => {
                    console.log('Real-time güncelleme alındı:', payload);
                    if (payload.new) {
                        updatePageContent(payload.new);
                        showNotification('Sayfa içeriği güncellendi!');
                    }
                }
            )
            .subscribe((status) => {
                console.log('Subscription durumu:', status);
            });
    } catch (error) {
        console.error('Real-time subscription kurulurken hata:', error);
    }
}

// Supabase'den periyodik güncelleme kontrolü
async function checkForSupabaseUpdates() {
    if (!window.supabaseClient || isReloading) return;
    
    // Son yüklemeden sonra en az 10 saniye geçtiyse kontrol et
    const now = Date.now();
    if (now - lastLoadTime < 10000) {
        console.log('Son yüklemeden beri yeterli süre geçmedi, kontrol atlanıyor');
        return;
    }
    
    try {
        const { data, error } = await window.supabaseClient
            .from('about_page')
            .select('updated_at')
            .single();
            
        if (error) {
            console.error('Güncelleme kontrolü hatası:', error);
            return;
        }
        
        if (data && data.updated_at && (!window.lastUpdateTimestamp || window.lastUpdateTimestamp !== data.updated_at)) {
            console.log('Yeni güncelleme tespit edildi, sayfa içeriği yenileniyor');
            isReloading = true;
            loadPageContent();
            isReloading = false;
        }
    } catch (error) {
        console.error('Periyodik güncelleme kontrolü hatası:', error);
    }
}

// localStorage değişikliklerini işle (fallback)
function handleStorageEvent(event) {
    console.log('Storage event yakalandı:', event);
    
    // CustomEvent için kontrol
    let key, newValue;
    
    if (event.detail) {
        // Manuel olarak tetiklenen CustomEvent
        key = event.detail.key;
        newValue = event.detail.newValue;
        console.log('CustomEvent tespit edildi:', key);
    } else {
        // Gerçek storage event
        key = event.key;
        newValue = event.newValue;
        console.log('Storage event tespit edildi:', key);
    }
    
    // Hakkımızda sayfası verisi güncellendiğinde
    if (key === 'kritik_about_page_data' && newValue) {
        try {
            const data = JSON.parse(newValue);
            console.log('LocalStorage\'dan hakkımızda sayfası verileri güncellendi:', data);
            
            // Veri içeriğini kontrol et
            console.log('LocalStorage vizyon içeriği:', data.vision_content);
            console.log('LocalStorage misyon içeriği:', data.mission_content);
            
            updatePageContent(data);
            showNotification('Sayfa içeriği güncellendi');
        } catch (error) {
            console.error('Storage event parse hatası:', error);
        }
    }
    
    // Genel güncelleme mesajı geldiğinde
    if (key === 'kritik-yayinlari-updates' && newValue) {
        try {
            const updateData = JSON.parse(newValue);
            
            if (updateData.message && updateData.message.type === 'about_page' && updateData.message.action === 'update') {
                console.log('Genel güncelleme sisteminden Hakkımızda sayfası güncellemesi alındı:', updateData.message);
                
                if (updateData.message.data) {
                    console.log('Güncelleme verisi:', updateData.message.data);
                    // Veri içeriğini kontrol et
                    console.log('Güncelleme vizyon içeriği:', updateData.message.data.vision_content);
                    console.log('Güncelleme misyon içeriği:', updateData.message.data.mission_content);
                    
                    updatePageContent(updateData.message.data);
                    showNotification('Sayfa içeriği güncellendi');
                }
            }
        } catch (error) {
            console.error('Güncelleme mesajı parse hatası:', error);
        }
    }
}

// Sayfa içeriğini yükle
async function loadPageContent() {
    try {
        // Son yükleme zamanını kaydet
        lastLoadTime = Date.now();
        
        if (!window.supabaseClient) {
            console.error('Supabase bağlantısı yok, varsayılan içerik yükleniyor');
            loadDefaultContent();
            return;
        }
        
        console.log('Supabase\'den güncel veri yükleniyor...');
        
        const { data: supabaseData, error } = await window.supabaseClient
            .from('about_page')
            .select('*')
            .single();
    
        if (error) {
            console.error('Supabase veri yükleme hatası:', error);
            // LocalStorage fallback dene
            const storedData = localStorage.getItem('kritik_about_page_data');
            if (storedData) {
                try {
                    const data = JSON.parse(storedData);
                    console.log('LocalStorage fallback kullanıldı:', data);
                    // Veriyi yeni bir nesneye kopyala
                    const dataCopy = JSON.parse(JSON.stringify(data));
                    updatePageContent(dataCopy);
                    contentLoaded = true;
                    return;
                } catch (parseError) {
                    console.error('LocalStorage parse hatası:', parseError);
                }
            }
            loadDefaultContent();
            return;
        }
        
        if (supabaseData) {
            console.log('Supabase\'den güncel veri yüklendi:', supabaseData);
            
            // Timestamp'i güncelle
            window.lastUpdateTimestamp = supabaseData.updated_at;
            
            // Veriyi bağımsız bir kopyaya dönüştür
            const dataCopy = JSON.parse(JSON.stringify(supabaseData));
            
            // LocalStorage'a backup olarak kaydet
            try {
                localStorage.setItem('kritik_about_page_data', JSON.stringify(dataCopy));
            } catch (storageError) {
                console.warn('LocalStorage\'a kayıt yapılamadı:', storageError);
            }
            
            // İçeriği güncelle
            updatePageContent(dataCopy);
            contentLoaded = true;
        } else {
            console.warn('Supabase\'de veri bulunamadı, varsayılan içerik yükleniyor');
            loadDefaultContent();
        }
    } catch (error) {
        console.error('Sayfa içeriği yüklenirken hata:', error);
        loadDefaultContent();
    }
}

// Varsayılan içeriği yükle
function loadDefaultContent() {
    console.log('Varsayılan içerik yükleniyor...');
    
    // Eğer hiçbir veri yoksa, placeholder'ları göster
    const aboutContent = document.querySelector('#about-section .prose');
    if (aboutContent) {
        aboutContent.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="ri-information-line text-4xl mb-4"></i>
                <p>İçerik yükleniyor...</p>
                <p class="text-sm mt-2">Admin panelinden içerik yönetimi yapılabilir.</p>
            </div>
        `;
    }
    
    // Vizyon placeholder'ını göster
    const visionElements = document.querySelectorAll('.bg-gray-50 p-6');
    if (visionElements.length >= 1) {
        const visionContent = visionElements[0].querySelector('p.text-gray-600');
        if (visionContent) {
            visionContent.innerHTML = '<span class="text-gray-400 italic">Admin panelinden vizyon içeriği eklenecek...</span>';
        }
    }
    
    // Misyon placeholder'ını göster
    if (visionElements.length >= 2) {
        const missionContent = visionElements[1].querySelector('p.text-gray-600');
        if (missionContent) {
            missionContent.innerHTML = '<span class="text-gray-400 italic">Admin panelinden misyon içeriği eklenecek...</span>';
        }
    }
    
    contentLoaded = true;
}

// Sayfa içeriğini güncelleme işlemlerini bir araya toplayan fonksiyon
function updatePageContent(data) {
    try {
        console.log('Sayfa içeriği güncelleniyor:', data);
        
        // 1. Sayfa başlığı ve alt başlığı - null kontrolü ile
        const titleElement = document.querySelector('.py-12.bg-gradient-to-r h1.text-3xl');
        const title = data.page_title || data.title;
        if (titleElement && title) {
            titleElement.textContent = title;
            document.title = title + ' - Kritik Yayınları';
        }
        
        const subtitleElement = document.querySelector('.py-12.bg-gradient-to-r p.text-gray-600');
        if (subtitleElement && data.page_subtitle) {
            subtitleElement.textContent = data.page_subtitle;
        }

        // 2. "Biz Kimiz" bölümünü güncelle - null kontrolü ile
        const aboutSectionTitle = document.querySelector('#about-section h2');
        if (aboutSectionTitle && data.about_section_title) {
            aboutSectionTitle.innerHTML = `
                ${data.about_section_title}
                <span class="absolute -bottom-1 left-0 w-full h-1 bg-primary"></span>
            `;
        }
        
        const aboutContent = document.querySelector('#about-section .prose');
        if (aboutContent && data.about_content) {
            // Placeholder'ı kaldır ve gerçek içeriği ekle
            const paragraphs = data.about_content.split('\n\n').filter(p => p.trim());
            const formattedContent = paragraphs.map(p => `<p class="mb-4">${p.trim()}</p>`).join('');
            aboutContent.innerHTML = formattedContent;
        }
        
        // 3. Vizyon ve Misyon bölümlerini güncelle
        console.log('Vizyon ve Misyon verileri:', {
            vision_content: data.vision_content,
            mission_content: data.mission_content
        });
        
        // Vizyon için doğrudan CSS seçiciyi kullanarak elementi bul
        const visionElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2 .bg-gray-50:nth-child(1) p.text-gray-600');
        if (visionElement && data.vision_content) {
            console.log('Vizyon elementi bulundu, içerik güncelleniyor');
            visionElement.innerHTML = data.vision_content;
        } else {
            console.warn('Vizyon elementi bulunamadı veya içerik yok', {
                elementFound: !!visionElement,
                contentExists: !!data.vision_content
            });
        }
        
        // Misyon için doğrudan CSS seçiciyi kullanarak elementi bul
        const missionElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2 .bg-gray-50:nth-child(2) p.text-gray-600');
        if (missionElement && data.mission_content) {
            console.log('Misyon elementi bulundu, içerik güncelleniyor');
            missionElement.innerHTML = data.mission_content;
        } else {
            console.warn('Misyon elementi bulunamadı veya içerik yok', {
                elementFound: !!missionElement,
                contentExists: !!data.mission_content
            });
        }
        
        // Alternatif yöntem - tüm vizyon ve misyon kartlarını bul ve içeriklerini güncelle
        const allCards = document.querySelectorAll('.bg-gray-50.p-6.rounded-lg');
        console.log('Bulunan kart sayısı:', allCards.length);
        
        allCards.forEach((card, index) => {
            const cardTitle = card.querySelector('h3').textContent.trim();
            const contentElement = card.querySelector('p.text-gray-600');
            
            if (cardTitle.includes('Vizyon') && data.vision_content) {
                console.log('Vizyon kartı bulundu (alternatif yöntem)');
                contentElement.innerHTML = data.vision_content;
            } else if (cardTitle.includes('Misyon') && data.mission_content) {
                console.log('Misyon kartı bulundu (alternatif yöntem)');
                contentElement.innerHTML = data.mission_content;
            }
        });
        
        // 4. Timeline öğelerini güncelle - null ve array kontrolü ile
        if (data.timeline_items && Array.isArray(data.timeline_items) && data.timeline_items.length > 0) {
            updateTimeline(data.timeline_items);
        }
        
        console.log('Sayfa içeriği başarıyla güncellendi');
        
    } catch (error) {
        console.error('Sayfa içeriği güncellenirken hata:', error);
    }
}

// Timeline öğelerini güncelle
function updateTimeline(timelineItems) {
    try {
        const timelineContainer = document.querySelector('#timeline-section .space-y-8');
        if (!timelineContainer) {
            console.warn('Timeline container bulunamadı');
            return;
        }
        
        // Mevcut timeline öğelerini temizle
        timelineContainer.innerHTML = '';
        
        // Yeni timeline öğelerini ekle
        timelineItems.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold text-secondary mb-3">${item.title || 'Başlık Yok'}</h3>
                    <p class="text-gray-700">${item.content || 'İçerik yok'}</p>
                </div>
            `;
            timelineContainer.appendChild(timelineItem);
        });
        
        console.log('Timeline güncellendi:', timelineItems.length, 'öğe');
    } catch (error) {
        console.error('Timeline güncellenirken hata:', error);
    }
}

// Bildirim gösterme fonksiyonu
function showNotification(message) {
    // Eğer sayfada bir bildirim elementi varsa kullan, yoksa oluştur
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300';
        document.body.appendChild(notification);
    }
    
    // Bildirim mesajını ayarla
    notification.textContent = message;
    
    // Bildirimi göster
    notification.classList.remove('translate-y-20', 'opacity-0');
    
    // 3 saniye sonra gizle
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Sayfanın üstüne kaydırma animasyonu
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Debug fonksiyonu - console'da çağırılabilir
window.debugHakkimizda = function() {
    console.log('=== HAKKIMIZDA DEBUG BİLGİLERİ ===');
    console.log('Supabase Client:', !!window.supabaseClient);
    console.log('Content Loaded:', contentLoaded);
    console.log('Last Update Timestamp:', window.lastUpdateTimestamp);
    console.log('Subscription Status:', !!supabaseSubscription);
    
    // LocalStorage kontrolü
    const storedData = localStorage.getItem('kritik_about_page_data');
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            console.log('LocalStorage Data:', data);
            console.log('LocalStorage Vizyon:', data.vision_content);
            console.log('LocalStorage Misyon:', data.mission_content);
        } catch (error) {
            console.log('LocalStorage Parse Error:', error);
        }
    } else {
        console.log('LocalStorage: Veri yok');
    }
    
    // DOM Elementleri
    const visionElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2 .bg-gray-50:nth-child(1) p.text-gray-600');
    const missionElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2 .bg-gray-50:nth-child(2) p.text-gray-600');
    
    console.log('DOM elementleri:');
    console.log('Vizyon element:', visionElement);
    console.log('Misyon element:', missionElement);
    
    // Supabase'den güncel veri çek
    if (window.supabaseClient) {
        window.supabaseClient
            .from('about_page')
            .select('*')
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.log('Supabase Error:', error);
                } else {
                    console.log('Supabase Current Data:', data);
                    console.log('Supabase Vizyon:', data.vision_content);
                    console.log('Supabase Misyon:', data.mission_content);
                }
            });
    }
    
    console.log('=== DEBUG BİTİŞ ===');
};

// Manuel test fonksiyonu - Vizyon ve Misyon içeriklerini test etmek için
window.testVizyonMisyon = function(vizyon, misyon) {
    console.log('Test ediliyor - Vizyon:', vizyon);
    console.log('Test ediliyor - Misyon:', misyon);
    
    const testData = {
        page_title: 'Hakkımızda',
        page_subtitle: 'Kritik Yayınları\'nın hikayesi ve vizyonu',
        about_section_title: 'Biz Kimiz?',
        about_content: 'Test içeriği',
        vision_content: vizyon || 'Test Vizyon İçeriği',
        mission_content: misyon || 'Test Misyon İçeriği',
        timeline_items: [],
        updated_at: new Date().toISOString()
    };
    
    // Güncellenmiş veriyi localStorage'a kaydet
    localStorage.setItem('kritik_about_page_data', JSON.stringify(testData));
    
    // Storage event tetikle
    const event = new CustomEvent('storage', {
        detail: {
            key: 'kritik_about_page_data',
            newValue: JSON.stringify(testData)
        }
    });
    
    window.dispatchEvent(event);
    
    // İçeriği güncelle
    updatePageContent(testData);
    
    return 'Test tamamlandı. Vizyon ve Misyon kartları şimdi test içerikleriyle güncellendi.';
};

// Sayfa yüklendiğinde debug bilgilerini göster
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('Hakkımızda sayfası yüklendi. Debug için console\'da "debugHakkimizda()" yazın.');
        console.log('Manuel test için: "testVizyonMisyon(\'Vizyon test\', \'Misyon test\')" yazın.');
    }, 1000);
});