// İletişim Admin Sayfası JS
document.addEventListener('DOMContentLoaded', function() {
    // Supabase bağlantısını başlat
    initSupabase();
    
    // Mevcut verileri yükle
    loadExistingData();
    
    // Telefon numaraları için
    initPhoneNumbers();
    
    // E-posta adresleri için
    initEmails();
    
    // Ofis saatleri için
    initOfficeHours();
    
    // Kitabevi saatleri için
    initBookstoreHours();
    
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
        
        console.log('Veritabanından mevcut veriler yükleniyor...');
        
        const { data, error } = await window.supabaseClient
            .from('contact_page')
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
            
            // Adres - null kontrolü ile
            const addressElement = document.getElementById('addressInfo');
            if (addressElement && data.address) {
                addressElement.value = data.address;
            }
            
            // Harita iframe - null kontrolü ile
            const mapIframeElement = document.getElementById('mapIframe');
            if (mapIframeElement && data.map_iframe) {
                mapIframeElement.value = data.map_iframe;
            }
            
            // Form aktif/pasif - null kontrolü ile
            const formEnabledElement = document.getElementById('formEnabled');
            if (formEnabledElement) {
                formEnabledElement.checked = data.enable_contact_form !== false;
            }
            
            // Başarı mesajı - null kontrolü ile
            const successMessageElement = document.getElementById('successMessage');
            if (successMessageElement) {
                if (data.success_message) {
                    successMessageElement.value = data.success_message;
                } else {
                    successMessageElement.value = 'Mesajınız için teşekkür ederiz! En kısa sürede size dönüş yapacağız.';
                }
            }
            
            // Telefon numaraları - null ve array kontrolü ile
            if (data.phone_numbers && Array.isArray(data.phone_numbers) && data.phone_numbers.length > 0) {
                loadPhoneNumbers(data.phone_numbers);
            }
            
            // E-posta adresleri - null ve array kontrolü ile
            if (data.email_addresses && Array.isArray(data.email_addresses) && data.email_addresses.length > 0) {
                loadEmailAddresses(data.email_addresses);
            }
            
            // Ofis saatleri - null ve array kontrolü ile
            if (data.office_hours && Array.isArray(data.office_hours) && data.office_hours.length > 0) {
                loadOfficeHours(data.office_hours);
            }
            
            // Kitabevi saatleri - null ve array kontrolü ile
            if (data.bookstore_hours && Array.isArray(data.bookstore_hours) && data.bookstore_hours.length > 0) {
                loadBookstoreHours(data.bookstore_hours);
            }
            
            showNotification('Mevcut veriler başarıyla yüklendi', 'success');
        } else {
            console.warn('Veritabanından veri alınamadı veya boş');
        }
    } catch (error) {
        console.error('Mevcut veriler yüklenirken hata oluştu:', error);
        showNotification('Veriler yüklenirken beklenmeyen bir hata oluştu', 'error');
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

// Telefon numaraları işlemleri
function initPhoneNumbers() {
    // Telefon numarası silme butonları için event listener
    document.querySelectorAll('.delete-phone').forEach(btn => {
        btn.addEventListener('click', function() {
            const phoneContainer = this.closest('.flex');
            
            // En az bir telefon numarası olmalı
            const allPhones = document.querySelectorAll('.phone-number');
            if (allPhones.length <= 1) {
                showNotification('En az bir telefon numarası olmalıdır!', 'error');
                return;
            }
            
            showConfirmModal('Bu telefon numarasını silmek istediğinizden emin misiniz?', function() {
                phoneContainer.remove();
            });
        });
    });
    
    // Yeni telefon numarası ekleme
    document.getElementById('addPhoneBtn').addEventListener('click', function() {
        const lastPhone = document.querySelector('.phone-number').closest('.flex');
        const newPhone = lastPhone.cloneNode(true);
        
        // Inputu temizle
        newPhone.querySelector('.phone-number').value = '';
        
        // Silme butonu için event listener
        newPhone.querySelector('.delete-phone').addEventListener('click', function() {
            const phoneContainer = this.closest('.flex');
            
            // En az bir telefon numarası olmalı
            const allPhones = document.querySelectorAll('.phone-number');
            if (allPhones.length <= 1) {
                showNotification('En az bir telefon numarası olmalıdır!', 'error');
                return;
            }
            
            showConfirmModal('Bu telefon numarasını silmek istediğinizden emin misiniz?', function() {
                phoneContainer.remove();
            });
        });
        
        // Yeni öğeyi ekle
        lastPhone.parentNode.insertBefore(newPhone, document.getElementById('addPhoneBtn'));
    });
}

// E-posta adresleri işlemleri
function initEmails() {
    // E-posta silme butonları için event listener
    document.querySelectorAll('.delete-email').forEach(btn => {
        btn.addEventListener('click', function() {
            const emailContainer = this.closest('.flex');
            
            // En az bir e-posta adresi olmalı
            const allEmails = document.querySelectorAll('.email-address');
            if (allEmails.length <= 1) {
                showNotification('En az bir e-posta adresi olmalıdır!', 'error');
                return;
            }
            
            showConfirmModal('Bu e-posta adresini silmek istediğinizden emin misiniz?', function() {
                emailContainer.remove();
            });
        });
    });
    
    // Yeni e-posta adresi ekleme
    document.getElementById('addEmailBtn').addEventListener('click', function() {
        const lastEmail = document.querySelector('.email-address').closest('.flex');
        const newEmail = lastEmail.cloneNode(true);
        
        // Inputu temizle
        newEmail.querySelector('.email-address').value = '';
        
        // Silme butonu için event listener
        newEmail.querySelector('.delete-email').addEventListener('click', function() {
            const emailContainer = this.closest('.flex');
            
            // En az bir e-posta adresi olmalı
            const allEmails = document.querySelectorAll('.email-address');
            if (allEmails.length <= 1) {
                showNotification('En az bir e-posta adresi olmalıdır!', 'error');
                return;
            }
            
            showConfirmModal('Bu e-posta adresini silmek istediğinizden emin misiniz?', function() {
                emailContainer.remove();
            });
        });
        
        // Yeni öğeyi ekle
        lastEmail.parentNode.insertBefore(newEmail, document.getElementById('addEmailBtn'));
    });
}

// Ofis saatleri işlemleri
function initOfficeHours() {
    // Çalışma saati silme butonları
    document.querySelectorAll('#officeHours .delete-hours-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const hoursItem = this.closest('.office-hour-item');
            
            // En az bir çalışma saati olmalı
            const allItems = document.querySelectorAll('.office-hour-item');
            if (allItems.length <= 1) {
                showNotification('En az bir çalışma saati olmalıdır!', 'error');
                return;
            }
            
            showConfirmModal('Bu çalışma saatini silmek istediğinizden emin misiniz?', function() {
                hoursItem.remove();
            });
        });
    });
    
    // Yeni ofis çalışma saati ekleme
    document.getElementById('addOfficeHoursBtn').addEventListener('click', function() {
        const hoursContainer = document.getElementById('officeHours');
        const lastItem = hoursContainer.querySelector('.office-hour-item');
        const newItem = lastItem.cloneNode(true);
        
        // Inputları temizle
        newItem.querySelector('.office-day').value = '';
        newItem.querySelector('.office-hours').value = '';
        
        // Silme butonu için event listener
        newItem.querySelector('.delete-hours-btn').addEventListener('click', function() {
            const hoursItem = this.closest('.office-hour-item');
            
            // En az bir çalışma saati olmalı
            const allItems = document.querySelectorAll('.office-hour-item');
            if (allItems.length <= 1) {
                showNotification('En az bir çalışma saati olmalıdır!', 'error');
                return;
            }
            
            showConfirmModal('Bu çalışma saatini silmek istediğinizden emin misiniz?', function() {
                hoursItem.remove();
            });
        });
        
        // Yeni öğeyi ekle
        hoursContainer.insertBefore(newItem, document.getElementById('addOfficeHoursBtn'));
    });
}

// Kitabevi saatleri işlemleri
function initBookstoreHours() {
    // Çalışma saati silme butonları
    document.querySelectorAll('#bookstoreHours .delete-hours-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const hoursItem = this.closest('.bookstore-hour-item');
            
            // En az bir çalışma saati olmalı
            const allItems = document.querySelectorAll('.bookstore-hour-item');
            if (allItems.length <= 1) {
                showNotification('En az bir çalışma saati olmalıdır!', 'error');
                return;
            }
            
            showConfirmModal('Bu çalışma saatini silmek istediğinizden emin misiniz?', function() {
                hoursItem.remove();
            });
        });
    });
    
    // Yeni kitabevi çalışma saati ekleme
    document.getElementById('addBookstoreHoursBtn').addEventListener('click', function() {
        const hoursContainer = document.getElementById('bookstoreHours');
        const lastItem = hoursContainer.querySelector('.bookstore-hour-item');
        const newItem = lastItem.cloneNode(true);
        
        // Inputları temizle
        newItem.querySelector('.bookstore-day').value = '';
        newItem.querySelector('.bookstore-hours').value = '';
        
        // Silme butonu için event listener
        newItem.querySelector('.delete-hours-btn').addEventListener('click', function() {
            const hoursItem = this.closest('.bookstore-hour-item');
            
            // En az bir çalışma saati olmalı
            const allItems = document.querySelectorAll('.bookstore-hour-item');
            if (allItems.length <= 1) {
                showNotification('En az bir çalışma saati olmalıdır!', 'error');
                return;
            }
            
            showConfirmModal('Bu çalışma saatini silmek istediğinizden emin misiniz?', function() {
                hoursItem.remove();
            });
        });
        
        // Yeni öğeyi ekle
        hoursContainer.insertBefore(newItem, document.getElementById('addBookstoreHoursBtn'));
    });
}

// Değişiklikleri kaydetme fonksiyonu
async function saveChanges(e) {
    // Formun varsayılan davranışını engelle (sayfa yenileme)
    if (e) e.preventDefault();
    
    try {
        // Element kontrollerini yap
        const addressEl = document.getElementById('addressInfo');
        const mapIframeEl = document.getElementById('mapIframe');
        const formEnabledEl = document.getElementById('formEnabled');
        const successMessageEl = document.getElementById('successMessage');
        const hoursAdditionalInfoEl = document.getElementById('hoursAdditionalInfo');
        const contactFormTitleEl = document.getElementById('contactFormTitle');
        const privacyTextEl = document.getElementById('privacyText');
        
        // Verileri topla
        const phoneNumbers = getPhoneNumbers();
        const emailAddresses = getEmailAddresses();
        const officeHours = getOfficeHours();
        const bookstoreHours = getBookstoreHours();
        
        const contactData = {
            address: addressEl ? addressEl.value : '',
            map_iframe: mapIframeEl ? mapIframeEl.value : '',
            enable_contact_form: formEnabledEl ? formEnabledEl.checked : true,
            success_message: successMessageEl ? successMessageEl.value : 'Mesajınız için teşekkür ederiz! En kısa sürede size dönüş yapacağız.',
            phone_numbers: phoneNumbers,
            email_addresses: emailAddresses,
            office_hours: officeHours,
            bookstore_hours: bookstoreHours,
            hours_additional_info: hoursAdditionalInfoEl ? hoursAdditionalInfoEl.value : '',
            contact_form_title: contactFormTitleEl ? contactFormTitleEl.value : 'İletişim Formu',
            privacy_text: privacyTextEl ? privacyTextEl.value : '',
            updated_at: new Date().toISOString()
        };
        
        console.log('Kaydedilecek iletişim verileri:', contactData);
        console.log('Telefon numaraları:', phoneNumbers.length);
        console.log('E-posta adresleri:', emailAddresses.length);
        console.log('Ofis saatleri:', officeHours.length);
        console.log('Kitabevi saatleri:', bookstoreHours.length);
        
        // Veritabanına kaydet
        if (window.supabaseClient) {
            try {
                // Önce mevcut veriyi kontrol et, varsa id'yi al
                const { data: existingData, error: fetchError } = await window.supabaseClient
                    .from('contact_page')
                    .select('id')
                    .limit(1);
                    
                if (fetchError && fetchError.code !== 'PGRST116') {
                    console.error('Mevcut veri kontrolü hatası:', fetchError);
                    throw fetchError;
                }
                
                // Eğer mevcut veri varsa, id'yi ekle
                if (existingData && existingData.length > 0) {
                    contactData.id = existingData[0].id;
                } else {
                    // Yeni kayıt için created_at ekle
                    contactData.created_at = new Date().toISOString();
                }
                
                // Upsert işlemi yap
                const { data, error } = await window.supabaseClient
                    .from('contact_page')
                    .upsert([contactData], { 
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
                    localStorage.setItem('kritik_contact_page_data', JSON.stringify(contactData));
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
            localStorage.setItem('kritik_contact_page_data', JSON.stringify(contactData));
            
            // Değişiklik yapıldığını belirt
            const event = new CustomEvent('storage', {
                detail: {
                    key: 'kritik_contact_page_data',
                    newValue: JSON.stringify(contactData)
                }
            });
            window.dispatchEvent(event);
            
            // Ayrıca genel güncelleme sistemine de bildir
            localStorage.setItem('kritik-yayinlari-updates', JSON.stringify({
                timestamp: new Date().getTime(),
                message: {
                    type: 'contact_page',
                    action: 'update',
                    data: contactData,
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
                            type: 'contact_page',
                            action: 'update',
                            data: contactData,
                            timestamp: new Date().toISOString()
                        }
                    })
                }
            });
            window.dispatchEvent(generalEvent);
            
            console.log('LocalStorage ile bildirim gönderildi, frontend güncellenecek');
            
            // Başarılı bildirimini göster
            showNotification('İletişim sayfası başarıyla güncellendi!', 'success');
            
        } catch (storageError) {
            console.warn('LocalStorage\'a kayıt yapılamadı:', storageError);
            showNotification('İçerik kaydedildi, ancak önbelleğe yazılamadı', 'warning');
        }
        
        console.log('İletişim bilgileri başarıyla kaydedildi');
        return true;
        
    } catch (error) {
        console.error('Kaydetme işlemi sırasında bir hata oluştu:', error);
        showNotification('Kaydetme işlemi sırasında bir hata oluştu: ' + error.message, 'error');
        return false;
    }
}

// Telefon numaralarını topla
function getPhoneNumbers() {
    const phones = [];
    document.querySelectorAll('.phone-number').forEach(input => {
        // Boş değerleri eklemeyi önle
        if (input.value && input.value.trim() !== '') {
            phones.push(input.value.trim());
        }
    });
    return phones;
}

// Telefon numaralarını yükle
function loadPhoneNumbers(phoneNumbers) {
    try {
        if (!phoneNumbers || phoneNumbers.length === 0) return;
        
        // Konteyner elementi seçelim
        const phoneContainer = document.querySelector('.phone-number').closest('.flex').parentNode;
        if (!phoneContainer) {
            console.error('Telefon numaraları konteyneri bulunamadı');
            return;
        }
        
        // Ekleme düğmesini bulalım
        const addPhoneBtn = document.getElementById('addPhoneBtn');
        if (!addPhoneBtn) {
            console.error('Telefon ekle butonu bulunamadı');
            return;
        }
        
        // Mevcut telefon numarası satırını bulalım
        const firstPhoneRow = document.querySelector('.phone-number').closest('.flex');
        if (!firstPhoneRow) {
            console.error('İlk telefon satırı bulunamadı');
            return;
        }
        
        // İlk telefon satırı dışındaki tüm telefon satırlarını kaldır
        const allPhoneRows = phoneContainer.querySelectorAll('.flex');
        allPhoneRows.forEach((row, index) => {
            if (index > 0 && index < allPhoneRows.length - 1) { // İlk satır ve addPhoneBtn hariç
                row.remove();
            }
        });
        
        // İlk telefon numarasını mevcut input'a yerleştir
        const firstPhoneInput = firstPhoneRow.querySelector('.phone-number');
        if (firstPhoneInput) {
            firstPhoneInput.value = phoneNumbers[0];
        }
        
        // Eğer birden fazla telefon numarası varsa, yeni input'lar oluştur
        if (phoneNumbers.length > 1) {
            // İlk telefon numarasını zaten ekledik, kalan numaralar için döngü kur
            for (let i = 1; i < phoneNumbers.length; i++) {
                const newPhone = firstPhoneRow.cloneNode(true);
                
                // Yeni telefon numarasını ekle
                newPhone.querySelector('.phone-number').value = phoneNumbers[i];
                
                // Silme butonu için event listener
                newPhone.querySelector('.delete-phone').addEventListener('click', function() {
                    const phoneContainer = this.closest('.flex');
                    
                    // En az bir telefon numarası olmalı
                    const allPhones = document.querySelectorAll('.phone-number');
                    if (allPhones.length <= 1) {
                        showNotification('En az bir telefon numarası olmalıdır!', 'error');
                        return;
                    }
                    
                    showConfirmModal('Bu telefon numarasını silmek istediğinizden emin misiniz?', function() {
                        phoneContainer.remove();
                    });
                });
                
                // Yeni öğeyi ekle
                phoneContainer.insertBefore(newPhone, addPhoneBtn);
            }
        }
        
        console.log('Telefon numaraları yüklendi:', phoneNumbers.length);
    } catch (error) {
        console.error('Telefon numaraları yüklenirken hata:', error);
    }
}

// E-posta adreslerini topla
function getEmailAddresses() {
    const emails = [];
    document.querySelectorAll('.email-address').forEach(input => {
        // Boş değerleri eklemeyi önle
        if (input.value && input.value.trim() !== '') {
            emails.push(input.value.trim());
        }
    });
    return emails;
}

// E-posta adreslerini yükle
function loadEmailAddresses(emailAddresses) {
    try {
        if (!emailAddresses || emailAddresses.length === 0) return;
        
        // Konteyner elementi seçelim
        const emailContainer = document.querySelector('.email-address').closest('.flex').parentNode;
        if (!emailContainer) {
            console.error('E-posta konteyneri bulunamadı');
            return;
        }
        
        // Ekleme düğmesini bulalım
        const addEmailBtn = document.getElementById('addEmailBtn');
        if (!addEmailBtn) {
            console.error('E-posta ekle butonu bulunamadı');
            return;
        }
        
        // Mevcut e-posta satırını bulalım
        const firstEmailRow = document.querySelector('.email-address').closest('.flex');
        if (!firstEmailRow) {
            console.error('İlk e-posta satırı bulunamadı');
            return;
        }
        
        // İlk e-posta satırı dışındaki tüm e-posta satırlarını kaldır
        const allEmailRows = emailContainer.querySelectorAll('.flex');
        allEmailRows.forEach((row, index) => {
            if (index > 0 && index < allEmailRows.length - 1) { // İlk satır ve addEmailBtn hariç
                row.remove();
            }
        });
        
        // İlk e-posta adresini mevcut input'a yerleştir
        const firstEmailInput = firstEmailRow.querySelector('.email-address');
        if (firstEmailInput) {
            firstEmailInput.value = emailAddresses[0];
        }
        
        // Eğer birden fazla e-posta adresi varsa, yeni input'lar oluştur
        if (emailAddresses.length > 1) {
            // İlk e-posta adresini zaten ekledik, kalan adresler için döngü kur
            for (let i = 1; i < emailAddresses.length; i++) {
                const newEmail = firstEmailRow.cloneNode(true);
                
                // Yeni e-posta adresini ekle
                newEmail.querySelector('.email-address').value = emailAddresses[i];
                
                // Silme butonu için event listener
                newEmail.querySelector('.delete-email').addEventListener('click', function() {
                    const emailContainer = this.closest('.flex');
                    
                    // En az bir e-posta adresi olmalı
                    const allEmails = document.querySelectorAll('.email-address');
                    if (allEmails.length <= 1) {
                        showNotification('En az bir e-posta adresi olmalıdır!', 'error');
                        return;
                    }
                    
                    showConfirmModal('Bu e-posta adresini silmek istediğinizden emin misiniz?', function() {
                        emailContainer.remove();
                    });
                });
                
                // Yeni öğeyi ekle
                emailContainer.insertBefore(newEmail, addEmailBtn);
            }
        }
        
        console.log('E-posta adresleri yüklendi:', emailAddresses.length);
    } catch (error) {
        console.error('E-posta adresleri yüklenirken hata:', error);
    }
}

// Ofis saatlerini topla
function getOfficeHours() {
    const hours = [];
    const officeItems = document.querySelectorAll('.office-hour-item');
    
    if (officeItems && officeItems.length > 0) {
        officeItems.forEach(item => {
            const dayInput = item.querySelector('.office-day');
            const hoursInput = item.querySelector('.office-hours');
            
            if (dayInput && hoursInput) {
                hours.push({
                    day: dayInput.value,
                    hours: hoursInput.value
                });
            }
        });
    }
    return hours;
}

// Ofis saatlerini yükle
function loadOfficeHours(officeHours) {
    try {
        if (!officeHours || officeHours.length === 0) return;
        
        const officeHoursContainer = document.getElementById('officeHoursList');
        if (!officeHoursContainer) {
            console.warn('officeHoursList elementi bulunamadı');
            return;
        }
        
        // Önce mevcut öğeleri temizle
        officeHoursContainer.innerHTML = '';
        
        // Veritabanından gelen çalışma saatlerini ekle
        officeHours.forEach(item => {
            const hourItem = document.createElement('div');
            hourItem.className = 'office-hour-item flex items-center space-x-2 mb-2';
            hourItem.innerHTML = `
                <input type="text" class="office-day w-1/3 px-3 py-2 border border-gray-300 rounded-md" placeholder="Gün" value="${item.day || ''}">
                <input type="text" class="office-hours w-2/3 px-3 py-2 border border-gray-300 rounded-md" placeholder="Saatler" value="${item.hours || ''}">
                <button type="button" class="delete-hours-btn text-red-500 hover:text-red-700">
                    <i class="ri-delete-bin-line"></i>
                </button>
            `;
            
            officeHoursContainer.appendChild(hourItem);
            
            // Silme butonu için event listener
            hourItem.querySelector('.delete-hours-btn').addEventListener('click', function() {
                showConfirmModal('Bu çalışma saatini silmek istediğinizden emin misiniz?', function() {
                    hourItem.remove();
                });
            });
        });
        
        console.log('Ofis saatleri yüklendi:', officeHours.length);
    } catch (error) {
        console.error('Ofis saatleri yüklenirken hata:', error);
    }
}

// Kitabevi saatlerini topla
function getBookstoreHours() {
    const hours = [];
    const bookstoreItems = document.querySelectorAll('.bookstore-hour-item');
    
    if (bookstoreItems && bookstoreItems.length > 0) {
        bookstoreItems.forEach(item => {
            const dayInput = item.querySelector('.bookstore-day');
            const hoursInput = item.querySelector('.bookstore-hours');
            
            if (dayInput && hoursInput) {
                hours.push({
                    day: dayInput.value,
                    hours: hoursInput.value
                });
            }
        });
    }
    return hours;
}

// Kitabevi saatlerini yükle
function loadBookstoreHours(bookstoreHours) {
    try {
        if (!bookstoreHours || bookstoreHours.length === 0) return;
        
        const bookstoreHoursContainer = document.getElementById('bookstoreHoursList');
        if (!bookstoreHoursContainer) {
            console.warn('bookstoreHoursList elementi bulunamadı');
            return;
        }
        
        // Önce mevcut öğeleri temizle
        bookstoreHoursContainer.innerHTML = '';
        
        // Veritabanından gelen kitabevi saatlerini ekle
        bookstoreHours.forEach(item => {
            const hourItem = document.createElement('div');
            hourItem.className = 'bookstore-hour-item flex items-center space-x-2 mb-2';
            hourItem.innerHTML = `
                <input type="text" class="bookstore-day w-1/3 px-3 py-2 border border-gray-300 rounded-md" placeholder="Gün" value="${item.day || ''}">
                <input type="text" class="bookstore-hours w-2/3 px-3 py-2 border border-gray-300 rounded-md" placeholder="Saatler" value="${item.hours || ''}">
                <button type="button" class="delete-hours-btn text-red-500 hover:text-red-700">
                    <i class="ri-delete-bin-line"></i>
                </button>
            `;
            
            bookstoreHoursContainer.appendChild(hourItem);
            
            // Silme butonu için event listener
            hourItem.querySelector('.delete-hours-btn').addEventListener('click', function() {
                showConfirmModal('Bu kitabevi saatini silmek istediğinizden emin misiniz?', function() {
                    hourItem.remove();
                });
            });
        });
        
        console.log('Kitabevi saatleri yüklendi:', bookstoreHours.length);
    } catch (error) {
        console.error('Kitabevi saatleri yüklenirken hata:', error);
    }
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