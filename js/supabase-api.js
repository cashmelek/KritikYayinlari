// Supabase API Fonksiyonları
// Bu dosya, web sitesi için Supabase veritabanı işlemlerini içerir

// Kitapları getir
async function fetchBooks() {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .select('*, authors(*)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Kitaplar yüklenirken hata:', error);
    return []; // Hata durumunda boş dizi dön
  }
}

// Yazarları getir
async function fetchAuthors() {
  try {
    const { data, error } = await supabaseClient
      .from('authors')
      .select('*, books(id)')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Yazarlar yüklenirken hata:', error);
    return []; // Hata durumunda boş dizi dön
  }
}

// Bannerları getir
async function fetchBanners() {
  try {
    const { data, error } = await supabaseClient
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('order_number', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Bannerlar yüklenirken hata:', error);
    return []; // Hata durumunda boş dizi dön
  }
}

// Yeni kitapları getir
async function fetchNewBooks(limit = 8) {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .select('*, authors(*)')
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Yeni kitaplar sorgu hatası:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Yeni kitaplar yüklenirken hata:', error);
    return [];
  }
}

// Çok satan kitapları getir
async function fetchBestsellers(limit = 8) {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .select('*, authors(*)')
      .eq('is_bestseller', true)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Çok satan kitaplar sorgu hatası:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Çok satan kitaplar yüklenirken hata:', error);
    return [];
  }
}

// Anasayfa için gerçek zamanlı güncellemeler
function setupHomePageRealtime() {
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return;
  }
  
  console.log('Anasayfa gerçek zamanlı güncellemeler başlatılıyor...');
  
  const subscription = window.supabaseClient
    .channel('public:books')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'books' },
      async (payload) => {
        console.log('Kitap değişikliği algılandı:', payload);
        
        // Yeni kitapları güncelle
        const newBooks = await fetchNewBooks(8);
        displayBooks(newBooks, 'newBooksContainer');
        
        // Çok satan kitapları güncelle
        const bestsellers = await fetchBestsellers(8);
        displayBooks(bestsellers, 'bestsellerBooksContainer');
      }
    )
    .subscribe((status) => {
      console.log('Gerçek zamanlı güncelleme durumu:', status);
    });
    
  // Sayfa kapandığında aboneliği iptal et
  window.addEventListener('beforeunload', () => {
    subscription.unsubscribe();
  });
  
  return subscription;
}

// Kitaplar sayfası için gerçek zamanlı güncellemeler
function setupBooksPageRealtime() {
  if (!window.supabaseClient) {
    console.error('Supabase bağlantısı bulunamadı');
    return;
  }
  
  console.log('Kitaplar sayfası gerçek zamanlı güncellemeler başlatılıyor...');
  
  const subscription = window.supabaseClient
    .channel('public:books')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'books' },
      async (payload) => {
        console.log('Kitap değişikliği algılandı:', payload);
        
        // Kitapları yeniden yükle
        if (typeof loadBooks === 'function') {
          await loadBooks();
        } else {
          console.error('loadBooks fonksiyonu bulunamadı');
        }
      }
    )
    .subscribe((status) => {
      console.log('Gerçek zamanlı güncelleme durumu:', status);
    });
    
  // Sayfa kapandığında aboneliği iptal et
  window.addEventListener('beforeunload', () => {
    subscription.unsubscribe();
  });
  
  return subscription;
}

// Kitap detay sayfası için gerçek zamanlı güncellemeler
function setupBookDetailRealtime(bookId) {
  if (!window.supabaseClient || !bookId) {
    console.error('Supabase bağlantısı veya kitap ID bulunamadı');
    return;
  }
  
  console.log(`Kitap detay sayfası gerçek zamanlı güncellemeler başlatılıyor... (Kitap ID: ${bookId})`);
  
  const subscription = window.supabaseClient
    .channel(`public:books:id=eq.${bookId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'books', filter: `id=eq.${bookId}` },
      async (payload) => {
        console.log('Kitap değişikliği algılandı:', payload);
        
        // Kitap bilgilerini yeniden yükle
        try {
          const { data: book, error } = await window.supabaseClient
            .from('books')
            .select('*, authors(*)')
            .eq('id', bookId)
            .single();
          
          if (error) throw error;
          
          // Kitap bilgilerini güncelle
          if (book && typeof displayBookDetails === 'function') {
            displayBookDetails(book);
          }
        } catch (error) {
          console.error('Kitap bilgileri güncellenirken hata:', error);
        }
      }
    )
    .subscribe((status) => {
      console.log('Gerçek zamanlı güncelleme durumu:', status);
    });
    
  // Sayfa kapandığında aboneliği iptal et
  window.addEventListener('beforeunload', () => {
    subscription.unsubscribe();
  });
  
  return subscription;
}

// Kitap detaylarını getir
async function fetchBookDetails(bookId) {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .select(`
        *,
        authors:author_id (
          id,
          name,
          photo_url
        )
      `)
      .eq('id', bookId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Kitap detayları yüklenirken hata (ID: ${bookId}):`, error);
    return null;
  }
}

// Yazarın kitaplarını getir
async function fetchAuthorBooks(authorId) {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .select('*, authors(*)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Yazarın kitapları yüklenirken hata (ID: ${authorId}):`, error);
    return [];
  }
}

// Kategoriye göre kitapları getir
async function fetchBooksByCategory(category) {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .select('*, authors(*)')
      .eq('category', category)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Kategoriye göre kitaplar yüklenirken hata (Kategori: ${category}):`, error);
    return [];
  }
}

// Gerçek zamanlı güncellemeler için abonelik
function subscribeToBooks(callback) {
  return supabaseClient
    .channel('books-channel')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'books' 
    }, payload => {
      console.log('Kitaplarda değişiklik oldu:', payload);
      callback(payload);
    })
    .subscribe();
}

// Ana sayfadaki kitaplar için gerçek zamanlı güncelleme
function setupHomePageRealtime() {
  // Yeni kitaplar için abonelik
  subscribeToBooks(async (payload) => {
    // Kitapları yeniden yükle
    if (document.getElementById('newBooksContainer')) {
      const newBooks = await fetchNewBooks();
      displayBooks(newBooks, 'newBooksContainer');
    }
    
    // Çok satan kitaplar için
    if (document.getElementById('bestsellerBooksContainer')) {
      const bestsellers = await fetchBestsellers();
      displayBooks(bestsellers, 'bestsellerBooksContainer');
    }
  });
}

// Kitaplar sayfası için gerçek zamanlı güncelleme
function setupBooksPageRealtime() {
  subscribeToBooks(async () => {
    if (document.getElementById('booksContainer')) {
      const books = await fetchBooks();
      displayBooks(books, 'booksContainer');
    }
  });
}

// Kitap detay sayfası için gerçek zamanlı güncelleme
function setupBookDetailPageRealtime(bookId) {
  subscribeToBooks(async (payload) => {
    // Eğer değişen kitap bu sayfada gösterilen kitapsa
    if (payload.new && payload.new.id === bookId) {
      const bookDetail = await fetchBookDetails(bookId);
      updateBookDetailPage(bookDetail);
    }
  });
}

// Kitap detay sayfasını güncelle
function updateBookDetailPage(book) {
  if (!book) return;
  
  // Sayfa başlığını güncelle
  document.title = `${book.title} - Kritik Yayınları`;
  
  // Kitap bilgilerini güncelle
  const elements = {
    title: document.getElementById('bookTitle'),
    author: document.getElementById('bookAuthor'),
    description: document.getElementById('bookDescription'),
    cover: document.getElementById('bookCover'),
    price: document.getElementById('bookPrice'),
    category: document.getElementById('bookCategory'),
    year: document.getElementById('bookYear'),
    publisher: document.getElementById('bookPublisher'),
    isbn: document.getElementById('bookIsbn')
  };
  
  // Elementleri güncelle
  if (elements.title) elements.title.textContent = book.title;
  if (elements.author) elements.author.textContent = book.authors ? book.authors.name : '';
  if (elements.description) elements.description.textContent = book.description;
  if (elements.cover) elements.cover.src = book.cover_url || 'images/placeholder.png';
  if (elements.price) elements.price.textContent = `${book.price} TL`;
  if (elements.category) elements.category.textContent = book.category;
  if (elements.year) elements.year.textContent = book.year;
  if (elements.publisher) elements.publisher.textContent = book.publisher;
  if (elements.isbn) elements.isbn.textContent = book.isbn;
}

// Gerçek zamanlı yazar güncellemeleri için abonelik
function subscribeToAuthors(callback) {
  return supabaseClient
    .channel('authors-channel')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'authors' 
    }, payload => {
      console.log('Yazarlarda değişiklik oldu:', payload);
      callback(payload);
    })
    .subscribe();
}

// Gerçek zamanlı banner güncellemeleri için abonelik
function subscribeToBanners(callback) {
  return supabaseClient
    .channel('banners-channel')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'banners' 
    }, payload => {
      console.log('Bannerlarda değişiklik oldu:', payload);
      callback(payload);
    })
    .subscribe();
}
