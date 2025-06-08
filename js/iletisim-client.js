// İletişim sayfası için client-side JavaScript
// Bu dosya, İletişim sayfasının içeriğini veritabanından çekerek dinamik olarak günceller

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
    
    // İletişim sayfası verisi güncellendiğinde
    if (key === 'kritik_contact_page_data' && newValue) {
        try {
            const data = JSON.parse(newValue);
            console.log('İletişim sayfası verileri güncellendi:', data);
            updatePageContent(data);
        } catch (error) {
            console.error('Storage event parse hatası:', error);
        }
    }
    
    // Genel güncelleme mesajı geldiğinde
    if (key === 'kritik-yayinlari-updates' && newValue) {
        try {
            const updateData = JSON.parse(newValue);
            
            if (updateData.message && updateData.message.type === 'contact_page' && updateData.message.action === 'update') {
                console.log('Genel güncelleme sisteminden İletişim sayfası güncellemesi alındı:', updateData.message);
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
        // İletişim sayfası verisini kontrol et
        const storedData = localStorage.getItem('kritik_contact_page_data');
        if (storedData) {
            const data = JSON.parse(storedData);
            
            // Eğer data içinde updated_at varsa ve değişmişse güncelle
            if (data.updated_at && (!window.lastContactUpdateTimestamp || window.lastContactUpdateTimestamp !== data.updated_at)) {
                console.log('LocalStorage\'da değişiklik tespit edildi, içerik güncelleniyor');
                window.lastContactUpdateTimestamp = data.updated_at;
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
        const storedData = localStorage.getItem('kritik_contact_page_data');
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
                    .from('contact_page')
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
                    localStorage.setItem('kritik_contact_page_data', JSON.stringify(supabaseData));
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
        
        // Yükleme ekranını gizle
        hideLoadingScreen();
    } catch (error) {
        console.error('Sayfa içeriği yüklenirken hata:', error);
        loadDefaultContent();
        hideLoadingScreen();
    }
}

// Varsayılan içeriği yükle
function loadDefaultContent() {
    console.log('Varsayılan içerik yükleniyor...');
    // Hiçbir şey yapmayabilir, varsayılan HTML içeriği zaten sayfada
    contentLoaded = true;
}

// Sayfa içeriğini güncelleme
function updatePageContent(data) {
    try {
        console.log('İletişim sayfası içeriği güncelleniyor:', data);
        
        // İletişim bilgilerini güncelle - null kontrolü ile
        if (data) {
            updateContactInfo(data);
            updateOfficeHours(data);
            updateContactForm(data);
            updateMap(data);
        }
        
        console.log('İletişim sayfası içeriği başarıyla güncellendi');
        
    } catch (error) {
        console.error('Sayfa içeriği güncellenirken hata:', error);
    }
}

// İletişim bilgilerini günceller
function updateContactInfo(data) {
    try {
        // Adres - null kontrolü ile
        const addressElement = document.querySelector('.contact-info .address span');
        if (addressElement && data.address) {
            addressElement.textContent = data.address;
        }
        
        // Telefon numaraları - null ve array kontrolü ile
        if (data.phone_numbers && Array.isArray(data.phone_numbers) && data.phone_numbers.length > 0) {
            const phoneContainer = document.querySelector('.contact-info .phone-list');
            if (phoneContainer) {
                phoneContainer.innerHTML = '';
                
                data.phone_numbers.forEach(phone => {
                    if (phone && phone.trim()) {
                        const phoneItem = document.createElement('li');
                        phoneItem.className = 'flex items-center';
                        phoneItem.innerHTML = `
                            <i class="ri-phone-line text-primary text-lg mr-3"></i>
                            <span>${phone}</span>
                        `;
                        phoneContainer.appendChild(phoneItem);
                    }
                });
            }
        }
        
        // E-posta adresleri - null ve array kontrolü ile
        if (data.email_addresses && Array.isArray(data.email_addresses) && data.email_addresses.length > 0) {
            const emailContainer = document.querySelector('.contact-info .email-list');
            if (emailContainer) {
                emailContainer.innerHTML = '';
                
                data.email_addresses.forEach(email => {
                    if (email && email.trim()) {
                        const emailItem = document.createElement('li');
                        emailItem.className = 'flex items-center';
                        emailItem.innerHTML = `
                            <i class="ri-mail-line text-primary text-lg mr-3"></i>
                            <span>${email}</span>
                        `;
                        emailContainer.appendChild(emailItem);
                    }
                });
            }
        }
    } catch (error) {
        console.error('İletişim bilgileri güncellenirken hata:', error);
    }
}

// Çalışma saatlerini günceller
function updateOfficeHours(data) {
    try {
        // Ofis çalışma saatleri - null ve array kontrolü ile
        if (data.office_hours && Array.isArray(data.office_hours) && data.office_hours.length > 0) {
            const officeHoursContainer = document.querySelector('.office-hours-list');
            if (officeHoursContainer) {
                officeHoursContainer.innerHTML = '';
                
                data.office_hours.forEach(item => {
                    if (item && item.day && item.hours) {
                        const hoursItem = document.createElement('li');
                        hoursItem.className = 'flex justify-between border-b border-gray-100 py-2 last:border-0';
                        hoursItem.innerHTML = `
                            <span class="font-medium">${item.day}</span>
                            <span>${item.hours}</span>
                        `;
                        officeHoursContainer.appendChild(hoursItem);
                    }
                });
            }
        }
        
        // Kitabevi çalışma saatleri - null ve array kontrolü ile
        if (data.bookstore_hours && Array.isArray(data.bookstore_hours) && data.bookstore_hours.length > 0) {
            const bookstoreHoursContainer = document.querySelector('.bookstore-hours-list');
            if (bookstoreHoursContainer) {
                bookstoreHoursContainer.innerHTML = '';
                
                data.bookstore_hours.forEach(item => {
                    if (item && item.day && item.hours) {
                        const hoursItem = document.createElement('li');
                        hoursItem.className = 'flex justify-between border-b border-gray-100 py-2 last:border-0';
                        hoursItem.innerHTML = `
                            <span class="font-medium">${item.day}</span>
                            <span>${item.hours}</span>
                        `;
                        bookstoreHoursContainer.appendChild(hoursItem);
                    }
                });
            }
        }
        
        // Ek bilgi - null kontrolü ile
        const additionalInfoElement = document.querySelector('.hours-additional-info');
        if (additionalInfoElement && data.hours_additional_info) {
            additionalInfoElement.textContent = data.hours_additional_info;
        }
    } catch (error) {
        console.error('Çalışma saatleri güncellenirken hata:', error);
    }
}

// İletişim formunu günceller
function updateContactForm(data) {
    try {
        // Form başlığı - null kontrolü ile
        const formTitleElement = document.querySelector('.contact-form-title');
        if (formTitleElement && data.contact_form_title) {
            formTitleElement.textContent = data.contact_form_title;
        }
        
        // Gizlilik metni - null kontrolü ile
        const privacyTextElement = document.querySelector('.privacy-text');
        if (privacyTextElement && data.privacy_text) {
            privacyTextElement.textContent = data.privacy_text;
        }
        
        // Form aktif/pasif - null kontrolü ile
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
        setupContactForm(data);
    } catch (error) {
        console.error('İletişim formu güncellenirken hata:', error);
    }
}

// Form gönderi işlemlerini ayarla
function setupContactForm(data) {
    try {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;
        
        // Daha önce event listener eklenmiş olabilir, önce temizle
        const newContactForm = contactForm.cloneNode(true);
        contactForm.parentNode.replaceChild(newContactForm, contactForm);
        
        newContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            
            // Element kontrolü
            if (!nameInput || !emailInput || !subjectInput || !messageInput) {
                console.error('Form elementleri bulunamadı');
                showFormMessage('Form elementleri bulunamadı. Lütfen sayfayı yenileyin.', 'error');
                return;
            }
            
            // Form verilerini topla
            const formData = {
                name: nameInput.value || '',
                email: emailInput.value || '',
                subject: subjectInput.value || '',
                message: messageInput.value || '',
                created_at: new Date().toISOString()
            };
            
            // Gönderme butonunu devre dışı bırak ve loading göster
            const submitBtn = newContactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="ri-loader-2-line animate-spin mr-2"></i> Gönderiliyor...';
                
                try {
                    // LocalStorage'a kaydedebiliriz (örnek)
                    const existingMessages = JSON.parse(localStorage.getItem('contact_form_messages') || '[]');
                    existingMessages.push(formData);
                    localStorage.setItem('contact_form_messages', JSON.stringify(existingMessages));
                    
                    // Başarılı mesajı göster
                    const successMessage = data && data.success_message ? 
                        data.success_message : 
                        'Mesajınız için teşekkür ederiz! En kısa sürede size dönüş yapacağız.';
                    showFormMessage(successMessage, 'success');
                    
                    // Formu temizle
                    newContactForm.reset();
                } catch (error) {
                    console.error('Form gönderimi sırasında hata:', error);
                    showFormMessage('Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.', 'error');
                } finally {
                    // Butonu eski haline getir
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    } catch (error) {
        console.error('Form setup sırasında hata:', error);
    }
}

// Harita iframe'ini günceller
function updateMap(data) {
    try {
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer) return;
        
        if (data.map_iframe) {
            // Mevcut haritayı temizle
            mapContainer.innerHTML = '';
            
            try {
                // URL'i temizleme ve güvenli hale getirme
                let cleanIframeSrc = data.map_iframe;
                
                // İçeriğin Google Maps embed URL'i olduğundan emin ol
                if (cleanIframeSrc.includes('google.com/maps/embed')) {
                    // Harita iframe'ini ekle
                    const iframe = document.createElement('iframe');
                    iframe.className = 'w-full h-full rounded-lg border-0';
                    iframe.frameBorder = "0";
                    iframe.style.border = "0";
                    iframe.src = cleanIframeSrc;
                    iframe.allowFullscreen = true;
                    iframe.loading = "lazy";
                    iframe.referrerPolicy = "no-referrer-when-downgrade";
                    
                    mapContainer.appendChild(iframe);
                    console.log('Harita iframe başarıyla eklendi');
                } else {
                    // Varsayılan Kadıköy haritası
                    const defaultMap = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48170.84554246369!2d29.023479591057594!3d40.98892123833761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab82bea5b9afb%3A0x2e92a483541e2860!2sKad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1684254161112!5m2!1str!2str';
                    
                    const iframe = document.createElement('iframe');
                    iframe.className = 'w-full h-full rounded-lg border-0';
                    iframe.frameBorder = "0";
                    iframe.style.border = "0";
                    iframe.src = defaultMap;
                    iframe.allowFullscreen = true;
                    iframe.loading = "lazy";
                    iframe.referrerPolicy = "no-referrer-when-downgrade";
                    
                    mapContainer.appendChild(iframe);
                    console.log('Geçersiz harita URL\'i, varsayılan harita kullanıldı');
                }
            } catch (iframeError) {
                console.error('Harita iframe oluşturma hatası:', iframeError);
                // Hata durumunda varsayılan harita göster
                mapContainer.innerHTML = `
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48170.84554246369!2d29.023479591057594!3d40.98892123833761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab82bea5b9afb%3A0x2e92a483541e2860!2sKad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1684254161112!5m2!1str!2str" 
                        width="100%" 
                        height="100%" 
                        style="border:0;" 
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>`;
            }
        } else {
            // Varsayılan harita (opsiyonel)
            mapContainer.innerHTML = `
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48170.84554246369!2d29.023479591057594!3d40.98892123833761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab82bea5b9afb%3A0x2e92a483541e2860!2sKad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1684254161112!5m2!1str!2str" 
                    width="100%" 
                    height="100%" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>`;
            console.log('Harita URL\'i bulunamadı, varsayılan harita kullanıldı');
        }
    } catch (error) {
        console.error('Harita güncellenirken hata:', error);
        // Hata durumunda varsayılan harita göster
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48170.84554246369!2d29.023479591057594!3d40.98892123833761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab82bea5b9afb%3A0x2e92a483541e2860!2sKad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1684254161112!5m2!1str!2str" 
                    width="100%" 
                    height="100%" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>`;
        }
    }
}

// Form mesajı göster
function showFormMessage(message, type = 'success') {
    // Form mesaj alanını bul
    let messageContainer = document.querySelector('.form-message');
    
    // Yoksa oluştur
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'form-message mt-4 p-4 rounded-lg';
        
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.insertAdjacentElement('afterend', messageContainer);
        }
    }
    
    // Mesaj tipine göre stil ekle
    messageContainer.className = `form-message mt-4 p-4 rounded-lg ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`;
    messageContainer.textContent = message;
    
    // 5 saniye sonra mesajı kaldır
    setTimeout(() => {
        messageContainer.remove();
    }, 5000);
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

// Yükleniyor göstergesini gizle
function hideLoadingScreen() {
    setTimeout(function() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const pageContent = document.getElementById('pageContent');
        
        if (loadingOverlay && pageContent) {
            loadingOverlay.classList.add('hidden');
            pageContent.classList.add('loaded');
        }
    }, 500);
}

// Sayfanın üstüne kaydırma animasyonu
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}