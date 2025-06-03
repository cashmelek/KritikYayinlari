// Hakkımızda sayfası için client-side JavaScript
// Bu dosya, Hakkımızda sayfasının içeriğini veritabanından çekerek dinamik olarak günceller

// Sayfa içeriğinin yüklenip yüklenmediğini takip eden bayrak
let contentLoaded = false;
// Güncelleme kontrolü için interval ID
let updateCheckInterval = null;

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
        console.error('Supabase bağlantısı bulunamadı, LocalStorage kontrolü yapılacak');
    }
    
    // Sayfa içeriğini yükle (önce localStorage'dan, yoksa Supabase'den)
    loadPageContent();
    
    // localStorage değişikliklerini dinle (aynı sekme içinde manuel olarak tetiklenen olaylar için)
    window.addEventListener('storage', handleStorageEvent);
    
    // Periyodik olarak localStorage'ı kontrol et (her 1 saniyede bir)
    updateCheckInterval = setInterval(checkForUpdates, 1000);
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

// Sayfa kapatılırken interval'i temizle
window.addEventListener('beforeunload', function() {
    if (updateCheckInterval) {
        clearInterval(updateCheckInterval);
    }
});

// localStorage değişikliklerini işle
function handleStorageEvent(event) {
    console.log('Storage event yakalandı:', event);
    
    // CustomEvent için kontrol
    let key, newValue;
    
    if (event.detail) {
        // Manuel olarak tetiklenen CustomEvent
        key = event.detail.key;
        newValue = event.detail.newValue;
    } else {
        // Gerçek storage event
        key = event.key;
        newValue = event.newValue;
    }
    
    // Hakkımızda sayfası verisi güncellendiğinde
    if (key === 'kritik_about_page_data' && newValue) {
        try {
            const data = JSON.parse(newValue);
            console.log('Hakkımızda sayfası verileri güncellendi:', data);
            updatePageContent(data);
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
                updatePageContent(updateData.message.data);
            }
        } catch (error) {
            console.error('Güncelleme mesajı parse hatası:', error);
        }
    }
}

// LocalStorage'daki değişiklikleri kontrol et
function checkForUpdates() {
    try {
        // Hakkımızda sayfası verisini kontrol et
        const storedData = localStorage.getItem('kritik_about_page_data');
        if (storedData) {
            const data = JSON.parse(storedData);
            
            // Eğer data içinde updated_at varsa ve değişmişse güncelle
            if (data.updated_at && (!window.lastUpdateTimestamp || window.lastUpdateTimestamp !== data.updated_at)) {
                console.log('LocalStorage\'da değişiklik tespit edildi, içerik güncelleniyor');
                window.lastUpdateTimestamp = data.updated_at;
                updatePageContent(data);
            }
        }
    } catch (error) {
        console.error('Güncelleme kontrolü sırasında hata:', error);
    }
}

// Sayfa içeriğini yükle
async function loadPageContent() {
    try {
        let data = null;
        
        // Önce localStorage'dan kontrol et
        const storedData = localStorage.getItem('kritik_about_page_data');
        if (storedData) {
            try {
                data = JSON.parse(storedData);
                console.log('LocalStorage\'dan sayfa içeriği yüklendi:', data);
                
                // İçeriği güncelle
                updatePageContent(data);
                contentLoaded = true;
            } catch (error) {
                console.error('LocalStorage veri parse hatası:', error);
            }
        }
        
        // Eğer localStorage'da veri yoksa veya parse edilemezse, Supabase'den dene
        if (!data && window.supabaseClient) {
            console.log('Supabase\'den veri yükleniyor...');
            
            const { data: supabaseData, error } = await supabaseClient
            .from('about_page')
            .select('*')
            .single();
        
        if (error) {
                console.error('Supabase veri yükleme hatası:', error);
                loadDefaultContent();
                return;
            }
            
            if (supabaseData) {
                console.log('Supabase\'den veri yüklendi:', supabaseData);
                updatePageContent(supabaseData);
                contentLoaded = true;
                
                // LocalStorage'a kaydet
                localStorage.setItem('kritik_about_page_data', JSON.stringify(supabaseData));
            } else {
                console.warn('Supabase\'de veri bulunamadı, varsayılan içerik yükleniyor');
                loadDefaultContent();
            }
        } else if (!data) {
            console.warn('LocalStorage\'da veri bulunamadı ve Supabase bağlantısı yok, varsayılan içerik yükleniyor');
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
    // Hiçbir şey yapmayabilir, varsayılan HTML içeriği zaten sayfada
    contentLoaded = true;
}

// Sayfa içeriğini güncelleme işlemlerini bir araya toplayan fonksiyon
function updatePageContent(data) {
    try {
        console.log('Sayfa içeriği güncelleniyor:', data);
        
        // 1. Sayfa başlığı ve alt başlığı
    const titleElement = document.querySelector('.py-12.bg-gradient-to-r h1.text-3xl');
        // Hem yeni (page_title) hem de eski (title) formatta veri desteği
        const title = data.page_title || data.title;
        if (titleElement && title) {
            titleElement.textContent = title;
            document.title = title + ' - Kritik Yayınları';
        }
        
    const subtitleElement = document.querySelector('.py-12.bg-gradient-to-r p.text-gray-600');
    if (subtitleElement && data.page_subtitle) {
        subtitleElement.textContent = data.page_subtitle;
}

        // 2. "Biz Kimiz" bölümünü güncelle
        if (data.about_section_title) {
    const sectionTitleElement = document.querySelector('#about-section h2.text-2xl');
            if (sectionTitleElement) {
        sectionTitleElement.textContent = data.about_section_title;
            }
    }
    
        // İçerik için hem yeni (about_content) hem de eski (content) formatta veri desteği
        const content = data.about_content || data.content;
        if (content) {
        const aboutContentDiv = document.querySelector('#about-section .prose');
        if (aboutContentDiv) {
            // İçeriği paragraf etiketlerine bölerek HTML'e ekle
                const paragraphs = content.split('\n\n');
            aboutContentDiv.innerHTML = '';
            
            paragraphs.forEach((paragraph, index) => {
                if (paragraph.trim() !== '') {
                    const p = document.createElement('p');
                    p.textContent = paragraph;
                    
                    // Son paragraf hariç hepsine mb-4 sınıfı ekle
                    if (index < paragraphs.length - 1) {
                        p.classList.add('mb-4');
                    }
                    
                    aboutContentDiv.appendChild(p);
                }
            });
    }
}

        // 3. Vizyon ve Misyon içeriğini güncelle
        if (data.vision_content) {
    const visionElement = document.querySelector('#about-section .md\\:grid-cols-2 .bg-gray-50:first-child p.text-gray-600');
            if (visionElement) {
        visionElement.textContent = data.vision_content;
            }
    }
    
        if (data.mission_content) {
    const missionElement = document.querySelector('#about-section .md\\:grid-cols-2 .bg-gray-50:last-child p.text-gray-600');
            if (missionElement) {
        missionElement.textContent = data.mission_content;
    }
}

        // 4. Zaman çizelgesini güncelle (Kuruluş Hikayemiz)
        if (data.timeline_items && data.timeline_items.length > 0) {
    const timelineContainer = document.querySelector('.py-12.bg-gray-50 .relative');
    
    if (timelineContainer) {
        // Mevcut zaman çizelgesi öğelerini temizle
        timelineContainer.innerHTML = '';
        
        // Yeni zaman çizelgesi öğelerini ekle
                data.timeline_items.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            timelineItem.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-xl font-semibold text-primary mb-2">${item.title}</h3>
                    <p class="text-gray-600">${item.content}</p>
                </div>
            `;
            
            timelineContainer.appendChild(timelineItem);
        });
    }
}

        // 5. Ekip üyelerini güncelle
        if (data.team_members && data.team_members.length > 0) {
    const teamContainer = document.querySelector('.py-12.bg-white .grid.grid-cols-1.md\\:grid-cols-3');
    
    if (teamContainer) {
        // Mevcut ekip üyelerini temizle
        teamContainer.innerHTML = '';
        
        // Yeni ekip üyelerini ekle
                data.team_members.forEach(member => {
                    if (!member.name) return; // Boş üyeleri atla
                    
            const teamMember = document.createElement('div');
            teamMember.className = 'bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow';
                    
                    const imageUrl = member.image || 'images/placeholder.png';
            
            teamMember.innerHTML = `
                <div class="relative overflow-hidden">
                            <img src="${imageUrl}" alt="${member.name}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='images/placeholder.png'">
                </div>
                <div class="p-4 text-center">
                    <h3 class="text-lg font-semibold text-secondary mb-1">${member.name}</h3>
                            <p class="text-primary text-sm font-medium mb-3">${member.position || ''}</p>
                            <p class="text-gray-600 text-sm mb-4">${member.description || ''}</p>
                    <div class="flex justify-center space-x-3">
                        <a href="#" class="text-gray-500 hover:text-primary transition-colors">
                            <i class="ri-twitter-fill text-lg"></i>
                        </a>
                        <a href="#" class="text-gray-500 hover:text-primary transition-colors">
                            <i class="ri-linkedin-fill text-lg"></i>
                        </a>
                        <a href="#" class="text-gray-500 hover:text-primary transition-colors">
                            <i class="ri-mail-fill text-lg"></i>
                        </a>
                    </div>
                </div>
            `;
            
            teamContainer.appendChild(teamMember);
        });
    }
} 

        console.log('Hakkımızda sayfası içeriği başarıyla güncellendi');
    } catch (error) {
        console.error('Sayfa içeriği güncellenirken hata:', error);
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