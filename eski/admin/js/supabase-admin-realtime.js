// Admin Paneli Gerçek Zamanlı Güncellemeler
// Gerçek zamanlı güncelleme kanallarını başlatır ve ana siteye iletilmesi için kullanılır
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
    .subscribe((status) => {
      console.log('Admin: Kitaplar kanalı durumu:', status);
    });
  
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
    .subscribe((status) => {
      console.log('Admin: Yazarlar kanalı durumu:', status);
    });
    
  // Bannerlar için gerçek zamanlı kanal
  const bannersChannel = window.supabaseClient.channel('admin:banners')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'banners' },
      (payload) => {
        console.log('Admin: Banner değişikliği algılandı:', payload);
        
        // Banner değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('admin-banner-changed', { detail: payload });
        window.dispatchEvent(event);
      }
    )
    .subscribe((status) => {
      console.log('Admin: Bannerlar kanalı durumu:', status);
    });
    
  // Hakkımızda sayfası için gerçek zamanlı kanal
  const aboutPageChannel = window.supabaseClient.channel('admin:about_page')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'about_page' },
      (payload) => {
        console.log('Admin: Hakkımızda sayfası değişikliği algılandı:', payload);
        
        // Hakkımızda sayfası değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('admin-about-page-changed', { detail: payload });
        window.dispatchEvent(event);
        
        // Hakkımızda sayfasını yeniden yükle (eğer açıksa)
        refreshAboutPage();
      }
    )
    .subscribe((status) => {
      console.log('Admin: Hakkımızda sayfası kanalı durumu:', status);
    });
    
  // İletişim sayfası için gerçek zamanlı kanal
  const contactPageChannel = window.supabaseClient.channel('admin:contact_page')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'contact_page' },
      (payload) => {
        console.log('Admin: İletişim sayfası değişikliği algılandı:', payload);
        
        // İletişim sayfası değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('admin-contact-page-changed', { detail: payload });
        window.dispatchEvent(event);
        
        // İletişim sayfasını yeniden yükle (eğer açıksa)
        refreshContactPage();
      }
    )
    .subscribe((status) => {
      console.log('Admin: İletişim sayfası kanalı durumu:', status);
    });
  
  // Sayfa kapandığında abonelikleri iptal et
  window.addEventListener('beforeunload', () => {
    booksChannel.unsubscribe();
    authorsChannel.unsubscribe();
    bannersChannel.unsubscribe();
    aboutPageChannel.unsubscribe();
    contactPageChannel.unsubscribe();
  });
  
  return {
    books: booksChannel,
    authors: authorsChannel,
    banners: bannersChannel,
    aboutPage: aboutPageChannel,
    contactPage: contactPageChannel
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

// Hakkımızda sayfasını yeniden yükle
function refreshAboutPage() {
  if (window.location.pathname.includes('hakkimizda.html')) {
    if (typeof loadExistingData === 'function') {
      loadExistingData();
      console.log('Admin: Hakkımızda sayfası yenilendi');
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

// Kitap ekledikten/güncelledikten sonra çağrılacak fonksiyon
function notifyBookChange(bookData, action = 'update') {
  try {
    console.log(`Admin: Kitap ${action === 'insert' ? 'eklendi' : 'güncellendi'}:`, bookData);
    
    // Mesaj içeriğini hazırla
    const message = {
      type: 'book',
      action: action,
      data: bookData,
      timestamp: new Date().toISOString()
    };
    
    // Önce BroadcastChannel API'nin desteklenip desteklenmediğini kontrol et
    if ('BroadcastChannel' in window) {
      try {
        // Modern tarayıcılar için BroadcastChannel kullan
        const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
        broadcastChannel.postMessage(message);
        
        // Bir süre sonra kanalı kapat
        setTimeout(() => broadcastChannel.close(), 1000);
        console.log('BroadcastChannel ile bildirim gönderildi');
      } catch (broadcastError) {
        console.error('BroadcastChannel hatası:', broadcastError);
        // Hata durumunda localStorage'a geç
        sendViaLocalStorage(message);
      }
    } else {
      // Eski tarayıcılar için localStorage yöntemini kullan
      console.warn('BroadcastChannel API desteklenmiyor. LocalStorage yöntemi kullanılıyor.');
      sendViaLocalStorage(message);
    }
    
  } catch (error) {
    console.error('Admin: Kitap değişikliği bildirimi gönderilirken hata:', error);
  }
}

// LocalStorage aracılığıyla mesaj gönderme
function sendViaLocalStorage(message) {
  try {
    // Benzersiz bir istemci ID'si oluştur
    const clientId = 'admin_' + Math.random().toString(36).substring(2, 9);
    
    // LocalStorage'a yaz
    localStorage.setItem('kritik-yayinlari-updates', JSON.stringify({
      clientId: clientId,
      timestamp: new Date().getTime(),
      message: message
    }));
    
    console.log('LocalStorage ile bildirim gönderildi');
  } catch (error) {
    console.error('LocalStorage mesajı gönderilirken hata:', error);
  }
}

// Yazar ekledikten/güncelledikten sonra çağrılacak fonksiyon
function notifyAuthorChange(authorData, action = 'update') {
  try {
    console.log(`Admin: Yazar ${action === 'insert' ? 'eklendi' : 'güncellendi'}:`, authorData);
    
    // Mesaj içeriğini hazırla
    const message = {
      type: 'author',
      action: action,
      data: authorData,
      timestamp: new Date().toISOString()
    };
    
    // Önce BroadcastChannel API'nin desteklenip desteklenmediğini kontrol et
    if ('BroadcastChannel' in window) {
      try {
        // Modern tarayıcılar için BroadcastChannel kullan
        const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
        broadcastChannel.postMessage(message);
        
        // Bir süre sonra kanalı kapat
        setTimeout(() => broadcastChannel.close(), 1000);
        console.log('BroadcastChannel ile yazar bildirimi gönderildi');
      } catch (broadcastError) {
        console.error('BroadcastChannel hatası:', broadcastError);
        // Hata durumunda localStorage'a geç
        sendViaLocalStorage(message);
      }
    } else {
      // Eski tarayıcılar için localStorage yöntemini kullan
      console.warn('BroadcastChannel API desteklenmiyor. LocalStorage yöntemi kullanılıyor.');
      sendViaLocalStorage(message);
    }
    
  } catch (error) {
    console.error('Admin: Yazar değişikliği bildirimi gönderilirken hata:', error);
  }
}

// Hakkımızda sayfası değişikliklerini bildirme fonksiyonu
function notifyAboutPageChange(aboutData, action = 'update') {
  try {
    console.log(`Admin: Hakkımızda sayfası ${action === 'insert' ? 'eklendi' : 'güncellendi'}:`, aboutData);
    
    // Mesaj içeriğini hazırla
    const message = {
      type: 'about_page',
      action: action,
      data: aboutData,
      timestamp: new Date().toISOString()
    };
    
    // Önce BroadcastChannel API'nin desteklenip desteklenmediğini kontrol et
    if ('BroadcastChannel' in window) {
      try {
        // Modern tarayıcılar için BroadcastChannel kullan
        const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
        broadcastChannel.postMessage(message);
        
        // Bir süre sonra kanalı kapat
        setTimeout(() => broadcastChannel.close(), 1000);
        console.log('BroadcastChannel ile hakkımızda sayfası bildirimi gönderildi');
      } catch (broadcastError) {
        console.error('BroadcastChannel hatası:', broadcastError);
        // Hata durumunda localStorage'a geç
        sendViaLocalStorage(message);
      }
    } else {
      // Eski tarayıcılar için localStorage yöntemini kullan
      console.warn('BroadcastChannel API desteklenmiyor. LocalStorage yöntemi kullanılıyor.');
      sendViaLocalStorage(message);
    }
    
  } catch (error) {
    console.error('Admin: Hakkımızda sayfası değişikliği bildirimi gönderilirken hata:', error);
  }
}

// İletişim sayfası değişikliklerini bildirme fonksiyonu
function notifyContactChange(contactData, action = 'update') {
  try {
    console.log(`Admin: İletişim sayfası ${action === 'insert' ? 'eklendi' : 'güncellendi'}:`, contactData);
    
    // Mesaj içeriğini hazırla
    const message = {
      type: 'contact_page',
      action: action,
      data: contactData,
      timestamp: new Date().toISOString()
    };
    
    // Önce BroadcastChannel API'nin desteklenip desteklenmediğini kontrol et
    if ('BroadcastChannel' in window) {
      try {
        // Modern tarayıcılar için BroadcastChannel kullan
        const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
        broadcastChannel.postMessage(message);
        
        // Bir süre sonra kanalı kapat
        setTimeout(() => broadcastChannel.close(), 1000);
        console.log('BroadcastChannel ile iletişim sayfası bildirimi gönderildi');
      } catch (broadcastError) {
        console.error('BroadcastChannel hatası:', broadcastError);
        // Hata durumunda localStorage'a geç
        sendViaLocalStorage(message);
      }
    } else {
      // Eski tarayıcılar için localStorage yöntemini kullan
      console.warn('BroadcastChannel API desteklenmiyor. LocalStorage yöntemi kullanılıyor.');
      sendViaLocalStorage(message);
    }
    
  } catch (error) {
    console.error('Admin: İletişim sayfası değişikliği bildirimi gönderilirken hata:', error);
  }
}

// Sayfa yüklendiğinde gerçek zamanlı güncellemeleri başlat
document.addEventListener('DOMContentLoaded', () => {
  setupAdminRealtimeChannels();
  console.log('Admin: Gerçek zamanlı güncellemeler başlatıldı');
});
