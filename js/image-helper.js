/**
 * KritikYayinlari - Görsel İşleme Yardımcı Sınıfı
 * Görsel yükleme, optimizasyon ve dönüştürme işlemleri için yardımcı fonksiyonlar
 */

// ImageHelper sınıfı
const ImageHelper = {
    /**
     * Görsel URL'ini kontrol eder ve onarır
     * @param {string} url - Kontrol edilecek URL
     * @returns {string} Onarılmış URL
     */
    fixImageUrl: function(url) {
        if (!url) return 'https://via.placeholder.com/300x150?text=G%C3%B6rsel+Bulunamad%C4%B1';
        
        // Base64 görselleri olduğu gibi döndür
        if (typeof url === 'string' && url.startsWith('data:image/')) {
            return url;
        }
        
        // URL düzeltmeleri
        // Eğer URL http:// veya https:// ile başlamıyorsa, ekle
        if (typeof url === 'string' && !url.match(/^https?:\/\//)) {
            // Eğer göreli yol ise, tam URL'e çevir
            if (url.startsWith('/')) {
                const baseUrl = window.location.origin;
                return baseUrl + url;
            }
            
            // Aksi halde https:// ekle
            return 'https://' + url;
        }
        
        return url;
    },
    
    /**
     * Görsel URL'ini yükleyebilir mi kontrol eder
     * @param {string} url - Kontrol edilecek URL
     * @returns {Promise<boolean>} Görsel yüklenebilir mi
     */
    checkImageExists: function(url) {
        return new Promise((resolve) => {
            if (!url) {
                resolve(false);
                return;
            }
            
            // Base64 görselleri her zaman geçerli kabul et
            if (typeof url === 'string' && url.startsWith('data:image/')) {
                resolve(true);
                return;
            }
            
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    },
    
    /**
     * Banner resimlerini görselde hata oluşursa yedek görsel gösterecek şekilde render eder
     * @param {HTMLImageElement} imgElement - Görsel elementi
     * @param {string} imageUrl - Görsel URL'i
     * @param {string} fallbackUrl - Yedek görsel URL'i
     */
    renderSafeImage: function(imgElement, imageUrl, fallbackUrl = 'https://via.placeholder.com/1200x400?text=G%C3%B6rsel+Bulunamad%C4%B1') {
        if (!imgElement) return;
        
        // Orijinal URL'i koru
        imgElement.setAttribute('data-original-src', imageUrl);
        
        // Görsel yüklenemezse yedek görseli göster
        imgElement.onerror = function() {
            if (this.src !== fallbackUrl) {
                console.warn('Görsel yüklenemedi, yedek görsel gösteriliyor:', imageUrl);
                this.src = fallbackUrl;
            }
        };
        
        // URL'i düzelt
        const fixedUrl = this.fixImageUrl(imageUrl);
        imgElement.src = fixedUrl;
    },
    
    /**
     * Tüm sayfa görsellerini düzeltir
     */
    fixAllImages: function() {
        // Banner slider görselleri
        const bannerImages = document.querySelectorAll('.banner-slider img');
        if (bannerImages && bannerImages.length > 0) {
            console.log(`${bannerImages.length} banner görseli bulundu, düzeltiliyor...`);
            
            bannerImages.forEach((img, index) => {
                const originalSrc = img.getAttribute('src');
                this.renderSafeImage(img, originalSrc);
                console.log(`Banner ${index+1} görseli düzeltildi:`, originalSrc);
            });
        }
        
        // Kitap görselleri
        const bookImages = document.querySelectorAll('.book-image-container img');
        if (bookImages && bookImages.length > 0) {
            console.log(`${bookImages.length} kitap görseli bulundu, düzeltiliyor...`);
            
            bookImages.forEach((img, index) => {
                const originalSrc = img.getAttribute('src');
                this.renderSafeImage(img, originalSrc, 'https://via.placeholder.com/300x450?text=Kitap+G%C3%B6rseli');
                console.log(`Kitap ${index+1} görseli düzeltildi:`, originalSrc);
            });
        }
        
        // Yazar görselleri
        const authorImages = document.querySelectorAll('.author-card img');
        if (authorImages && authorImages.length > 0) {
            console.log(`${authorImages.length} yazar görseli bulundu, düzeltiliyor...`);
            
            authorImages.forEach((img, index) => {
                const originalSrc = img.getAttribute('src');
                this.renderSafeImage(img, originalSrc, 'https://via.placeholder.com/150x150?text=Yazar');
                console.log(`Yazar ${index+1} görseli düzeltildi:`, originalSrc);
            });
        }
    }
};

// Global olarak kullanılabilir yap
window.ImageHelper = ImageHelper;

// Sayfa yüklendiğinde tüm görselleri düzelt
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        ImageHelper.fixAllImages();
    }, 500); // Biraz gecikme ver, içeriğin yüklenmesi için
}); 