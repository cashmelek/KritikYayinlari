// Admin Paneli Supabase API Fonksiyonları
// Bu dosya, admin paneli için Supabase veritabanı işlemlerini içerir

// ============ BROADCAST SİSTEMİ ============

// Broadcast kanalı oluştur
let broadcastChannel;
try {
  broadcastChannel = new BroadcastChannel('kritik-yayinlari-updates');
} catch (error) {
  console.warn('BroadcastChannel desteklenmiyor:', error);
  broadcastChannel = null;
}

// Ana sayfaya değişiklikleri bildir
function notifyBookChange(bookData, action = 'insert') {
  console.log(`Kitap ${action} işlemi bildiriliyor:`, bookData);
  
  // BroadcastChannel ile bildir
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'book',
      action: action,
      data: bookData,
      timestamp: new Date().toISOString()
    });
    console.log('Broadcast mesajı gönderildi');
  }
  
  // CustomEvent ile de bildir (aynı sayfa içinde)
  const event = new CustomEvent('book-changed', { 
    detail: { 
      new: bookData, 
      eventType: action 
    } 
  });
  window.dispatchEvent(event);
  console.log('CustomEvent tetiklendi');
}

// Yazar değişikliklerini bildir
function notifyAuthorChange(authorData, action = 'insert') {
  console.log(`Yazar ${action} işlemi bildiriliyor:`, authorData);
  
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'author',
      action: action,
      data: authorData,
      timestamp: new Date().toISOString()
    });
  }
  
  const event = new CustomEvent('author-changed', { 
    detail: { 
      new: authorData, 
      eventType: action 
    } 
  });
  window.dispatchEvent(event);
}

// ============ KİTAP İŞLEMLERİ ============

// Tüm kitapları getir
async function getAllBooks() {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .select(`
        *,
        authors:author_id (id, name)
      `)
      .order('id');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kitaplar yüklenirken hata:', error);
    showNotification('Kitaplar yüklenirken bir hata oluştu', 'error');
    return [];
  }
}

// Kitap ekle
async function addBook(bookData) {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .insert([bookData])
      .select();
      
    if (error) throw error;
    
    const addedBook = data[0];
    
    // Değişikliği bildir
    notifyBookChange(addedBook, 'insert');
    
    showNotification('Kitap başarıyla eklendi');
    return addedBook;
  } catch (error) {
    console.error('Kitap eklenirken hata:', error);
    showNotification('Kitap eklenirken bir hata oluştu', 'error');
    return null;
  }
}

// Kitap güncelle
async function updateBook(bookId, bookData) {
  try {
    const { data, error } = await supabaseClient
      .from('books')
      .update(bookData)
      .eq('id', bookId)
      .select();
      
    if (error) throw error;
    
    const updatedBook = data[0];
    
    // Değişikliği bildir
    notifyBookChange(updatedBook, 'update');
    
    showNotification('Kitap başarıyla güncellendi');
    return updatedBook;
  } catch (error) {
    console.error('Kitap güncellenirken hata:', error);
    showNotification('Kitap güncellenirken bir hata oluştu', 'error');
    return null;
  }
}

// Kitap sil
async function deleteBook(bookId) {
  try {
    const { error } = await supabaseClient
      .from('books')
      .delete()
      .eq('id', bookId);
      
    if (error) throw error;
    
    // Değişikliği bildir
    notifyBookChange({ id: bookId }, 'delete');
    
    showNotification('Kitap başarıyla silindi');
    return true;
  } catch (error) {
    console.error('Kitap silinirken hata:', error);
    showNotification('Kitap silinirken bir hata oluştu', 'error');
    return false;
  }
}

// ============ YAZAR İŞLEMLERİ ============

// Tüm yazarları getir
async function getAllAuthors() {
  try {
    const { data, error } = await supabaseClient
      .from('authors')
      .select('*')
      .order('id');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Yazarlar yüklenirken hata:', error);
    showNotification('Yazarlar yüklenirken bir hata oluştu', 'error');
    return [];
  }
}

// Yazar ekle
async function addAuthor(authorData) {
  try {
    const { data, error } = await supabaseClient
      .from('authors')
      .insert([authorData])
      .select();
      
    if (error) throw error;
    
    const addedAuthor = data[0];
    
    // Değişikliği bildir
    notifyAuthorChange(addedAuthor, 'insert');
    
    showNotification('Yazar başarıyla eklendi');
    return addedAuthor;
  } catch (error) {
    console.error('Yazar eklenirken hata:', error);
    showNotification('Yazar eklenirken bir hata oluştu', 'error');
    return null;
  }
}

// Global olarak erişilebilir hale getir
window.addAuthor = addAuthor;

// Yazar güncelle
async function updateAuthor(authorId, authorData) {
  try {
    const { data, error } = await supabaseClient
      .from('authors')
      .update(authorData)
      .eq('id', authorId)
      .select();
      
    if (error) throw error;
    
    const updatedAuthor = data[0];
    
    // Değişikliği bildir
    notifyAuthorChange(updatedAuthor, 'update');
    
    showNotification('Yazar başarıyla güncellendi');
    return updatedAuthor;
  } catch (error) {
    console.error('Yazar güncellenirken hata:', error);
    showNotification('Yazar güncellenirken bir hata oluştu', 'error');
    return null;
  }
}

// Global olarak erişilebilir hale getir
window.updateAuthor = updateAuthor;

// Yazar sil
async function deleteAuthor(authorId) {
  try {
    // Önce yazarın kitaplarını kontrol et
    const { data: books } = await supabaseClient
      .from('books')
      .select('id')
      .eq('author_id', authorId);
      
    if (books && books.length > 0) {
      showNotification('Bu yazara ait kitaplar bulunduğu için silinemez', 'error');
      return false;
    }
    
    const { error } = await supabaseClient
      .from('authors')
      .delete()
      .eq('id', authorId);
      
    if (error) throw error;
    
    // Değişikliği bildir
    notifyAuthorChange({ id: authorId }, 'delete');
    
    showNotification('Yazar başarıyla silindi');
    return true;
  } catch (error) {
    console.error('Yazar silinirken hata:', error);
    showNotification('Yazar silinirken bir hata oluştu', 'error');
    return false;
  }
}

// ============ BANNER İŞLEMLERİ ============

// Banner tablosunu oluştur (eğer yoksa)
async function createBannersTable() {
    try {
        console.log('Banners tablosu kontrol ediliyor...');
        
        // Önce tablonun var olup olmadığını kontrol edelim
        const { error } = await supabaseClient
            .from('banners')
            .select('count')
            .limit(1);
        
        if (error) {
            // Tablo yoksa veya yapısı farklıysa, yeni oluşturmamız gerekiyor
            console.log('Banner tablosu mevcut değil, yeni oluşturulacak');
            
            // NOT: Supabase'de JavaScript kullanarak tablo oluşturamayız
            // Bu işlemi Supabase Studio veya SQL Editor üzerinden yapmalısınız
            // Aşağıdaki SQL komutunu Supabase Studio'da çalıştırın:
            
            /*
            CREATE TABLE IF NOT EXISTS banners (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                location VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                image_url TEXT,
                link TEXT,
                click_count INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                start_date TIMESTAMP WITH TIME ZONE,
                end_date TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            */
            
            return false;
        }
        
        console.log('Banner tablosu başarıyla kontrol edildi ve mevcut');
        return true;
    } catch (error) {
        console.error('Banner tablosu kontrol hatası:', error);
        return false;
    }
}

// Tüm bannerları getir
async function fetchAllBanners() {
    try {
        const { data, error } = await supabaseClient
            .from('banners')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return { data, error: null };
    } catch (error) {
        console.error('Bannerlar alınırken hata:', error);
        return { data: null, error };
    }
}

// Belirli konumdaki bannerları getir
async function fetchBannersByLocation(location) {
    try {
        const { data, error } = await supabaseClient
            .from('banners')
            .select('*')
            .eq('location', location)
            .eq('is_active', true)
            .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
            .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return { data, error: null };
    } catch (error) {
        console.error(`${location} konumundaki bannerlar alınırken hata:`, error);
        return { data: null, error };
    }
}

// Tüm sayfalara uygulanacak bannerları getir
async function fetchGlobalBanners() {
    try {
        const { data, error } = await supabaseClient
            .from('banners')
            .select('*')
            .eq('location', 'all')
            .eq('is_active', true)
            .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
            .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return { data, error: null };
    } catch (error) {
        console.error('Global bannerlar alınırken hata:', error);
        return { data: null, error };
    }
}

// Banner ekle
async function addBanner(bannerData) {
    try {
        const { data, error } = await supabaseClient
            .from('banners')
            .insert([bannerData])
            .select();
            
        if (error) throw error;
        
        return { data: data[0], error: null };
    } catch (error) {
        console.error('Banner eklenirken hata:', error);
        return { data: null, error };
    }
}

// Banner güncelle
async function updateBanner(bannerId, bannerData) {
    try {
        const { data, error } = await supabaseClient
            .from('banners')
            .update(bannerData)
            .eq('id', bannerId)
            .select();
            
        if (error) throw error;
        
        return { data: data[0], error: null };
    } catch (error) {
        console.error('Banner güncellenirken hata:', error);
        return { data: null, error };
    }
}

// Banner sil
async function deleteBanner(bannerId) {
    try {
        const { data, error } = await supabaseClient
            .from('banners')
            .delete()
            .eq('id', bannerId);
            
        if (error) throw error;
        
        return { success: true, error: null };
    } catch (error) {
        console.error('Banner silinirken hata:', error);
        return { success: false, error };
    }
}

// Banner görüntüleme sayısını artır
async function incrementBannerViews(bannerId) {
    try {
        const { data, error } = await supabaseClient
            .from('banners')
            .select('view_count')
            .eq('id', bannerId)
            .single();
            
        if (error) throw error;
        
        const { error: updateError } = await supabaseClient
            .from('banners')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', bannerId);
            
        if (updateError) throw updateError;
        
        return { success: true, error: null };
    } catch (error) {
        console.error('Banner görüntüleme sayısı güncellenirken hata:', error);
        return { success: false, error };
    }
}

// Banner tıklama sayısını artır
async function incrementBannerClicks(bannerId) {
    try {
        const { data, error } = await supabaseClient
            .from('banners')
            .select('click_count')
            .eq('id', bannerId)
            .single();
            
        if (error) throw error;
        
        const { error: updateError } = await supabaseClient
            .from('banners')
            .update({ click_count: (data.click_count || 0) + 1 })
            .eq('id', bannerId);
            
        if (updateError) throw updateError;
        
        return { success: true, error: null };
    } catch (error) {
        console.error('Banner tıklama sayısı güncellenirken hata:', error);
        return { success: false, error };
    }
}

// Veritabanı tablosunu başlat
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Banner tablosunu oluştur
        await createBannersTable();
    } catch (error) {
        console.error('Veritabanı tabloları oluşturulurken hata:', error);
    }
});

// Global olarak erişilebilir yap
window.bannerAPI = {
    fetchAllBanners,
    fetchBannersByLocation,
    fetchGlobalBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    incrementBannerViews,
    incrementBannerClicks
};

// ============ DOSYA YÜKLEME İŞLEMLERİ ============

// Dosya yükle
async function uploadFile(file, folder) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const { error } = await supabaseClient.storage
      .from('public')
      .upload(filePath, file);
      
    if (error) throw error;
    
    const { data } = supabaseClient.storage
      .from('public')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Dosya yüklenirken hata:', error);
    showNotification('Dosya yüklenirken bir hata oluştu', 'error');
    return null;
  }
}

// Kitap kapağı yükle
async function uploadBookCover(file) {
  return uploadFile(file, 'book_covers');
}

// Yazar fotoğrafı yükle
async function uploadAuthorPhoto(file) {
  return uploadFile(file, 'author_photos');
}

// Banner görseli yükle
async function uploadBannerImage(file) {
  return uploadFile(file, 'banners');
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`;
  notification.innerHTML = `
    <i class="ri-${type === 'success' ? 'check' : 'close'}-line mr-2"></i>
    ${message}
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Global erişim için fonksiyonları dışa aktar
window.notifyBookChange = notifyBookChange;
window.notifyAuthorChange = notifyAuthorChange;