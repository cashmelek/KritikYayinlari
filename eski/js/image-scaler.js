// Görsel Ölçeklendirme Modülü - Kritik Yayınları
// Bu modül, kitap kapak görsellerinin otomatik olarak doğru boyutlara getirilmesini sağlar

const ImageScaler = {
    // Standart boyutlar
    standardSizes: {
        book: {
            width: 300,
            height: 450,
            ratio: 2/3 // 2:3 oranı (standart kitap kapağı oranı)
        },
        banner: {
            width: 1200,
            height: 400,
            ratio: 3/1 // 3:1 oranı (banner için yatay format)
        }
    },
    
    // Resmi yükle ve ölçeklendir
    async scaleImage(file, type = 'book') {
        return new Promise((resolve, reject) => {
            try {
                // Dosya kontrolü
                if (!file || !file.type.match('image.*')) {
                    throw new Error('Geçerli bir görsel dosyası değil');
                }
                
                // Boyut kontrolü
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    throw new Error('Dosya boyutu çok büyük (maksimum 10MB)');
                }
                
                // Dosya türü kontrolü
                const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!validImageTypes.includes(file.type)) {
                    throw new Error('Desteklenmeyen görsel formatı. Lütfen JPG, PNG, GIF veya WEBP formatı kullanın');
                }
                
                // Görsel yükleme
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        // Ölçeklendirme için canvas oluştur
                        const scaledImage = this.createScaledImage(img, type);
                        resolve(scaledImage);
                    };
                    img.onerror = () => reject(new Error('Görsel yüklenemedi'));
                    img.src = e.target.result;
                };
                reader.onerror = () => reject(new Error('Dosya okunamadı'));
                reader.readAsDataURL(file);
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // Görsel önizleme oluştur
    createImagePreview(file, previewElement) {
        if (!file || !file.type.match('image.*')) {
            console.error('Geçerli bir görsel dosyası değil');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },
    
    // Canvas ile ölçeklendirilmiş görsel oluştur
    createScaledImage(img, type = 'book') {
        const targetSize = this.standardSizes[type];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Canvas boyutunu ayarla
        canvas.width = targetSize.width;
        canvas.height = targetSize.height;
        
        // Arka plan rengini beyaz olarak ayarla
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Görselin oranını hesapla
        const imgRatio = img.width / img.height;
        
        // Görseli doğru oranda yerleştir
        let drawWidth, drawHeight, x, y;
        
        if (imgRatio > targetSize.ratio) {
            // Görsel daha geniş
            drawWidth = targetSize.width;
            drawHeight = drawWidth / imgRatio;
            x = 0;
            y = (targetSize.height - drawHeight) / 2;
        } else {
            // Görsel daha uzun
            drawHeight = targetSize.height;
            drawWidth = drawHeight * imgRatio;
            x = (targetSize.width - drawWidth) / 2;
            y = 0;
        }
        
        // Görseli çiz
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // DataURL olarak döndür
        return {
            dataUrl: canvas.toDataURL('image/jpeg', 0.9),
            width: targetSize.width,
            height: targetSize.height,
            originalWidth: img.width,
            originalHeight: img.height
        };
    },
    
    // Base64 veriyi Blob'a dönüştür (Supabase yüklemesi için)
    dataUrlToBlob(dataUrl) {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    },
    
    // Görsel formatını kontrol et
    validateImageFormat(file) {
        const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return validFormats.includes(file.type);
    },
    
    // Görsel dosyasını yüklemeden önce optimize et
    async optimizeImage(file, type = 'book', quality = 0.8) {
        try {
            const scaledImage = await this.scaleImage(file, type);
            const blob = this.dataUrlToBlob(scaledImage.dataUrl);
            return {
                blob,
                dataUrl: scaledImage.dataUrl,
                width: scaledImage.width,
                height: scaledImage.height,
                originalWidth: scaledImage.originalWidth,
                originalHeight: scaledImage.originalHeight
            };
        } catch (error) {
            console.error('Görsel optimizasyon hatası:', error);
            throw error;
        }
    }
};

// Global değişkene ekle
window.ImageScaler = ImageScaler; 