// İletişim sayfası için client-side JavaScript
// Bu dosya, İletişim sayfasının içeriğini veritabanından çekerek dinamik olarak günceller

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
    
    console.log('İletişim sayfası yükleniyor, Supabase bağlantısı kuruldu...');
    
    // İletişim sayfası içeriğini yükle
    loadContactPageContent();
    
    // Supabase realtime özelliğini kullanarak değişiklikleri dinle
    setupRealtimeListener();
    
    // BroadcastChannel API ile admin panelinden gelen güncellemeleri dinle
    setupBroadcastListener();
    
    // LocalStorage değişikliklerini dinle (BroadcastChannel desteklenmeyen tarayıcılar için)
    setupLocalStorageListener();
});

// İletişim sayfası içeriğini veritabanından yükler
async function loadContactPageContent() {
    try {
        console.log('Veritabanından iletişim sayfası içeriği alınıyor...');
        
        // Sayfa içeriğini Supabase'den çek
        const { data, error } = await supabaseClient
            .from('contact_page')
            .select('*')
            .single();
        
        if (error) {
            console.error('Veritabanı sorgu hatası:', error);
            throw error;
        }
        
        console.log('Alınan veri:', data);
        
        if (data) {
            // İletişim bilgilerini güncelle
            updateContactInfo(data);
            
            // Çalışma saatlerini güncelle
            updateOfficeHours(data);
            
            // İletişim formunu güncelle
            updateContactForm(data);
            
            // Harita iframe'ini güncelle
            updateMap(data);
            
            console.log('İletişim sayfası içeriği başarıyla güncellendi');
            
            // İçerik yüklendi olarak işaretle
            contentLoaded = true;
            
            // Yükleniyor ekranını gizle
            const loadingOverlay = document.getElementById('loadingOverlay');
            const pageContent = document.getElementById('pageContent');
            
            if (loadingOverlay && pageContent) {
                loadingOverlay.classList.add('hidden');
                pageContent.classList.add('loaded');
            }
        } else {
            console.warn('Veritabanından veri alınamadı veya boş');
            showErrorMessage('İletişim bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        }
    } catch (error) {
        console.error('İletişim sayfası içeriği yüklenirken hata:', error);
        showErrorMessage('İletişim bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
}

// İletişim bilgilerini günceller
function updateContactInfo(data) {
    // Adres
    const addressElement = document.querySelector('.contact-info .address');
    if (addressElement && data.address) {
        addressElement.textContent = data.address;
    }
    
    // Telefon numaraları
    if (data.phone_numbers && data.phone_numbers.length > 0) {
        const phoneContainer = document.querySelector('.contact-info .phone-list');
        if (phoneContainer) {
            phoneContainer.innerHTML = '';
            
            data.phone_numbers.forEach(phone => {
                const phoneItem = document.createElement('li');
                phoneItem.className = 'flex items-center';
                phoneItem.innerHTML = `
                    <i class="ri-phone-line text-primary text-lg mr-3"></i>
                    <span>${phone}</span>
                `;
                phoneContainer.appendChild(phoneItem);
            });
        }
    }
    
    // E-posta adresleri
    if (data.email_addresses && data.email_addresses.length > 0) {
        const emailContainer = document.querySelector('.contact-info .email-list');
        if (emailContainer) {
            emailContainer.innerHTML = '';
            
            data.email_addresses.forEach(email => {
                const emailItem = document.createElement('li');
                emailItem.className = 'flex items-center';
                emailItem.innerHTML = `
                    <i class="ri-mail-line text-primary text-lg mr-3"></i>
                    <span>${email}</span>
                `;
                emailContainer.appendChild(emailItem);
            });
        }
    }
}

// Çalışma saatlerini günceller
function updateOfficeHours(data) {
    // Ofis çalışma saatleri
    if (data.office_hours && data.office_hours.length > 0) {
        const officeHoursContainer = document.querySelector('.office-hours-list');
        if (officeHoursContainer) {
            officeHoursContainer.innerHTML = '';
            
            data.office_hours.forEach(item => {
                const hoursItem = document.createElement('li');
                hoursItem.className = 'flex justify-between border-b border-gray-100 py-2 last:border-0';
                hoursItem.innerHTML = `
                    <span class="font-medium">${item.day}</span>
                    <span>${item.hours}</span>
                `;
                officeHoursContainer.appendChild(hoursItem);
            });
        }
    }
    
    // Kitabevi çalışma saatleri
    if (data.bookstore_hours && data.bookstore_hours.length > 0) {
        const bookstoreHoursContainer = document.querySelector('.bookstore-hours-list');
        if (bookstoreHoursContainer) {
            bookstoreHoursContainer.innerHTML = '';
            
            data.bookstore_hours.forEach(item => {
                const hoursItem = document.createElement('li');
                hoursItem.className = 'flex justify-between border-b border-gray-100 py-2 last:border-0';
                hoursItem.innerHTML = `
                    <span class="font-medium">${item.day}</span>
                    <span>${item.hours}</span>
                `;
                bookstoreHoursContainer.appendChild(hoursItem);
            });
        }
    }
    
    // Ek bilgi
    const additionalInfoElement = document.querySelector('.hours-additional-info');
    if (additionalInfoElement && data.hours_additional_info) {
        additionalInfoElement.textContent = data.hours_additional_info;
    }
}

// İletişim formunu günceller
function updateContactForm(data) {
    // Form başlığı
    const formTitleElement = document.querySelector('.contact-form-title');
    if (formTitleElement && data.contact_form_title) {
        formTitleElement.textContent = data.contact_form_title;
    }
    
    // Gizlilik metni
    const privacyTextElement = document.querySelector('.privacy-text');
    if (privacyTextElement && data.privacy_text) {
        privacyTextElement.textContent = data.privacy_text;
    }
    
    // Form aktif/pasif
    const contactFormElement = document.querySelector('#contactForm');
    if (contactFormElement) {
        // enable_contact_form alanının doğru şekilde kontrol edilmesi
        const isFormEnabled = data.enable_contact_form !== false; // undefined veya null da true olarak değerlendirilir
        
        if (!isFormEnabled) {
            contactFormElement.style.display = 'none';
            
            // Form yerine mesaj göster
            const formContainer = document.querySelector('.contact-form-container');
            if (formContainer) {
                let disabledMessage = document.querySelector('.form-disabled-message');
                
                if (!disabledMessage) {
                    disabledMessage = document.createElement('div');
                    disabledMessage.className = 'form-disabled-message bg-gray-100 p-4 rounded-lg text-center';
                    disabledMessage.innerHTML = '<p>İletişim formu şu anda aktif değildir. Lütfen e-posta veya telefon ile iletişime geçiniz.</p>';
                    formContainer.appendChild(disabledMessage);
                }
            }
        } else {
            contactFormElement.style.display = 'block';
            
            // Varsa pasif mesajını kaldır
            const disabledMessage = document.querySelector('.form-disabled-message');
            if (disabledMessage) {
                disabledMessage.remove();
            }
        }
    }
    
    // Form submit olayı - backend'e form gönderimi
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Daha önce event listener eklenmiş olabilir, önce temizle
        const newContactForm = contactForm.cloneNode(true);
        contactForm.parentNode.replaceChild(newContactForm, contactForm);
        
        newContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            
            // Form verilerini topla
            const formData = {
                name: nameInput.value,
                email: emailInput.value,
                subject: subjectInput.value,
                message: messageInput.value,
                created_at: new Date().toISOString()
            };
            
            try {
                // Veritabanına kaydet
                const { error } = await supabaseClient
                    .from('contact_messages')
                    .insert([formData]);
                
                if (error) throw error;
                
                // Başarılı mesajı göster
                const successMessage = data.success_message || 'Mesajınız için teşekkür ederiz! En kısa sürede size dönüş yapacağız.';
                showFormMessage(successMessage, 'success');
                
                // Formu temizle
                newContactForm.reset();
                
            } catch (error) {
                console.error('Form gönderme hatası:', error);
                showFormMessage('Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.', 'error');
            }
        });
    }
}

// Harita iframe'ini günceller
function updateMap(data) {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer && data.map_iframe) {
        // Güvenlik kontrolü
        if (data.map_iframe.includes('maps.google.com') || data.map_iframe.includes('www.google.com/maps')) {
            let mapUrl = data.map_iframe;
            
            // Eğer tam URL değil de sadece src içeriği ise
            if (!mapUrl.startsWith('http') && !mapUrl.startsWith('<iframe')) {
                mapUrl = `https://www.google.com/maps/embed?${mapUrl}`;
            }
            
            // Eğer URL ise iframe içine koy
            if (!mapUrl.startsWith('<iframe')) {
                mapContainer.innerHTML = `<iframe src="${mapUrl}" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
            } else {
                // Zaten iframe HTML ise doğrudan kullan
                mapContainer.innerHTML = mapUrl;
            }
        } else {
            console.warn('Güvenli olmayan harita URL\'si:', data.map_iframe);
            mapContainer.innerHTML = '<div class="bg-gray-100 p-4 rounded-lg text-center">Harita yüklenemedi.</div>';
        }
    }
}

// Form mesajı göster
function showFormMessage(message, type) {
    const messageContainer = document.getElementById('formMessage');
    if (!messageContainer) return;
    
    messageContainer.className = type === 'success' 
        ? 'bg-green-100 text-green-700 p-4 rounded-lg mt-4' 
        : 'bg-red-100 text-red-700 p-4 rounded-lg mt-4';
    
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
    
    // 5 saniye sonra gizle
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}

// Hata mesajı gösterme
function showErrorMessage(message) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `<div class="bg-red-100 text-red-700 p-4 rounded-lg">${message}</div>`;
    }
    
    // Yükleniyor animasyonunu gizle
    setTimeout(() => {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.classList.add('loaded');
        }
    }, 1000);
}

// Supabase realtime özelliğini kullanarak değişiklikleri dinle
function setupRealtimeListener() {
    if (!window.supabaseClient) {
        console.error('Realtime listener için Supabase bağlantısı bulunamadı!');
        return;
    }
    
    try {
        // contact_page tablosundaki değişiklikleri dinle
        const subscription = supabaseClient
            .channel('contact_page_changes')
            .on('postgres_changes', {
                event: '*',  // INSERT, UPDATE, DELETE olaylarını dinle
                schema: 'public',
                table: 'contact_page'
            }, (payload) => {
                console.log('İletişim sayfasında değişiklik algılandı:', payload);
                
                // Değişikliğe göre içeriği güncelle
                if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                    const data = payload.new;
                    
                    // İçerik yüklenmemişse, tüm sayfa içeriğini yükle
                    if (!contentLoaded) {
                        loadContactPageContent();
                        return;
                    }
                    
                    // İletişim bilgilerini güncelle
                    updateContactInfo(data);
                    
                    // Çalışma saatlerini güncelle
                    updateOfficeHours(data);
                    
                    // İletişim formunu güncelle
                    updateContactForm(data);
                    
                    // Harita iframe'ini güncelle
                    updateMap(data);
                    
                    // Kullanıcıya bildirim göster
                    showNotification('İletişim sayfası içeriği güncellendi!');
                }
            })
            .subscribe();
        
        console.log('İletişim sayfası için realtime listener başarıyla kuruldu');
        
        // Sayfa kapatıldığında aboneliği temizle
        window.addEventListener('beforeunload', () => {
            subscription.unsubscribe();
        });
        
    } catch (error) {
        console.error('Realtime listener kurulurken hata:', error);
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
                
                // İletişim sayfası güncellemelerini kontrol et
                if (event.data && event.data.type === 'contact_page') {
                    console.log('İletişim sayfası güncellemesi alındı:', event.data.data);
                    
                    // İçerik yüklenmemişse, tüm sayfa içeriğini yükle
                    if (!contentLoaded) {
                        loadContactPageContent();
                        return;
                    }
                    
                    // Sayfa içeriğini güncelle
                    const contactData = event.data.data;
                    
                    // İletişim bilgilerini güncelle
                    updateContactInfo(contactData);
                    
                    // Çalışma saatlerini güncelle
                    updateOfficeHours(contactData);
                    
                    // İletişim formunu güncelle
                    updateContactForm(contactData);
                    
                    // Harita iframe'ini güncelle
                    updateMap(contactData);
                    
                    // Kullanıcıya bildirim göster
                    showNotification('İletişim sayfası içeriği güncellendi!');
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
                    
                    // İletişim sayfası güncellemelerini kontrol et
                    if (parsedData.message && parsedData.message.type === 'contact_page') {
                        console.log('İletişim sayfası güncellemesi alındı:', parsedData.message.data);
                        
                        // İçerik yüklenmemişse, tüm sayfa içeriğini yükle
                        if (!contentLoaded) {
                            loadContactPageContent();
                            return;
                        }
                        
                        // Sayfa içeriğini güncelle
                        const contactData = parsedData.message.data;
                        
                        // İletişim bilgilerini güncelle
                        updateContactInfo(contactData);
                        
                        // Çalışma saatlerini güncelle
                        updateOfficeHours(contactData);
                        
                        // İletişim formunu güncelle
                        updateContactForm(contactData);
                        
                        // Harita iframe'ini güncelle
                        updateMap(contactData);
                        
                        // Kullanıcıya bildirim göster
                        showNotification('İletişim sayfası içeriği güncellendi!');
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
        notification.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 z-50';
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