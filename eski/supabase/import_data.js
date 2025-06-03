// Supabase veri aktarım scripti
// Bu script, mevcut JSON verilerini Supabase veritabanına aktarır

// Supabase istemcisini başlat
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://kyqtdtyubmipiwjrudgc.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Bu anahtarı Supabase projenizden almalısınız

const supabase = createClient(supabaseUrl, supabaseKey);

// JSON dosya yolları
const booksJsonPath = path.join(__dirname, '..', 'data', 'books.json');
const authorsJsonPath = path.join(__dirname, '..', 'data', 'authors.json');
const bannersJsonPath = path.join(__dirname, '..', 'data', 'banners.json');

// Yazarları içe aktar
async function importAuthors() {
  try {
    // JSON dosyasını oku
    const authorsData = JSON.parse(fs.readFileSync(authorsJsonPath, 'utf8'));
    
    console.log(`${authorsData.length} yazar içe aktarılıyor...`);
    
    // Her bir yazarı ekle
    for (const author of authorsData) {
      const { data, error } = await supabase
        .from('authors')
        .insert([{
          id: author.id,
          name: author.name,
          bio: author.bio,
          photo_url: author.photo,
          book_count: author.bookCount || 0
        }]);
      
      if (error) {
        console.error(`Yazar eklenirken hata: ${author.name}`, error);
      } else {
        console.log(`Yazar eklendi: ${author.name}`);
      }
    }
    
    console.log('Yazarlar başarıyla içe aktarıldı!');
  } catch (error) {
    console.error('Yazarlar içe aktarılırken hata oluştu:', error);
  }
}

// Kitapları içe aktar
async function importBooks() {
  try {
    // JSON dosyasını oku
    const booksData = JSON.parse(fs.readFileSync(booksJsonPath, 'utf8'));
    
    console.log(`${booksData.length} kitap içe aktarılıyor...`);
    
    // Her bir kitabı ekle
    for (const book of booksData) {
      const { data, error } = await supabase
        .from('books')
        .insert([{
          id: book.id,
          title: book.title,
          author_id: book.authorId,
          description: book.description,
          cover_url: book.cover,
          price: book.price,
          original_price: book.originalPrice,
          discount: book.discount,
          category: book.category,
          year: book.year,
          pages: book.pages,
          publisher: book.publisher,
          language: book.language,
          isbn: book.isbn,
          rating: book.rating,
          review_count: book.reviewCount,
          is_new: book.isNew,
          is_bestseller: book.isBestseller,
          stock: book.stock,
          excerpt: book.excerpt
        }]);
      
      if (error) {
        console.error(`Kitap eklenirken hata: ${book.title}`, error);
      } else {
        console.log(`Kitap eklendi: ${book.title}`);
      }
    }
    
    console.log('Kitaplar başarıyla içe aktarıldı!');
  } catch (error) {
    console.error('Kitaplar içe aktarılırken hata oluştu:', error);
  }
}

// Bannerları içe aktar
async function importBanners() {
  try {
    // JSON dosyasını oku
    if (!fs.existsSync(bannersJsonPath)) {
      console.log('Bannerlar JSON dosyası bulunamadı, bu adım atlanıyor.');
      return;
    }
    
    const bannersData = JSON.parse(fs.readFileSync(bannersJsonPath, 'utf8'));
    
    console.log(`${bannersData.length} banner içe aktarılıyor...`);
    
    // Her bir bannerı ekle
    for (const banner of bannersData) {
      const { data, error } = await supabase
        .from('banners')
        .insert([{
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle,
          description: banner.description,
          image_url: banner.image,
          link: banner.link,
          active: banner.active !== false,
          order_number: banner.order || 0
        }]);
      
      if (error) {
        console.error(`Banner eklenirken hata: ${banner.title}`, error);
      } else {
        console.log(`Banner eklendi: ${banner.title}`);
      }
    }
    
    console.log('Bannerlar başarıyla içe aktarıldı!');
  } catch (error) {
    console.error('Bannerlar içe aktarılırken hata oluştu:', error);
  }
}

// Ana fonksiyon
async function importAllData() {
  try {
    // Önce yazarları ekle (foreign key ilişkisi nedeniyle)
    await importAuthors();
    
    // Sonra kitapları ekle
    await importBooks();
    
    // Son olarak bannerları ekle
    await importBanners();
    
    console.log('Tüm veriler başarıyla içe aktarıldı!');
  } catch (error) {
    console.error('Veri içe aktarma işlemi sırasında hata oluştu:', error);
  }
}

// Veri aktarımını başlat
importAllData();
