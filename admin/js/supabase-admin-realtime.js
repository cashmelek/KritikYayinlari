// Admin Paneli Gerçek Zamanlı Güncellemeler
// Gerçek zamanlı güncelleme kanallarını başlatır ve admin paneli içinde kullanılır

// Gerçek zamanlı güncellemeler için tüm kanalları kurma
function setupAdminRealtimeChannels() {
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return null;
  }
  
  // Kitaplar için gerçek zamanlı kanal
  const booksChannel = window.supabaseClient.channel('admin:books')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'books' },
      (payload) => {
        console.log('Admin: Kitap değişikliği algılandı:', payload);
        
        // Kitap değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('admin-book-changed', { detail: payload });
        window.dispatchEvent(event);
        
        // Kitaplar sayfasını yeniden yükle (eğer açıksa)
        refreshBooksPage();
      }
    )
    .subscribe();
  
  // Yazarlar için gerçek zamanlı kanal
  const authorsChannel = window.supabaseClient.channel('admin:authors')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'authors' },
      (payload) => {
        console.log('Admin: Yazar değişikliği algılandı:', payload);
        
        // Yazar değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('admin-author-changed', { detail: payload });
        window.dispatchEvent(event);
        
        // Yazarlar sayfasını yeniden yükle (eğer açıksa)
        refreshAuthorsPage();
      }
    )
    .subscribe();
    
  // Bannerlar için gerçek zamanlı kanal
  const bannersChannel = window.supabaseClient.channel('admin:banners')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'banners' },
      (payload) => {
        console.log('Admin: Banner değişikliği algılandı:', payload);
        
        // Banner değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('admin-banner-changed', { detail: payload });
        window.dispatchEvent(event);
        
        // Banner sayfasını yeniden yükle (eğer açıksa)
        refreshBannersPage();
      }
    )
    .subscribe();
    
  // İletişim sayfası için gerçek zamanlı kanal
  const contactChannel = window.supabaseClient.channel('admin:contact_page')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'contact_page' },
      (payload) => {
        console.log('Admin: İletişim sayfası değişikliği algılandı:', payload);
        
        // İletişim sayfası değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('admin-contact-changed', { detail: payload });
        window.dispatchEvent(event);
        
        // İletişim sayfasını yeniden yükle (eğer açıksa)
        refreshContactPage();
      }
    )
    .subscribe();
  
  // Sayfa kapandığında abonelikleri iptal et
  window.addEventListener('beforeunload', () => {
    booksChannel.unsubscribe();
    authorsChannel.unsubscribe();
    bannersChannel.unsubscribe();
    contactChannel.unsubscribe();
  });
  
  return {
    books: booksChannel,
    authors: authorsChannel,
    banners: bannersChannel,
    contact: contactChannel
  };
}

// Kitaplar sayfasını yeniden yükle
function refreshBooksPage() {
  if (window.location.pathname.includes('kitaplar.html')) {
    if (typeof loadBooks === 'function') {
      loadBooks();
      console.log('Admin: Kitaplar sayfası yenilendi');
    }
  }
}

// Yazarlar sayfasını yeniden yükle
function refreshAuthorsPage() {
  if (window.location.pathname.includes('yazarlar.html')) {
    if (typeof loadAuthors === 'function') {
      loadAuthors();
      console.log('Admin: Yazarlar sayfası yenilendi');
    }
  }
}

// Bannerlar sayfasını yeniden yükle
function refreshBannersPage() {
  if (window.location.pathname.includes('bannerlar.html')) {
    if (typeof loadBanners === 'function') {
      loadBanners();
      console.log('Admin: Bannerlar sayfası yenilendi');
    }
  }
}

// İletişim sayfasını yeniden yükle
function refreshContactPage() {
  if (window.location.pathname.includes('iletisim.html')) {
    if (typeof loadExistingData === 'function') {
      loadExistingData();
      console.log('Admin: İletişim sayfası yenilendi');
    }
  }
}

// Frontend'e değişiklikleri bildir
function notifyContactChange(contactData, changeType = 'update') {
  try {
    console.log(`İletişim sayfası değişikliği bildiriliyor (${changeType}):`, contactData);
    
    // 1. BroadcastChannel API ile bildirim (aynı domain farklı pencereler arası)
    if ('BroadcastChannel' in window) {
      try {
        const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
        broadcastChannel.postMessage({
          type: 'contact_page',
          data: contactData,
          timestamp: new Date().getTime()
        });
        console.log('BroadcastChannel ile bildirim gönderildi');
      } catch (bcError) {
        console.error('BroadcastChannel hatası:', bcError);
      }
    }
    
    // 2. LocalStorage ile bildirim (BroadcastChannel desteklenmeyen tarayıcılar için)
    try {
      localStorage.setItem('kritik-yayinlari-updates', JSON.stringify({
        message: {
          type: 'contact_page',
          data: contactData
        },
        timestamp: new Date().getTime()
      }));
      console.log('LocalStorage ile bildirim gönderildi');
    } catch (lsError) {
      console.error('LocalStorage hatası:', lsError);
    }
    
    // 3. Gerçek zamanlı tetikleme için özel event
    const event = new CustomEvent('admin-contact-changed', { 
      detail: {
        type: changeType,
        new: contactData
      }
    });
    window.dispatchEvent(event);
    console.log('Özel event tetiklendi');
    
    return true;
  } catch (error) {
    console.error('İletişim değişikliği bildirme hatası:', error);
    return false;
  }
}

// Gerçek zamanlı güncellemelere abone olma
document.addEventListener('DOMContentLoaded', function() {
  // Admin sayfalarında gerçek zamanlı güncellemeleri başlat
  setupAdminRealtimeChannels();
  console.log('Admin gerçek zamanlı güncellemeler başlatıldı');
  
  // Kitap ekleme/güncelleme sayfalarında olayları dinle
  document.addEventListener('admin-book-changed', function(event) {
    console.log('Kitap değişikliği olayı alındı:', event.detail);
    updateBooksList(event.detail);
  });
  
  // Yazar ekleme/güncelleme sayfalarında olayları dinle
  document.addEventListener('admin-author-changed', function(event) {
    console.log('Yazar değişikliği olayı alındı:', event.detail);
    updateAuthorsList(event.detail);
  });
  
  // Banner ekleme/güncelleme sayfalarında olayları dinle
  document.addEventListener('admin-banner-changed', function(event) {
    console.log('Banner değişikliği olayı alındı:', event.detail);
    updateBannersList(event.detail);
  });
  
  // İletişim sayfası değişikliklerini dinle
  document.addEventListener('admin-contact-changed', function(event) {
    console.log('İletişim sayfası değişikliği olayı alındı:', event.detail);
    updateContactPage(event.detail);
  });
});

// Kitap listesi tablosunu güncelle
function updateBooksList(payload) {
  const booksTable = document.getElementById('books-table');
  if (!booksTable) return;
  
  // Kitaplar listesini yeniden yükle
  if (typeof loadBooks === 'function') {
    loadBooks();
  }
}

// Yazar listesi tablosunu güncelle
function updateAuthorsList(payload) {
  const authorsTable = document.getElementById('authors-table');
  if (!authorsTable) return;
  
  // Yazarlar listesini yeniden yükle
  if (typeof loadAuthors === 'function') {
    loadAuthors();
  }
}

// Banner listesi tablosunu güncelle
function updateBannersList(payload) {
  const bannersTable = document.getElementById('banners-table');
  if (!bannersTable) return;
  
  // Bannerlar listesini yeniden yükle
  if (typeof loadBanners === 'function') {
    loadBanners();
  }
}

// İletişim sayfasını güncelle
function updateContactPage(payload) {
  // İletişim sayfasında bir güncelleme gerekiyorsa burada işle
  if (window.location.pathname.includes('iletisim.html')) {
    if (typeof loadExistingData === 'function') {
      loadExistingData();
    }
  }
}

// Global değişken olarak dışa aktar
window.setupAdminRealtimeChannels = setupAdminRealtimeChannels;
window.notifyContactChange = notifyContactChange;
