// Supabase entegrasyonu
const SUPABASE_URL = 'https://kyqtdtyubmipiwjrudgc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cXRkdHl1Ym1pcGl3anJ1ZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODAwODEsImV4cCI6MjA2MzY1NjA4MX0.PiF7N1hPFGFfO_5fg_C640Z3YzsABaqtKfSoMTJ5Kow';

// Supabase istemcisini başlat
const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Kitapları getir
async function fetchBooks() {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('id');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kitaplar yüklenirken hata:', error);
    // Hata durumunda boş dizi dön
    return [];
  }
}

// Yazarları getir
async function fetchAuthors() {
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('id');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Yazarlar yüklenirken hata:', error);
    // Hata durumunda boş dizi dön
    return [];
  }
}

// Bannerları getir
async function fetchBanners() {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('order_number');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Bannerlar yüklenirken hata:', error);
    // Hata durumunda boş dizi dön
    return [];
  }
}

// Kitap detaylarını getir
async function fetchBookDetails(bookId) {
  try {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('author_id', authorId)
      .order('year', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Yazarın kitapları yüklenirken hata (ID: ${authorId}):`, error);
    return [];
  }
}

// Kategoriye göre kitapları getir
async function fetchBooksByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('category', category)
      .order('id');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Kategoriye göre kitaplar yüklenirken hata (Kategori: ${category}):`, error);
    return [];
  }
}

// Yeni kitapları getir
async function fetchNewBooks(limit = 8) {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_new', true)
      .order('id', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Yeni kitaplar yüklenirken hata:', error);
    return [];
  }
}

// Çok satan kitapları getir
async function fetchBestsellers(limit = 8) {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_bestseller', true)
      .order('id', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Çok satan kitaplar yüklenirken hata:', error);
    return [];
  }
}

// Gerçek zamanlı güncellemeler için abonelik
function subscribeToBooks(callback) {
  return supabase
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

// Gerçek zamanlı yazar güncellemeleri için abonelik
function subscribeToAuthors(callback) {
  return supabase
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
  return supabase
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
