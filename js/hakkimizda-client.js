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
            
            try {
                const { data: supabaseData, error } = await window.supabaseClient
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
            } catch (supabaseError) {
                console.error('Supabase bağlantı hatası:', supabaseError);
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
            // Paragrafları ayır ve HTML olarak formatla
            const paragraphs = data.about_content.split('\n\n').filter(p => p.trim());
            const formattedContent = paragraphs.map(p => `<p class="mb-4">${p.trim()}</p>`).join('');
            aboutContent.innerHTML = formattedContent;
        }
        
        // 3. Vizyon ve Misyon bölümlerini güncelle - null kontrolü ile
        const visionContent = document.querySelector('.bg-gray-50 .text-gray-700');
        if (visionContent && data.vision_content) {
            visionContent.textContent = data.vision_content;
        }
        
        const missionContent = document.querySelector('.bg-primary\\/10 .text-gray-700');
        if (missionContent && data.mission_content) {
            missionContent.textContent = data.mission_content;
        }
        
        // 4. Timeline öğelerini güncelle - null ve array kontrolü ile
        if (data.timeline_items && Array.isArray(data.timeline_items) && data.timeline_items.length > 0) {
            updateTimeline(data.timeline_items);
        }
        
        // 5. Ekip üyelerini güncelle - null ve array kontrolü ile
        if (data.team_members && Array.isArray(data.team_members) && data.team_members.length > 0) {
            updateTeamMembers(data.team_members);
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

// Ekip üyelerini güncelle
function updateTeamMembers(teamMembers) {
    try {
        const teamContainer = document.querySelector('#team-section .grid');
        if (!teamContainer) {
            console.warn('Team container bulunamadı');
            return;
        }
        
        // Mevcut ekip üyelerini temizle
        teamContainer.innerHTML = '';
        
        // Yeni ekip üyelerini ekle
        teamMembers.forEach((member, index) => {
            const memberCard = document.createElement('div');
            memberCard.className = 'bg-white p-6 rounded-lg shadow-md text-center';
            memberCard.innerHTML = `
                <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                    ${member.image ? 
                        `<img src="${member.image}" alt="${member.name || 'Ekip Üyesi'}" class="w-full h-full object-cover">` :
                        `<div class="w-full h-full flex items-center justify-center text-gray-400">
                            <i class="ri-user-line text-3xl"></i>
                        </div>`
                    }
                </div>
                <h3 class="text-lg font-bold text-secondary mb-2">${member.name || 'İsim Belirtilmemiş'}</h3>
                <p class="text-primary font-medium mb-3">${member.position || 'Pozisyon Belirtilmemiş'}</p>
                <p class="text-gray-600 text-sm">${member.description || 'Açıklama yok'}</p>
            `;
            teamContainer.appendChild(memberCard);
        });
        
        console.log('Ekip üyeleri güncellendi:', teamMembers.length, 'üye');
    } catch (error) {
        console.error('Ekip üyeleri güncellenirken hata:', error);
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