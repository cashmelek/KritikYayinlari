// Hakkımızda Admin Sayfası JS
document.addEventListener('DOMContentLoaded', function() {
    // Supabase bağlantısını başlat
    initSupabase();
    
    // Mevcut verileri yükle
    loadExistingData();
    
    // Timeline öğeleri için event listener
    initTimelineItems();
    
    // Ekip üyeleri için event listener
    initTeamMembers();
    
    // Kaydetme butonları için event listener
    const saveBtn = document.getElementById('saveChangesBtn');
    const saveBtnBottom = document.getElementById('saveChangesBtnBottom');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveChanges);
    }
    if (saveBtnBottom) {
        saveBtnBottom.addEventListener('click', saveChanges);
    }
});

// Mevcut verileri veritabanından yükle
async function loadExistingData() {
    try {
        if (!window.supabaseClient) {
            console.warn('Supabase bağlantısı bulunamadı, mevcut veriler yüklenemedi.');
            return;
        }
        
        const { data, error } = await window.supabaseClient
            .from('about_page')
            .select('*')
            .single();
            
        if (error) {
            console.error('Veri yükleme hatası:', error);
            // Eğer tablo boşsa veya veri yoksa, varsayılan değerlerle devam et
            if (error.code === 'PGRST116') {
                console.log('Henüz veri yok, varsayılan değerler kullanılacak');
                return;
            }
            showNotification('Veriler yüklenirken bir hata oluştu: ' + error.message, 'error');
            return;
        }
        
        if (data) {
            console.log('Mevcut veriler yüklendi:', data);
            
            // Sayfa başlığı ve alt başlığı - null kontrolü ile
            const pageTitleEl = document.getElementById('pageTitle');
            const pageSubtitleEl = document.getElementById('pageSubtitle');
            
            if (pageTitleEl && data.page_title) {
                pageTitleEl.value = data.page_title;
            }
            if (pageSubtitleEl && data.page_subtitle) {
                pageSubtitleEl.value = data.page_subtitle;
            }
            
            // Biz Kimiz bölümü - null kontrolü ile
            const aboutSectionTitleEl = document.getElementById('aboutSectionTitle');
            const aboutContentEl = document.getElementById('aboutContent');
            
            if (aboutSectionTitleEl && data.about_section_title) {
                aboutSectionTitleEl.value = data.about_section_title;
            }
            if (aboutContentEl && data.about_content) {
                aboutContentEl.value = data.about_content;
            }
            
            // Vizyon ve Misyon - null kontrolü ile
            const visionContentEl = document.getElementById('visionContent');
            const missionContentEl = document.getElementById('missionContent');
            
            if (visionContentEl && data.vision_content) {
                visionContentEl.value = data.vision_content;
            }
            if (missionContentEl && data.mission_content) {
                missionContentEl.value = data.mission_content;
            }
            
            // Zaman çizelgesi - null ve array kontrolü ile
            if (data.timeline_items && Array.isArray(data.timeline_items) && data.timeline_items.length > 0) {
                loadTimelineItems(data.timeline_items);
            }
            
            // Ekip üyeleri - null ve array kontrolü ile
            if (data.team_members && Array.isArray(data.team_members) && data.team_members.length > 0) {
                loadTeamMembers(data.team_members);
            }
            
            showNotification('Mevcut veriler başarıyla yüklendi', 'success');
        }
    } catch (error) {
        console.error('Mevcut veriler yüklenirken hata oluştu:', error);
        showNotification('Veriler yüklenirken beklenmeyen bir hata oluştu', 'error');
    }
}

// Zaman çizelgesi öğelerini yükle
function loadTimelineItems(timelineItems) {
    try {
        // Önce mevcut timeline öğelerini temizle
        const timelineContainer = document.getElementById('timelineItems');
        if (!timelineContainer) return;
        
        timelineContainer.innerHTML = '';
        
        // Veritabanından gelen timeline öğelerini ekle
        timelineItems.forEach(item => {
            const newItem = document.createElement('div');
            newItem.className = 'timeline-item border border-gray-200 rounded-lg p-4';
            newItem.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-medium">
                        <input type="text" class="timeline-title w-full px-3 py-1 border border-gray-300 rounded-md" 
                        value="${item.title}" placeholder="Örn: 2025 - Yeni Dönem">
                    </h3>
                    <button class="text-red-500 hover:text-red-700 delete-timeline-btn">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
                <textarea class="timeline-content w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" rows="2" placeholder="Dönem açıklaması">${item.content}</textarea>
            `;
            
            timelineContainer.appendChild(newItem);
            
            // Silme butonu için event listener ekle
            newItem.querySelector('.delete-timeline-btn').addEventListener('click', function() {
                showConfirmModal('Bu zaman çizelgesi öğesini silmek istediğinizden emin misiniz?', function() {
                    newItem.remove();
                });
            });
        });
        
        console.log('Zaman çizelgesi öğeleri yüklendi:', timelineItems.length);
    } catch (error) {
        console.error('Zaman çizelgesi yüklenirken hata:', error);
    }
}

// Ekip üyelerini yükle
function loadTeamMembers(teamMembers) {
    try {
        // Önce mevcut ekip üyelerini temizle
        const teamContainer = document.getElementById('teamMembers');
        if (!teamContainer) return;
        
        teamContainer.innerHTML = '';
        
        // Veritabanından gelen ekip üyelerini ekle
        teamMembers.forEach(member => {
            const newMember = document.createElement('div');
            newMember.className = 'team-member border border-gray-200 rounded-lg p-4';
            newMember.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-medium">${member.name || 'Yeni Ekip Üyesi'}</h3>
                    <button class="text-red-500 hover:text-red-700 delete-team-member-btn">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">İsim</label>
                        <input type="text" class="team-name w-full px-3 py-1 border border-gray-300 rounded-md text-sm" placeholder="Adı Soyadı" value="${member.name || ''}">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Pozisyon</label>
                        <input type="text" class="team-position w-full px-3 py-1 border border-gray-300 rounded-md text-sm" placeholder="Örn: Genel Müdür" value="${member.position || ''}">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Açıklama</label>
                        <textarea class="team-description w-full px-3 py-1 border border-gray-300 rounded-md text-sm" rows="2" placeholder="Kısa özgeçmiş">${member.description || ''}</textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Fotoğraf URL</label>
                        <input type="text" class="team-image w-full px-3 py-1 border border-gray-300 rounded-md text-sm" placeholder="https://example.com/foto.jpg" value="${member.image || ''}">
                    </div>
                </div>
            `;
            
            teamContainer.appendChild(newMember);
            
            // Silme butonu için event listener ekle
            newMember.querySelector('.delete-team-member-btn').addEventListener('click', function() {
                showConfirmModal('Bu ekip üyesini silmek istediğinizden emin misiniz?', function() {
                    newMember.remove();
                });
            });
        });
        
        console.log('Ekip üyeleri yüklendi:', teamMembers.length);
    } catch (error) {
        console.error('Ekip üyeleri yüklenirken hata:', error);
    }
}

// Supabase bağlantısını başlat
function initSupabase() {
    // Supabase nesnesinin global olarak tanımlandığını kontrol et
    if (!window.supabaseClient) {
        console.error('Supabase bağlantısı bulunamadı!');
        showNotification('Veritabanı bağlantısı başlatılamadı!', 'error');
        return false;
    }
    console.log('Supabase bağlantısı başarılı');
    return true;
}

// Timeline öğeleri için
function initTimelineItems() {
    const addTimelineBtn = document.getElementById('addTimelineItemBtn');
    if (!addTimelineBtn) {
        console.warn('Timeline ekleme butonu bulunamadı');
        return;
    }
    
    // Yeni timeline öğesi ekleme
    addTimelineBtn.addEventListener('click', function() {
        const timelineItems = document.getElementById('timelineItems');
        if (!timelineItems) {
            console.error('Timeline container bulunamadı');
            return;
        }
        
        const newItem = document.createElement('div');
        newItem.className = 'timeline-item border border-gray-200 rounded-lg p-4';
        newItem.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-medium">
                    <input type="text" class="timeline-title w-full px-3 py-1 border border-gray-300 rounded-md" 
                    value="Yeni Dönem" placeholder="Örn: 2025 - Yeni Dönem">
                </h3>
                <button class="text-red-500 hover:text-red-700 delete-timeline-btn">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
            <textarea class="timeline-content w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" rows="2" placeholder="Dönem açıklaması"></textarea>
        `;
        timelineItems.appendChild(newItem);
        
        // Yeni eklenen öğe için silme butonuna event listener ekle
        const deleteBtn = newItem.querySelector('.delete-timeline-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                showConfirmModal('Bu zaman çizelgesi öğesini silmek istediğinizden emin misiniz?', function() {
                    newItem.remove();
                });
            });
        }
    });
    
    // Mevcut silme butonları için event listener ekle
    document.querySelectorAll('.delete-timeline-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.timeline-item');
            if (item) {
                showConfirmModal('Bu zaman çizelgesi öğesini silmek istediğinizden emin misiniz?', function() {
                    item.remove();
                });
            }
        });
    });
}

// Ekip üyeleri için
function initTeamMembers() {
    // Yeni ekip üyesi ekleme
    document.getElementById('addTeamMemberBtn').addEventListener('click', function() {
        const teamMembersContainer = document.getElementById('teamMembers');
        const newMember = document.createElement('div');
        newMember.className = 'team-member border border-gray-200 rounded-lg p-4';
        newMember.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-medium">Yeni Ekip Üyesi</h3>
                <button class="text-red-500 hover:text-red-700 delete-team-member-btn">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">İsim</label>
                    <input type="text" class="team-name w-full px-3 py-1 border border-gray-300 rounded-md text-sm" placeholder="Adı Soyadı">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Pozisyon</label>
                    <input type="text" class="team-position w-full px-3 py-1 border border-gray-300 rounded-md text-sm" placeholder="Örn: Editör">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea class="team-description w-full px-3 py-1 border border-gray-300 rounded-md text-sm" rows="2" placeholder="Ekip üyesi hakkında kısa açıklama"></textarea>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Fotoğraf URL</label>
                    <input type="text" class="team-image w-full px-3 py-1 border border-gray-300 rounded-md text-sm" placeholder="images/team-photo.jpg">
                </div>
            </div>
        `;
        teamMembersContainer.appendChild(newMember);
        
        // Yeni eklenen üye için silme butonuna event listener ekle
        newMember.querySelector('.delete-team-member-btn').addEventListener('click', function() {
            const teamMember = this.closest('.team-member');
            showConfirmModal('Bu ekip üyesini silmek istediğinizden emin misiniz?', function() {
                teamMember.remove();
            });
        });
    });
    
    // Mevcut ekip üyelerinin silme butonları
    document.querySelectorAll('.delete-team-member-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const teamMember = this.closest('.team-member');
            showConfirmModal('Bu ekip üyesini silmek istediğinizden emin misiniz?', function() {
                teamMember.remove();
            });
        });
    });
}

// Değişiklikleri kaydetme fonksiyonu
async function saveChanges(e) {
    // Formun varsayılan davranışını engelle (sayfa yenileme)
    if (e) e.preventDefault();
    
    try {
        // Element kontrollerini yap
        const pageTitleEl = document.getElementById('pageTitle');
        const pageSubtitleEl = document.getElementById('pageSubtitle');
        const aboutSectionTitleEl = document.getElementById('aboutSectionTitle');
        const aboutContentEl = document.getElementById('aboutContent');
        const visionContentEl = document.getElementById('visionContent');
        const missionContentEl = document.getElementById('missionContent');
        
        if (!pageTitleEl || !pageSubtitleEl || !aboutSectionTitleEl || !aboutContentEl || !visionContentEl || !missionContentEl) {
            console.error('Gerekli form elementleri bulunamadı');
            showNotification('Form elementleri bulunamadı. Sayfa yeniden yüklenecek.', 'error');
            setTimeout(() => window.location.reload(), 2000);
            return false;
        }
        
        // Bilgileri topla
        const timelineItems = getTimelineItems();
        const teamMembers = getTeamMembers();
        
        const aboutData = {
            page_title: pageTitleEl.value || 'Hakkımızda',
            page_subtitle: pageSubtitleEl.value || 'Kritik Yayınları\'nın hikayesi ve vizyonu',
            about_section_title: aboutSectionTitleEl.value || 'Biz Kimiz?',
            about_content: aboutContentEl.value || '',
            vision_content: visionContentEl.value || '',
            mission_content: missionContentEl.value || '',
            timeline_items: timelineItems,
            team_members: teamMembers,
            updated_at: new Date().toISOString()
        };
        
        console.log('Kaydedilecek veri:', aboutData);
        console.log('Timeline items:', timelineItems.length);
        console.log('Team members:', teamMembers.length);
        
        // Veritabanına kaydet
        if (window.supabaseClient) {
            try {
                // Önce mevcut veriyi kontrol et, varsa id'yi al
                const { data: existingData, error: fetchError } = await window.supabaseClient
                    .from('about_page')
                    .select('id')
                    .limit(1);
                    
                if (fetchError && fetchError.code !== 'PGRST116') {
                    console.error('Mevcut veri kontrolü hatası:', fetchError);
                    throw fetchError;
                }
                
                // Eğer mevcut veri varsa, id'yi ekle
                if (existingData && existingData.length > 0) {
                    aboutData.id = existingData[0].id;
                } else {
                    // Yeni kayıt için created_at ekle
                    aboutData.created_at = new Date().toISOString();
                }
                
                // Upsert işlemi yap
                const { data, error } = await window.supabaseClient
                    .from('about_page')
                    .upsert([aboutData], { 
                        onConflict: 'id',
                        returning: 'minimal'
                    });
                    
                if (error) {
                    console.error('Veritabanı güncelleme hatası:', error);
                    throw error;
                }
                
                console.log('Veritabanı güncellemesi başarılı');
                
            } catch (dbError) {
                console.error('Veritabanı işlemi başarısız:', dbError);
                showNotification('Veritabanı güncelleme sırasında bir hata oluştu: ' + dbError.message, 'error');
                
                // Veritabanı hatası olsa bile localStorage'a kaydet
                try {
                    localStorage.setItem('kritik_about_page_data', JSON.stringify(aboutData));
                    showNotification('Veriler yerel olarak kaydedildi. Lütfen daha sonra tekrar deneyin.', 'warning');
                } catch (storageError) {
                    console.error('LocalStorage kayıt hatası:', storageError);
                    showNotification('Kaydetme işlemi tamamen başarısız oldu.', 'error');
                }
                return false;
            }
        }
        
        // LocalStorage'a verileri kaydet (frontend tarafının görmesi için)
        try {
            // LocalStorage'a yaz
            localStorage.setItem('kritik_about_page_data', JSON.stringify(aboutData));
            
            // Değişiklik yapıldığını belirt
            const event = new CustomEvent('storage', {
                detail: {
                    key: 'kritik_about_page_data',
                    newValue: JSON.stringify(aboutData)
                }
            });
            window.dispatchEvent(event);
            
            // Ayrıca genel güncelleme sistemine de bildir
            localStorage.setItem('kritik-yayinlari-updates', JSON.stringify({
                timestamp: new Date().getTime(),
                message: {
                    type: 'about_page',
                    action: 'update',
                    data: aboutData,
                    timestamp: new Date().toISOString()
                }
            }));
            
            // Storage event'ini manuel olarak tetikle (farklı sekmeleri haberdar etmek için)
            const generalEvent = new CustomEvent('storage', {
                detail: {
                    key: 'kritik-yayinlari-updates',
                    newValue: JSON.stringify({
                        timestamp: new Date().getTime(),
                        message: {
                            type: 'about_page',
                            action: 'update',
                            data: aboutData,
                            timestamp: new Date().toISOString()
                        }
                    })
                }
            });
            window.dispatchEvent(generalEvent);
            
            console.log('LocalStorage ile bildirim gönderildi, frontend güncellenecek');
            
            // Başarılı bildirimini göster
            showNotification('Hakkımızda sayfası başarıyla güncellendi!', 'success');
            
        } catch (storageError) {
            console.warn('LocalStorage\'a kayıt yapılamadı:', storageError);
            showNotification('İçerik kaydedildi, ancak önbelleğe yazılamadı', 'warning');
        }
        
        return true;
        
    } catch (error) {
        console.error('Kaydetme işlemi sırasında bir hata oluştu:', error);
        showNotification('Kaydetme işlemi sırasında bir hata oluştu: ' + error.message, 'error');
        return false;
    }
}

// Timeline öğelerini topla
function getTimelineItems() {
    const items = [];
    document.querySelectorAll('.timeline-item').forEach(item => {
        const titleInput = item.querySelector('.timeline-title') || item.querySelector('h3');
        const title = titleInput.tagName === 'INPUT' ? titleInput.value : titleInput.textContent;
        const content = item.querySelector('.timeline-content').value;
        
        items.push({
            title: title,
            content: content
        });
    });
    return items;
}

// Ekip üyelerini topla
function getTeamMembers() {
    const members = [];
    document.querySelectorAll('.team-member').forEach(member => {
        members.push({
            name: member.querySelector('.team-name').value,
            position: member.querySelector('.team-position').value,
            description: member.querySelector('.team-description').value,
            image: member.querySelector('.team-image').value
        });
    });
    return members;
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notification.classList.remove('bg-green-500', 'bg-red-500');
    if (type === 'success') {
        notification.classList.add('bg-green-500');
    } else {
        notification.classList.add('bg-red-500');
    }
    
    notificationMessage.textContent = message;
    
    // Bildirimi göster
    notification.classList.remove('translate-y-20', 'opacity-0');
    
    // 3 saniye sonra gizle
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Onay modalını gösterme
function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    confirmMessage.textContent = message;
    modal.classList.remove('hidden');
    
    // Onayla butonuna tıklandığında
    const confirmAction = function() {
        onConfirm();
        modal.classList.add('hidden');
        confirmBtn.removeEventListener('click', confirmAction);
        cancelBtn.removeEventListener('click', cancelAction);
    };
    
    // İptal butonuna tıklandığında
    const cancelAction = function() {
        modal.classList.add('hidden');
        confirmBtn.removeEventListener('click', confirmAction);
        cancelBtn.removeEventListener('click', cancelAction);
    };
    
    confirmBtn.addEventListener('click', confirmAction);
    cancelBtn.addEventListener('click', cancelAction);
} 