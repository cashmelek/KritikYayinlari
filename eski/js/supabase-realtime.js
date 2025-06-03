// Supabase Gerçek Zamanlı Güncellemeler
// Bu dosya, Supabase gerçek zamanlı güncellemeler için gerekli fonksiyonları içerir

// Ana sayfa için gerçek zamanlı güncellemeler
function setupHomePageRealtime() {
  console.log('Ana sayfa gerçek zamanlı güncellemeler başlatılıyor...');
  
  // Kitap değişikliklerini dinlemek için kanal oluştur
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return;
  }
  
  // Kitaplar için gerçek zamanlı kanal
  const booksChannel = window.supabaseClient.channel('public:books')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'books' },
      async (payload) => {
        console.log('Kitap değişikliği algılandı:', payload);
        
        // Ana sayfada yeni kitapları güncelle
        if (document.getElementById('newBooksContainer')) {
          const newBooks = await fetchNewBooks(8);
          displayBooks(newBooks, 'newBooksContainer');
        }
        
        // Ana sayfada çok satan kitapları güncelle
        if (document.getElementById('bestsellerBooksContainer')) {
          const bestsellers = await fetchBestsellers(8);
          displayBooks(bestsellers, 'bestsellerBooksContainer');
        }
      }
    )
    .subscribe((status) => {
      console.log('Ana sayfa kitaplar kanalı durumu:', status);
    });
  
  // Broadcast kanalını da dinle
  setupBroadcastListener();
  
  return booksChannel;
}

// Kitaplar sayfası için gerçek zamanlı güncellemeler
function setupBooksPageRealtime() {
  console.log('Kitaplar sayfası gerçek zamanlı güncellemeler başlatılıyor...');
  
  // Kitap değişikliklerini dinlemek için kanal oluştur
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return;
  }
  
  // Kitaplar için gerçek zamanlı kanal
  const booksChannel = window.supabaseClient.channel('public:books-page')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'books' },
      async (payload) => {
        console.log('Kitap değişikliği algılandı (kitaplar sayfası):', payload);
        
        // Kitaplar sayfasında tüm kitapları güncelle
        if (typeof window.loadBooks === 'function') {
          await window.loadBooks();
        }
      }
    )
    .subscribe((status) => {
      console.log('Kitaplar sayfası kanalı durumu:', status);
    });
  
  // Broadcast kanalını da dinle
  setupBroadcastListener();
  
  return booksChannel;
}

// Kitaplar için gerçek zamanlı güncelleme kanalı
function setupBooksRealtimeChannel() {
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return null;
  }
  
  const channel = window.supabaseClient.channel('public:books')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'books' },
      (payload) => {
        console.log('Kitap değişikliği algılandı:', payload);
        
        // Kitap değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('book-changed', { detail: payload });
        window.dispatchEvent(event);
      }
    )
    .subscribe((status) => {
      console.log('Kitaplar kanalı durumu:', status);
    });
    
  return channel;
}

// Yazarlar için gerçek zamanlı güncelleme kanalı
function setupAuthorsRealtimeChannel() {
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return null;
  }
  
  const channel = window.supabaseClient.channel('public:authors')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'authors' },
      (payload) => {
        console.log('Yazar değişikliği algılandı:', payload);
        
        // Yazar değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('author-changed', { detail: payload });
        window.dispatchEvent(event);
      }
    )
    .subscribe((status) => {
      console.log('Yazarlar kanalı durumu:', status);
    });
    
  return channel;
}

// Bannerlar için gerçek zamanlı güncelleme kanalı
function setupBannersRealtimeChannel() {
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return null;
  }
  
  const channel = window.supabaseClient.channel('public:banners')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'banners' },
      (payload) => {
        console.log('Banner değişikliği algılandı:', payload);
        
        // Banner değişikliği olduğunda özel olay tetikle
        const event = new CustomEvent('banner-changed', { detail: payload });
        window.dispatchEvent(event);
      }
    )
    .subscribe((status) => {
      console.log('Bannerlar kanalı durumu:', status);
    });
    
  return channel;
}

// Tüm gerçek zamanlı kanalları başlat
function setupAllRealtimeChannels() {
  const channels = {
    books: setupBooksRealtimeChannel(),
    authors: setupAuthorsRealtimeChannel(),
    banners: setupBannersRealtimeChannel()
  };
  
  // Sayfa kapandığında abonelikleri iptal et
  window.addEventListener('beforeunload', () => {
    Object.values(channels).forEach(channel => {
      if (channel) channel.unsubscribe();
    });
  });
  
  return channels;
}

// Gerçek zamanlı güncelleme olaylarını dinle ve sayfa içeriğini güncelle
function setupRealtimePageUpdates() {
  // Kitap değişikliklerini dinle
  window.addEventListener('book-changed', async (event) => {
    const payload = event.detail;
    
    // Anasayfada kitaplar varsa güncelle
    if (document.getElementById('newBooksContainer')) {
      const newBooks = await fetchNewBooks();
      displayBooks(newBooks, 'newBooksContainer');
    }
    
    if (document.getElementById('bestsellerBooksContainer')) {
      const bestsellers = await fetchBestsellers();
      displayBooks(bestsellers, 'bestsellerBooksContainer');
    }
    
    // Kitaplar sayfasında ise tüm kitapları güncelle
    if (document.getElementById('booksContainer')) {
      const books = await fetchBooks();
      displayBooks(books, 'booksContainer');
    }
    
    // Kitap detay sayfasında ise ve değişen kitap bu ise güncelle
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = parseInt(urlParams.get('id'));
    
    if (bookId && payload.new && payload.new.id === bookId) {
      const bookDetail = await fetchBookDetails(bookId);
      updateBookDetailPage(bookDetail);
    }
  });
  
  // Yazar değişikliklerini dinle
  window.addEventListener('author-changed', async (event) => {
    // Yazarlar sayfasında ise güncelle
    if (document.getElementById('authorsContainer')) {
      const authors = await fetchAuthors();
      displayAuthors(authors, 'authorsContainer');
    }
    
    // Yazar detay sayfasında ise ve değişen yazar bu ise güncelle
    const urlParams = new URLSearchParams(window.location.search);
    const authorId = parseInt(urlParams.get('id'));
    
    if (authorId && event.detail.new && event.detail.new.id === authorId) {
      const authorDetail = await fetchAuthorDetails(authorId);
      updateAuthorDetailPage(authorDetail);
    }
  });
  
  // Banner değişikliklerini dinle
  window.addEventListener('banner-changed', async () => {
    // Anasayfada bannerlar varsa güncelle
    if (document.getElementById('heroSlider')) {
      const banners = await fetchBanners();
      updateBanners(banners);
    }
  });
}

// Admin panelinden gelen broadcast mesajlarını dinle
function setupBroadcastListener() {
  // Önce BroadcastChannel API'nin desteklenip desteklenmediğini kontrol et
  const isBroadcastSupported = 'BroadcastChannel' in window;
  
  if (isBroadcastSupported) {
    try {
      // Modern tarayıcılar için BroadcastChannel kullan
      const broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
      
      broadcastChannel.onmessage = async (event) => {
        console.log('Broadcast mesajı alındı:', event.data);
        handleUpdateMessage(event.data);
      };
      
      // Sayfa kapandığında kanalı kapat
      window.addEventListener('beforeunload', () => {
        broadcastChannel.close();
      });
      
      console.log('BroadcastChannel API kullanılarak broadcast listener kuruldu');
    } catch (error) {
      console.error('BroadcastChannel kurulurken hata:', error);
      setupLocalStorageFallback(); // Hata durumunda localStorage'a geç
    }
  } else {
    // Eski tarayıcılar için localStorage yöntemini kullan
    console.warn('BroadcastChannel API desteklenmiyor. LocalStorage yöntemi kullanılıyor.');
    setupLocalStorageFallback();
  }
}

// BroadcastChannel desteklenmediğinde localStorage ile iletişim sağlayan alternatif yöntem
function setupLocalStorageFallback() {
  // Benzersiz bir istemci ID'si oluştur
  const clientId = 'client_' + Math.random().toString(36).substring(2, 9);
  
  // LocalStorage'daki değişiklikleri dinle
  window.addEventListener('storage', async (event) => {
    if (event.key === 'kritik-yayinlari-updates') {
      try {
        const data = JSON.parse(event.newValue);
        
        // Mesajı gönderen bu istemci değilse işle
        if (data && data.clientId !== clientId) {
          console.log('LocalStorage üzerinden mesaj alındı:', data.message);
          handleUpdateMessage(data.message);
        }
      } catch (error) {
        console.error('LocalStorage mesajı işlenirken hata:', error);
      }
    }
  });
  
  // Mesaj gönderme fonksiyonunu global olarak tanımla
  window.sendBroadcastMessage = (message) => {
    try {
      localStorage.setItem('kritik-yayinlari-updates', JSON.stringify({
        clientId: clientId,
        timestamp: new Date().getTime(),
        message: message
      }));
      // LocalStorage event'i aynı pencerede tetiklenmediği için
      // bu istemcide de mesajı işle
      handleUpdateMessage(message);
    } catch (error) {
      console.error('LocalStorage mesajı gönderilirken hata:', error);
    }
  };
  
  console.log('LocalStorage broadcast listener kuruldu');
}

// Güncelleme mesajlarını işleyen ortak fonksiyon
async function handleUpdateMessage(data) {
  try {
    const { type, action, data: entityData } = data;
    
    if (type === 'book') {
      // Kitap değişikliği
      console.log(`Kitap ${action === 'insert' ? 'eklendi' : 'güncellendi'}:`, entityData);
      
      // Anasayfada kitaplar varsa güncelle
      if (document.getElementById('newBooksContainer')) {
        const newBooks = await fetchNewBooks(8);
        displayBooks(newBooks, 'newBooksContainer');
      }
      
      if (document.getElementById('bestsellerBooksContainer')) {
        const bestsellers = await fetchBestsellers(8);
        displayBooks(bestsellers, 'bestsellerBooksContainer');
      }
      
      // Kitaplar sayfasında ise tüm kitapları güncelle
      if (document.getElementById('booksContainer')) {
        const books = await fetchBooks();
        displayBooks(books, 'booksContainer');
      }
    } else if (type === 'author') {
      // Yazar değişikliği
      console.log(`Yazar ${action === 'insert' ? 'eklendi' : 'güncellendi'}:`, entityData);
      
      // Yazarlar sayfasında ise güncelle
      if (document.getElementById('authorsContainer')) {
        const authors = await fetchAuthors();
        displayAuthors(authors, 'authorsContainer');
      }
    }
  } catch (error) {
    console.error('Güncelleme mesajı işlenirken hata:', error);
  }
}

// Global erişim için fonksiyonları window nesnesine ekle
window.setupHomePageRealtime = setupHomePageRealtime;
window.setupBooksPageRealtime = setupBooksPageRealtime;
window.setupBooksRealtimeChannel = setupBooksRealtimeChannel;
window.setupAuthorsRealtimeChannel = setupAuthorsRealtimeChannel;
window.setupBannersRealtimeChannel = setupBannersRealtimeChannel;
window.setupAllRealtimeChannels = setupAllRealtimeChannels;
window.setupRealtimePageUpdates = setupRealtimePageUpdates;
window.setupBroadcastListener = setupBroadcastListener;

// Sayfa yüklendiğinde gerçek zamanlı güncellemeleri başlat
document.addEventListener('DOMContentLoaded', () => {
  setupAllRealtimeChannels();
  setupRealtimePageUpdates();
  setupBroadcastListener();
  console.log('Gerçek zamanlı güncellemeler başlatıldı');
});
