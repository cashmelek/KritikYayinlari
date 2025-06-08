// Supabase Init - Kritik Yayınları Web Sitesi
// Bu script, Supabase bağlantısını başlatmak ve global createClient fonksiyonunu tanımlamak için kullanılır

// Supabase CDN'den yüklendiğinde globalde supabase nesnesi oluşur
// Bu nesneyi kontrol edelim ve createClient fonksiyonunu global window nesnesine ekleyelim
if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    console.log('Supabase SDK başarıyla yüklendi, global createClient fonksiyonu tanımlanıyor...');
    
    // Global createClient fonksiyonunu tanımla
    window.createClient = supabase.createClient;
    
    console.log('window.createClient fonksiyonu tanımlandı.');
} else {
    console.error('Supabase SDK yüklenemedi! window.createClient fonksiyonu tanımlanamadı.');
    
    // Hata durumunda bildirim göster (eğer bildirim fonksiyonu yüklendiyse)
    if (typeof showMessage === 'function') {
        showMessage('Veritabanı bağlantısı kurulamadı! Bazı içerikler görüntülenemeyebilir.', 'error');
    }
}

// Sayfa yüklendiğinde Supabase bağlantısını başlat
document.addEventListener('DOMContentLoaded', function() {
    // Supabase bağlantısı kurulduysa ve initSupabase fonksiyonu varsa çalıştır
    if (typeof initSupabase === 'function') {
        console.log('DOMContentLoaded: initSupabase fonksiyonu çağrılıyor...');
        initSupabase();
    } else {
        console.error('initSupabase fonksiyonu bulunamadı! Supabase bağlantısı başlatılamadı.');
    }
}); 