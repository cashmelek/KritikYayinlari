// Hakkımızda sayfası için client-side JavaScript
// Bu dosya, Hakkımızda sayfasının içeriğini veritabanından çekerek dinamik olarak günceller

// Sayfa içeriğinin yüklenip yüklenmediğini takip eden bayrak
let contentLoaded = false;

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
        console.error('Supabase bağlantısı bulunamadı!');
        showErrorMessage('Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.');
        return;
    }
    
    console.log('Hakkımızda sayfası yükleniyor, Supabase bağlantısı kuruldu...');
    
    // Hakkımızda sayfası içeriğini yükle
    loadAboutPageContent().then(() => {
        // İçerik yüklendikten sonra yükleniyor animasyonunu gizle
        if (loadingOverlay && pageContent) {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                pageContent.classList.add('loaded');
                contentLoaded = true;
            }, 300); // Kısa bir gecikme ekleyerek animasyonu daha düzgün hale getir
        }
    }).catch(error => {
        console.error('İçerik yüklenirken hata:', error);
        showErrorMessage('İçerik yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    });
    
    // Supabase realtime özelliğini kullanarak değişiklikleri dinle
    setupRealtimeListener();
    
    // BroadcastChannel API ile admin panelinden gelen güncellemeleri dinle
    setupBroadcastListener();
    
    // LocalStorage değişikliklerini dinle (BroadcastChannel desteklenmeyen tarayıcılar için)
    setupLocalStorageListener();
});

// Hakkımızda sayfası içeriğini veritabanından yükler
async function loadAboutPageContent() {
    try {
        console.log('Veritabanından hakkımızda içeriği alınıyor...');
        
        // Sayfa içeriğini Supabase'den çek
        const { data, error } = await supabaseClient
            .from('about_page')
            .select('*')
            .single();
        
        if (error) {
            console.error('Veritabanı sorgu hatası:', error);
            throw error;
        }
        
        console.log('Alınan veri:', data);
        
        if (data) {
            // Sayfa başlığı ve alt başlığı güncelle
            updatePageHeaders(data);
            
            // "Biz Kimiz" bölümünü güncelle
            updateAboutSection(data);
            
            // Vizyon ve Misyon içeriğini güncelle
            updateVisionMission(data);
            
            // Zaman çizelgesini güncelle
            if (data.timeline_items && data.timeline_items.length > 0) {
                updateTimelineItems(data.timeline_items);
            } else {
                console.warn('Zaman çizelgesi verileri bulunamadı veya boş');
            }
            
            // Ekip üyelerini güncelle
            if (data.team_members && data.team_members.length > 0) {
                updateTeamMembers(data.team_members);
            } else {
                console.warn('Ekip üyeleri verileri bulunamadı veya boş');
            }
            
            console.log('Hakkımızda sayfası içeriği başarıyla güncellendi');
        } else {
            console.warn('Veritabanından veri alınamadı veya boş');
        }
    } catch (error) {
        console.error('Hakkımızda sayfası içeriği yüklenirken hata:', error);
    }
}

// Sayfa başlığı ve alt başlığını günceller
function updatePageHeaders(data) {
    // Sayfa başlığı
    const titleElement = document.querySelector('.py-12.bg-gradient-to-r h1.text-3xl');
    if (titleElement && data.page_title) {
        titleElement.textContent = data.page_title;
        document.title = data.page_title + ' - Kritik Yayınları';
    }
    
    // Alt başlık
    const subtitleElement = document.querySelector('.py-12.bg-gradient-to-r p.text-gray-600');
    if (subtitleElement && data.page_subtitle) {
        subtitleElement.textContent = data.page_subtitle;
    }
}

// "Biz Kimiz" bölümünü günceller
function updateAboutSection(data) {
    // Bölüm başlığı
    const sectionTitleElement = document.querySelector('#about-section h2.text-2xl');
    if (sectionTitleElement && data.about_section_title) {
        sectionTitleElement.textContent = data.about_section_title;
    }
    
    // Bölüm içeriği
    if (data.about_content) {
        const aboutContentDiv = document.querySelector('#about-section .prose');
        if (aboutContentDiv) {
            // İçeriği paragraf etiketlerine bölerek HTML'e ekle
            const paragraphs = data.about_content.split('\n\n');
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
}

// Vizyon ve Misyon içeriğini günceller
function updateVisionMission(data) {
    // Vizyon içeriği
    const visionElement = document.querySelector('#about-section .md\\:grid-cols-2 .bg-gray-50:first-child p.text-gray-600');
    if (visionElement && data.vision_content) {
        visionElement.textContent = data.vision_content;
    }
    
    // Misyon içeriği
    const missionElement = document.querySelector('#about-section .md\\:grid-cols-2 .bg-gray-50:last-child p.text-gray-600');
    if (missionElement && data.mission_content) {
        missionElement.textContent = data.mission_content;
    }
}

// Zaman çizelgesini günceller
function updateTimelineItems(timelineItems) {
    const timelineContainer = document.querySelector('.py-12.bg-gray-50 .relative');
    
    if (timelineContainer) {
        // Mevcut zaman çizelgesi öğelerini temizle
        timelineContainer.innerHTML = '';
        
        // Yeni zaman çizelgesi öğelerini ekle
        timelineItems.forEach(item => {
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

// Ekip üyelerini günceller
function updateTeamMembers(teamMembers) {
    const teamContainer = document.querySelector('.py-12.bg-white .grid.grid-cols-1.md\\:grid-cols-3');
    
    if (teamContainer) {
        // Mevcut ekip üyelerini temizle
        teamContainer.innerHTML = '';
        
        // Yeni ekip üyelerini ekle
        teamMembers.forEach(member => {
            const teamMember = document.createElement('div');
            teamMember.className = 'bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow';
            
            teamMember.innerHTML = `
                <div class="relative overflow-hidden">
                    <img src="${member.image}" alt="${member.name}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='site_resimleri/placeholder.png'">
                </div>
                <div class="p-4 text-center">
                    <h3 class="text-lg font-semibold text-secondary mb-1">${member.name}</h3>
                    <p class="text-primary text-sm font-medium mb-3">${member.position}</p>
                    <p class="text-gray-600 text-sm mb-4">${member.description}</p>
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

// Supabase realtime özelliğini kullanarak değişiklikleri dinle
function setupRealtimeListener() {
    if (!window.supabaseClient) {
        console.error('Realtime listener için Supabase bağlantısı bulunamadı!');
        return;
    }
    
    try {
        // about_page tablosundaki değişiklikleri dinle
        const subscription = supabaseClient
            .channel('about_page_changes')
            .on('postgres_changes', {
                event: '*',  // INSERT, UPDATE, DELETE olaylarını dinle
                schema: 'public',
                table: 'about_page'
            }, (payload) => {
                console.log('Hakkımızda sayfasında değişiklik algılandı:', payload);
                
                // Değişikliğe göre içeriği güncelle
                if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                    // Verinin doğru biçimde alındığından emin ol
                    const data = payload.new || {};
                    
                    // Yükleme sırasında değişiklik gelirse biraz bekleyelim
                    if (!contentLoaded) {
                        setTimeout(() => updatePageContent(data), 1000);
                    } else {
                        updatePageContent(data);
                    }
                }
            })
            .subscribe((status) => {
                console.log('Supabase realtime abonelik durumu:', status);
                
                if (status === 'SUBSCRIBED') {
                    console.log('Hakkımızda sayfası için realtime listener başarıyla kuruldu');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('Realtime listener bağlantı hatası!');
                    
                    // Bağlantı hatası durumunda 3 saniye sonra tekrar dene
                    setTimeout(() => {
                        console.log('Realtime listener yeniden bağlanmaya çalışıyor...');
                        setupRealtimeListener();
                    }, 3000);
                }
            });
        
        // Sayfa kapatıldığında aboneliği temizle
        window.addEventListener('beforeunload', () => {
            subscription.unsubscribe();
            console.log('Realtime listener aboneliği iptal edildi');
        });
        
    } catch (error) {
        console.error('Realtime listener kurulurken hata:', error);
        
        // Hata durumunda 5 saniye sonra tekrar dene
        setTimeout(() => {
            console.log('Realtime listener yeniden kurulmaya çalışıyor...');
            setupRealtimeListener();
        }, 5000);
    }
}

// BroadcastChannel API ile admin panelinden gelen güncellemeleri dinle
function setupBroadcastListener() {
    // BroadcastChannel API'nin desteklenip desteklenmediğini kontrol et
    if ('BroadcastChannel' in window) {
        try {
            const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
            
            broadcastChannel.onmessage = (event) => {
                console.log('BroadcastChannel mesajı alındı:', event.data);
                
                // Hakkımızda sayfası güncellemelerini kontrol et
                if (event.data && event.data.type === 'about_page') {
                    console.log('Hakkımızda sayfası güncellemesi alındı:', event.data.data);
                    
                    // Sayfa içeriğini güncelle
                    const aboutData = event.data.data;
                    
                    // Yükleme sırasında değişiklik gelirse biraz bekleyelim
                    if (!contentLoaded) {
                        setTimeout(() => updatePageContent(aboutData), 1000);
                    } else {
                        updatePageContent(aboutData);
                    }
                }
            };
            
            // Sayfa kapandığında kanalı kapat
            window.addEventListener('beforeunload', () => {
                broadcastChannel.close();
            });
            
            console.log('BroadcastChannel dinleyicisi başarıyla kuruldu');
        } catch (error) {
            console.error('BroadcastChannel kurulurken hata:', error);
        }
    } else {
        console.warn('BroadcastChannel API desteklenmiyor. LocalStorage yöntemi kullanılacak.');
    }
}

// LocalStorage değişikliklerini dinle (BroadcastChannel desteklenmeyen tarayıcılar için)
function setupLocalStorageListener() {
    // Son işlenen timestamp'i sakla
    let lastProcessedTimestamp = 0;
    
    // LocalStorage'daki değişiklikleri kontrol et
    const checkLocalStorageUpdates = () => {
        try {
            const storageData = localStorage.getItem('kritik-yayinlari-updates');
            
            if (storageData) {
                const parsedData = JSON.parse(storageData);
                
                // Yeni bir güncelleme mi kontrol et (timestamp'e göre)
                if (parsedData.timestamp > lastProcessedTimestamp) {
                    console.log('LocalStorage güncellemesi algılandı:', parsedData);
                    
                    // Timestamp'i güncelle
                    lastProcessedTimestamp = parsedData.timestamp;
                    
                    // Hakkımızda sayfası güncellemelerini kontrol et
                    if (parsedData.message && parsedData.message.type === 'about_page') {
                        console.log('Hakkımızda sayfası güncellemesi alındı:', parsedData.message.data);
                        
                        // Sayfa içeriğini güncelle
                        const aboutData = parsedData.message.data;
                        
                        // Sayfa başlığı ve alt başlığı güncelle
                        updatePageHeaders(aboutData);
                        
                        // "Biz Kimiz" bölümünü güncelle
                        updateAboutSection(aboutData);
                        
                        // Vizyon ve Misyon içeriğini güncelle
                        updateVisionMission(aboutData);
                        
                        // Zaman çizelgesini güncelle
                        if (aboutData.timeline_items && aboutData.timeline_items.length > 0) {
                            updateTimelineItems(aboutData.timeline_items);
                        }
                        
                        // Ekip üyelerini güncelle
                        if (aboutData.team_members && aboutData.team_members.length > 0) {
                            updateTeamMembers(aboutData.team_members);
                        }
                        
                        // Kullanıcıya bildirim göster
                        showNotification('Hakkımızda sayfası içeriği güncellendi!');
                    }
                }
            }
        } catch (error) {
            console.error('LocalStorage güncellemesi kontrol edilirken hata:', error);
        }
    };
    
    // Başlangıçta bir kez kontrol et
    checkLocalStorageUpdates();
    
    // Düzenli aralıklarla kontrol et (her 2 saniyede bir)
    const intervalId = setInterval(checkLocalStorageUpdates, 2000);
    
    // Sayfa kapandığında interval'i temizle
    window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
    });
    
    console.log('LocalStorage dinleyicisi başarıyla kuruldu');
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

// Sayfa içeriğini güncelleme işlemlerini bir araya toplayan fonksiyon
function updatePageContent(data) {
    // Sayfa başlığı ve alt başlığı güncelle
    updatePageHeaders(data);
    
    // "Biz Kimiz" bölümünü güncelle
    updateAboutSection(data);
    
    // Vizyon ve Misyon içeriğini güncelle
    updateVisionMission(data);
    
    // Zaman çizelgesini güncelle
    if (data.timeline_items && data.timeline_items.length > 0) {
        updateTimelineItems(data.timeline_items);
    }
    
    // Ekip üyelerini güncelle
    if (data.team_members && data.team_members.length > 0) {
        updateTeamMembers(data.team_members);
    }
    
    // Kullanıcıya bildirim göster
    showNotification('Hakkımızda sayfası içeriği güncellendi!');
    
    // Scroll animasyonu ile kullanıcının dikkatini çek
    smoothScrollToTop();
}

// Hata mesajı gösterme
function showErrorMessage(message) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `
            <div class="bg-red-50 p-6 rounded-lg shadow-lg max-w-md mx-auto text-center">
                <div class="text-red-500 mb-4">
                    <i class="ri-error-warning-line text-5xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-red-800 mb-2">Bir hata oluştu</h3>
                <p class="text-red-600 mb-4">${message}</p>
                <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    <i class="ri-refresh-line mr-1"></i> Sayfayı Yenile
                </button>
            </div>
        `;
    }
}

// Sayfanın üstüne kaydırma animasyonu
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}