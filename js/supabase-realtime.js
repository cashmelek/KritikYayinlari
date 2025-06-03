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
  
  // Yazarlar kanalı
  const authorsChannel = window.supabaseClient.channel('public:authors')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'authors' },
      async () => {
        console.log('Yazar değişikliği algılandı');
        
        // Ana sayfada yazarları güncelle
        if (document.getElementById('authorsContainer')) {
          await loadAuthors();
        }
      }
    )
    .subscribe();
  
  // Bannerlar kanalı
  const bannersChannel = window.supabaseClient.channel('public:banners')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'banners' },
      async () => {
        console.log('Banner değişikliği algılandı');
        
        // Ana sayfada bannerları güncelle
        if (document.getElementById('banner-container')) {
          await loadPageBanners();
        }
      }
    )
    .subscribe();
  
  // Sayfa kapandığında abonelikleri iptal et
  window.addEventListener('beforeunload', () => {
    booksChannel.unsubscribe();
    authorsChannel.unsubscribe();
    bannersChannel.unsubscribe();
  });
  
  return { booksChannel, authorsChannel, bannersChannel };
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
      async () => {
        console.log('Kitap değişikliği algılandı (kitaplar sayfası)');
        
        // Kitaplar sayfasında tüm kitapları güncelle
        if (typeof window.loadBooks === 'function') {
          await window.loadBooks();
        }
      }
    )
    .subscribe();
  
  // Sayfa kapandığında abonelikleri iptal et
  window.addEventListener('beforeunload', () => {
    booksChannel.unsubscribe();
  });
  
  return booksChannel;
}

// Yazarlar sayfası için gerçek zamanlı güncellemeler
function setupAuthorsPageRealtime() {
  console.log('Yazarlar sayfası gerçek zamanlı güncellemeler başlatılıyor...');
  
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return;
  }
  
  // Yazarlar için gerçek zamanlı kanal
  const authorsChannel = window.supabaseClient.channel('public:authors-page')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'authors' },
      async () => {
        console.log('Yazar değişikliği algılandı (yazarlar sayfası)');
        
        // Yazarlar sayfasını güncelle
        if (typeof window.loadAuthorsPage === 'function') {
          await window.loadAuthorsPage();
        }
      }
    )
    .subscribe();
  
  // Sayfa kapandığında abonelikleri iptal et
  window.addEventListener('beforeunload', () => {
    authorsChannel.unsubscribe();
    });
    
  return authorsChannel;
}

// Kitap detay sayfası için gerçek zamanlı güncellemeler
function setupBookDetailRealtime(bookId) {
  if (!window.supabaseClient || !bookId) {
    console.error('Supabase bağlantısı veya kitap ID bulunamadı');
    return;
  }
  
  console.log(`Kitap detay sayfası gerçek zamanlı güncellemeler başlatılıyor... (Kitap ID: ${bookId})`);
  
  const bookChannel = window.supabaseClient.channel(`public:books:id=${bookId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'books', filter: `id=eq.${bookId}` },
      async () => {
        console.log('Kitap detayı değişikliği algılandı');
        
        // Kitap bilgilerini yeniden yükle
        try {
          const { data: book, error } = await window.supabaseClient
            .from('books')
            .select('*, authors(*)')
            .eq('id', bookId)
            .single();
          
          if (error) throw error;
          
          // Kitap bilgilerini güncelle
          if (book) {
            updateBookPage(book);
            loadRelatedBooks(book);
          }
        } catch (error) {
          console.error('Kitap bilgileri güncellenirken hata:', error);
        }
      }
    )
    .subscribe();
  
  // Sayfa kapandığında abonelikleri iptal et
  window.addEventListener('beforeunload', () => {
    bookChannel.unsubscribe();
  });
  
  return bookChannel;
}

// Yazar detay sayfası için gerçek zamanlı güncellemeler
function setupAuthorDetailRealtime(authorId) {
  if (!window.supabaseClient || !authorId) {
    console.error('Supabase bağlantısı veya yazar ID bulunamadı');
    return;
  }
  
  console.log(`Yazar detay sayfası gerçek zamanlı güncellemeler başlatılıyor... (Yazar ID: ${authorId})`);
  
  const authorChannel = window.supabaseClient.channel(`public:authors:id=${authorId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'authors', filter: `id=eq.${authorId}` },
      async () => {
        console.log('Yazar detayı değişikliği algılandı');
  
        // Yazar bilgilerini yeniden yükle
        if (typeof window.loadSpecificAuthor === 'function') {
          await window.loadSpecificAuthor(authorId);
    }
      }
    )
    .subscribe();
      
  // Sayfa kapandığında abonelikleri iptal et
  window.addEventListener('beforeunload', () => {
    authorChannel.unsubscribe();
  });
  
  return authorChannel;
}

// Global erişim için fonksiyonları window nesnesine ekle
window.setupHomePageRealtime = setupHomePageRealtime;
window.setupBooksPageRealtime = setupBooksPageRealtime;
window.setupAuthorsPageRealtime = setupAuthorsPageRealtime;
window.setupBookDetailRealtime = setupBookDetailRealtime;
window.setupAuthorDetailRealtime = setupAuthorDetailRealtime;

// Sayfa yüklendiğinde gerçek zamanlı güncellemeleri başlat
document.addEventListener('DOMContentLoaded', () => {
  setupHomePageRealtime();
  setupBooksPageRealtime();
  setupAuthorsPageRealtime();
  console.log('Gerçek zamanlı güncellemeler başlatıldı');
});
