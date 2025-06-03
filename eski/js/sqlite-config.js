// SQLite Yapılandırma Dosyası (Yerel Geliştirme İçin)
// Bu dosya, yerel geliştirme için Supabase yerine localStorage kullanımını sağlar

// LocalStorage tabanlı veritabanı işlemleri
const localDB = {
  // Kitapları getir
  async getBooks() {
    try {
      const storedBooks = localStorage.getItem('books');
      return storedBooks ? { data: JSON.parse(storedBooks), error: null } : { data: [], error: null };
    } catch (error) {
      console.error('Kitapları getirme hatası:', error);
      return { data: [], error: error.message };
    }
  },
  
  // Yazarları getir
  async getAuthors() {
    try {
      const storedAuthors = localStorage.getItem('authors');
      return storedAuthors ? { data: JSON.parse(storedAuthors), error: null } : { data: [], error: null };
    } catch (error) {
      console.error('Yazarları getirme hatası:', error);
      return { data: [], error: error.message };
    }
  },
  
  // Kitap ekle/güncelle
  async upsertBook(book) {
    try {
      let books = JSON.parse(localStorage.getItem('books') || '[]');
      
      // Kitap ID'si varsa güncelle, yoksa ekle
      const existingIndex = books.findIndex(b => b.id === book.id);
      
      if (existingIndex >= 0) {
        books[existingIndex] = { ...books[existingIndex], ...book };
      } else {
        // Yeni ID oluştur
        const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
        books.push({ ...book, id: newId });
      }
      
      localStorage.setItem('books', JSON.stringify(books));
      return { data: book, error: null };
    } catch (error) {
      console.error('Kitap ekleme/güncelleme hatası:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Yazar ekle/güncelle
  async upsertAuthor(author) {
    try {
      let authors = JSON.parse(localStorage.getItem('authors') || '[]');
      
      const existingIndex = authors.findIndex(a => a.id === author.id);
      
      if (existingIndex >= 0) {
        authors[existingIndex] = { ...authors[existingIndex], ...author };
      } else {
        const newId = authors.length > 0 ? Math.max(...authors.map(a => a.id)) + 1 : 1;
        authors.push({ ...author, id: newId });
      }
      
      localStorage.setItem('authors', JSON.stringify(authors));
      return { data: author, error: null };
    } catch (error) {
      console.error('Yazar ekleme/güncelleme hatası:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Kitap sil
  async deleteBook(id) {
    try {
      let books = JSON.parse(localStorage.getItem('books') || '[]');
      books = books.filter(book => book.id !== id);
      localStorage.setItem('books', JSON.stringify(books));
      return { error: null };
    } catch (error) {
      console.error('Kitap silme hatası:', error);
      return { error: error.message };
    }
  },
  
  // Yazar sil
  async deleteAuthor(id) {
    try {
      let authors = JSON.parse(localStorage.getItem('authors') || '[]');
      authors = authors.filter(author => author.id !== id);
      localStorage.setItem('authors', JSON.stringify(authors));
      return { error: null };
    } catch (error) {
      console.error('Yazar silme hatası:', error);
      return { error: error.message };
    }
  },
  
  // Veritabanını başlat - JSON dosyalarından veri yükle
  async initializeDatabase() {
    try {
      // Eğer localStorage'da veri yoksa, JSON dosyalarından yükle
      if (!localStorage.getItem('books') || !localStorage.getItem('authors')) {
        // JSON dosyalarından veri yükleme
        try {
          const booksResponse = await fetch('../data/books.json');
          const authorsResponse = await fetch('../data/authors.json');
          
          if (booksResponse.ok && authorsResponse.ok) {
            const books = await booksResponse.json();
            const authors = await authorsResponse.json();
            
            localStorage.setItem('books', JSON.stringify(books));
            localStorage.setItem('authors', JSON.stringify(authors));
            
            console.log('Veriler JSON dosyalarından başarıyla yüklendi');
          } else {
            throw new Error('JSON dosyaları yüklenemedi');
          }
        } catch (fetchError) {
          console.warn('JSON dosyaları yüklenemedi, örnek veriler kullanılıyor:', fetchError);
          
          // Örnek veriler
          const sampleBooks = [
            {
              id: 1,
              title: "Sefiller",
              author_id: 1,
              description: "Fransız Devrimi sonrası Fransa'da geçen epik bir roman",
              cover_url: "site_resimleri/1.png",
              price: "0",
              category: "Genel",
              year: 1862,
              pages: 1232,
              is_new: true,
              is_bestseller: true
            },
            {
              id: 2,
              title: "Suç ve Ceza",
              author_id: 2,
              description: "Bir öğrencinin işlediği cinayetin psikolojik sonuçlarını anlatan roman",
              cover_url: "site_resimleri/2.png",
              price: "0",
              category: "Genel",
              year: 1866,
              pages: 576,
              is_new: false,
              is_bestseller: true
            }
          ];
          
          const sampleAuthors = [
            {
              id: 1,
              name: "Victor Hugo",
              bio: "Fransız yazar ve şair",
              photo_url: "site_resimleri/author1.jpg"
            },
            {
              id: 2,
              name: "Fyodor Dostoyevski",
              bio: "Rus yazar ve düşünür",
              photo_url: "site_resimleri/author2.jpg"
            }
          ];
          
          localStorage.setItem('books', JSON.stringify(sampleBooks));
          localStorage.setItem('authors', JSON.stringify(sampleAuthors));
        }
      }
      
      console.log('Yerel veritabanı başlatıldı');
      return { error: null };
    } catch (error) {
      console.error('Veritabanı başlatma hatası:', error);
      return { error: error.message };
    }
  }
};

// Veritabanını başlat
localDB.initializeDatabase();

// Supabase istemcisini taklit eden global değişken
window.supabaseClient = {
  from: function(table) {
    return {
      select: function(columns = '*') {
        return {
          eq: function(column, value) {
            return {
              single: async function() {
                if (table === 'books') {
                  const { data: books } = await localDB.getBooks();
                  const book = books.find(b => b[column] === value);
                  return { data: book, error: null };
                } else if (table === 'authors') {
                  const { data: authors } = await localDB.getAuthors();
                  const author = authors.find(a => a[column] === value);
                  return { data: author, error: null };
                }
                return { data: null, error: 'Tablo bulunamadı' };
              },
              
              async execute() {
                if (table === 'books') {
                  const { data: books } = await localDB.getBooks();
                  const filteredBooks = books.filter(b => b[column] === value);
                  return { data: filteredBooks, error: null };
                } else if (table === 'authors') {
                  const { data: authors } = await localDB.getAuthors();
                  const filteredAuthors = authors.filter(a => a[column] === value);
                  return { data: filteredAuthors, error: null };
                }
                return { data: [], error: 'Tablo bulunamadı' };
              }
            };
          },
          
          async execute() {
            if (table === 'books') {
              return await localDB.getBooks();
            } else if (table === 'authors') {
              return await localDB.getAuthors();
            }
            return { data: [], error: 'Tablo bulunamadı' };
          }
        };
      },
      
      insert: function(data) {
        return {
          async execute() {
            if (table === 'books') {
              return await localDB.upsertBook(data);
            } else if (table === 'authors') {
              return await localDB.upsertAuthor(data);
            }
            return { data: null, error: 'Tablo bulunamadı' };
          }
        };
      },
      
      update: function(data) {
        return {
          eq: function(column, value) {
            return {
              async execute() {
                if (table === 'books') {
                  const { data: books } = await localDB.getBooks();
                  const book = books.find(b => b[column] === value);
                  if (book) {
                    return await localDB.upsertBook({ ...book, ...data });
                  }
                  return { data: null, error: 'Kitap bulunamadı' };
                } else if (table === 'authors') {
                  const { data: authors } = await localDB.getAuthors();
                  const author = authors.find(a => a[column] === value);
                  if (author) {
                    return await localDB.upsertAuthor({ ...author, ...data });
                  }
                  return { data: null, error: 'Yazar bulunamadı' };
                }
                return { data: null, error: 'Tablo bulunamadı' };
              }
            };
          }
        };
      },
      
      delete: function() {
        return {
          eq: function(column, value) {
            return {
              async execute() {
                if (table === 'books') {
                  const { data: books } = await localDB.getBooks();
                  const book = books.find(b => b[column] === value);
                  if (book) {
                    return await localDB.deleteBook(book.id);
                  }
                  return { error: 'Kitap bulunamadı' };
                } else if (table === 'authors') {
                  const { data: authors } = await localDB.getAuthors();
                  const author = authors.find(a => a[column] === value);
                  if (author) {
                    return await localDB.deleteAuthor(author.id);
                  }
                  return { error: 'Yazar bulunamadı' };
                }
                return { error: 'Tablo bulunamadı' };
              }
            };
          }
        };
      }
    };
  }
};

console.log('SQLite yerine localStorage kullanan yerel veritabanı emülasyonu yüklendi');