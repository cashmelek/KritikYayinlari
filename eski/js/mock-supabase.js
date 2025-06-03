// Mock Supabase Servisi
// Bu dosya, Docker olmadan Supabase'i taklit eden bir servis sağlar

// Yerel depolama için kullanılan veritabanı nesnesi
class MockDatabase {
  constructor() {
    this.tables = {
      books: [],
      authors: [],
      banners: []
    };
    
    // Veritabanını başlat
    this.initializeDatabase();
  }
  
  // Veritabanını başlat
  async initializeDatabase() {
    try {
      // localStorage'dan veri yükle
      const storedBooks = localStorage.getItem('books');
      const storedAuthors = localStorage.getItem('authors');
      const storedBanners = localStorage.getItem('banners');
      
      if (storedBooks) {
        this.tables.books = JSON.parse(storedBooks);
      }
      
      if (storedAuthors) {
        this.tables.authors = JSON.parse(storedAuthors);
      }
      
      if (storedBanners) {
        this.tables.banners = JSON.parse(storedBanners);
      }
      
      // Eğer veri yoksa, örnek veri oluştur
      if (this.tables.books.length === 0) {
        await this.loadSampleData();
      }
      
      console.log('Mock veritabanı başlatıldı');
    } catch (error) {
      console.error('Veritabanı başlatma hatası:', error);
    }
  }
  
  // Örnek veri yükle
  async loadSampleData() {
    try {
      // Önce JSON dosyalarından yüklemeyi dene
      try {
        const booksResponse = await fetch('../data/books.json');
        const authorsResponse = await fetch('../data/authors.json');
        
        if (booksResponse.ok && authorsResponse.ok) {
          this.tables.books = await booksResponse.json();
          this.tables.authors = await authorsResponse.json();
          
          // localStorage'a kaydet
          localStorage.setItem('books', JSON.stringify(this.tables.books));
          localStorage.setItem('authors', JSON.stringify(this.tables.authors));
          
          console.log('Veriler JSON dosyalarından başarıyla yüklendi');
          return;
        }
      } catch (fetchError) {
        console.warn('JSON dosyaları yüklenemedi, örnek veriler kullanılıyor:', fetchError);
      }
      
      // JSON dosyaları yüklenemezse, örnek veri oluştur
      this.tables.authors = [
        {
          id: 1,
          name: "Victor Hugo",
          bio: "Fransız yazar ve şair",
          photo_url: "site_resimleri/author1.jpg",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Fyodor Dostoyevski",
          bio: "Rus yazar ve düşünür",
          photo_url: "site_resimleri/author2.jpg",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "Leo Tolstoy",
          bio: "Rus yazar ve filozof",
          photo_url: "site_resimleri/author3.jpg",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          name: "Franz Kafka",
          bio: "Çek yazar",
          photo_url: "site_resimleri/author4.jpg",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      this.tables.books = [
        {
          id: 1,
          title: "Sefiller",
          author_id: 1,
          description: "Fransız Devrimi sonrası Fransa'da geçen epik bir roman",
          cover_url: "site_resimleri/1.png",
          year: 1862,
          pages: 1232,
          is_new: true,
          is_bestseller: true,
          isbn: "978-0-123456-78-9",
          stock: 50,
          publisher: "Kritik Yayınları",
          language: "Türkçe",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "Suç ve Ceza",
          author_id: 2,
          description: "Bir öğrencinin işlediği cinayetin psikolojik sonuçlarını anlatan roman",
          cover_url: "site_resimleri/2.png",
          year: 1866,
          pages: 576,
          is_new: false,
          is_bestseller: true,
          isbn: "978-0-987654-32-1",
          stock: 30,
          publisher: "Kritik Yayınları",
          language: "Türkçe",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          title: "Savaş ve Barış",
          author_id: 3,
          description: "Napolyon savaşları döneminde Rus aristokrasisi",
          cover_url: "site_resimleri/3.png",
          year: 1869,
          pages: 1225,
          is_new: false,
          is_bestseller: false,
          isbn: "978-0-456789-01-2",
          stock: 20,
          publisher: "Kritik Yayınları",
          language: "Türkçe",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // localStorage'a kaydet
      localStorage.setItem('books', JSON.stringify(this.tables.books));
      localStorage.setItem('authors', JSON.stringify(this.tables.authors));
      
      console.log('Örnek veriler oluşturuldu');
    } catch (error) {
      console.error('Örnek veri yükleme hatası:', error);
    }
  }
  
  // Veriyi kaydet
  saveData() {
    try {
      localStorage.setItem('books', JSON.stringify(this.tables.books));
      localStorage.setItem('authors', JSON.stringify(this.tables.authors));
      localStorage.setItem('banners', JSON.stringify(this.tables.banners));
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
  }
  
  // Tablo için veri döndür
  getTable(tableName) {
    return this.tables[tableName] || [];
  }
  
  // Veri ekle veya güncelle
  upsert(tableName, data) {
    if (!this.tables[tableName]) {
      this.tables[tableName] = [];
    }
    
    const table = this.tables[tableName];
    const existingIndex = table.findIndex(item => item.id === data.id);
    
    if (existingIndex >= 0) {
      // Güncelle
      table[existingIndex] = { ...table[existingIndex], ...data };
    } else {
      // Ekle
      const newId = table.length > 0 ? Math.max(...table.map(item => item.id)) + 1 : 1;
      table.push({ ...data, id: data.id || newId });
    }
    
    this.saveData();
    return data;
  }
  
  // Veri sil
  delete(tableName, condition) {
    if (!this.tables[tableName]) {
      return false;
    }
    
    const table = this.tables[tableName];
    const initialLength = table.length;
    
    this.tables[tableName] = table.filter(item => !condition(item));
    
    if (initialLength !== this.tables[tableName].length) {
      this.saveData();
      return true;
    }
    
    return false;
  }
  
  // Filtreleme ile veri getir
  query(tableName, filterFn) {
    if (!this.tables[tableName]) {
      return [];
    }
    
    return this.tables[tableName].filter(filterFn);
  }
}

// Mock veritabanı örneği oluştur
const mockDB = new MockDatabase();

// Mock Supabase istemcisi
const mockSupabase = {
  from: function(tableName) {
    return {
      select: function(columns = '*') {
        let queryResult = mockDB.getTable(tableName);
        let filterFn = null;
        let limitCount = null;
        let orderField = null;
        let orderDirection = 'asc';
        
        const queryObj = {
          eq: function(field, value) {
            filterFn = (item) => item[field] === value;
            return this;
          },
          
          like: function(field, pattern) {
            const regexPattern = pattern.replace(/%/g, '.*');
            const regex = new RegExp(regexPattern, 'i');
            filterFn = (item) => regex.test(item[field]);
                return this;
              },
              
          ilike: function(field, pattern) {
            // Case-insensitive like - % yerine .* kullanarak regex'e çevir
            const regexPattern = pattern.replace(/%/g, '.*');
            const regex = new RegExp(regexPattern, 'i');
            filterFn = (item) => regex.test(item[field] || '');
                return this;
              },
              
          or: function(conditions) {
            // OR koşullarını işle
            filterFn = (item) => {
              return conditions.split(',').some(condition => {
                const [field, operator, value] = condition.trim().split('.');
                if (operator === 'ilike') {
                  const regexPattern = value.replace(/%/g, '.*');
                  const regex = new RegExp(regexPattern, 'i');
                  return regex.test(item[field] || '');
                    }
                return false;
                  });
            };
            return this;
          },
          
          gt: function(field, value) {
            filterFn = (item) => item[field] > value;
            return this;
          },
          
          lte: function(field, value) {
            filterFn = (item) => item[field] <= value;
            return this;
          },
          
          limit: function(count) {
            limitCount = count;
            return this;
          },
          
          order: function(field, options = {}) {
            orderField = { field, ascending: options.ascending !== false };
            return this;
          },
          
          single: function() {
            return {
              async execute() {
                return new Promise((resolve) => {
                  setTimeout(() => {
                    let result = mockDB.getTable(tableName);
                    
                    // Yazarlar tablosu için join işlemi
                    if (tableName === 'books' && columns.includes('authors')) {
                      result = result.map(book => ({
                        ...book,
                        authors: mockDB.getTable('authors').find(author => author.id === book.author_id)
                      }));
                    }
                    
                    if (filterFn) {
                      result = result.filter(filterFn);
                    }
                    
                    if (orderField) {
                      result.sort((a, b) => {
                        const aVal = a[orderField.field];
                        const bVal = b[orderField.field];
                        if (orderField.ascending) {
                          return aVal > bVal ? 1 : -1;
                        } else {
                          return aVal < bVal ? 1 : -1;
                        }
                      });
                    }
                    
                    resolve({
                      data: result.length > 0 ? result[0] : null,
                      error: null
                    });
                  }, 100);
                });
              }
            };
          },
          
          async execute() {
            return new Promise((resolve) => {
              setTimeout(() => {
                let result = mockDB.getTable(tableName);
            
                // Yazarlar tablosu için join işlemi
                if (tableName === 'books' && columns.includes('authors')) {
                  result = result.map(book => ({
                    ...book,
                    authors: mockDB.getTable('authors').find(author => author.id === book.author_id)
                  }));
                }
                
                if (filterFn) {
                  result = result.filter(filterFn);
                }
                
                if (orderField) {
                  result.sort((a, b) => {
                    const aVal = a[orderField.field];
                    const bVal = b[orderField.field];
                    if (orderField.ascending) {
                      return aVal > bVal ? 1 : -1;
                } else {
                      return aVal < bVal ? 1 : -1;
                }
              });
            }
            
            if (limitCount && typeof limitCount === 'number') {
                  result = result.slice(0, limitCount);
            }
            
                resolve({
                  data: result,
                  error: null
                });
              }, 100);
            });
          }
        };
        
        return queryObj;
      },
      
      insert: function(data) {
        return {
          select: function() {
            return {
              async execute() {
                return new Promise((resolve) => {
                  setTimeout(() => {
                // Veri diziyse ilk elemanı al, değilse direkt kullan
                const dataToInsert = Array.isArray(data) ? data[0] : data;
                const result = mockDB.upsert(tableName, dataToInsert);
                
                // Gerçek zamanlı güncelleme için olay tetikle
                try {
                  const event = new CustomEvent('supabase-insert', { 
                    detail: { table: tableName, data: result } 
                  });
                  window.dispatchEvent(event);
                  console.log(`Mock Supabase: ${tableName} tablosuna veri eklendi:`, result);
                } catch (e) {
                  console.error('Olay tetikleme hatası:', e);
                }
                
                    resolve({ data: [result], error: null });
                  }, 100);
                });
              }
            };
          },
          
          async execute() {
            return new Promise((resolve) => {
              setTimeout(() => {
            // Veri diziyse ilk elemanı al, değilse direkt kullan
            const dataToInsert = Array.isArray(data) ? data[0] : data;
            const result = mockDB.upsert(tableName, dataToInsert);
            
            // Gerçek zamanlı güncelleme için olay tetikle
            try {
              const event = new CustomEvent('supabase-insert', { 
                detail: { table: tableName, data: result } 
              });
              window.dispatchEvent(event);
              console.log(`Mock Supabase: ${tableName} tablosuna veri eklendi:`, result);
            } catch (e) {
              console.error('Olay tetikleme hatası:', e);
            }
            
                resolve({ data: [result], error: null });
              }, 100);
            });
          }
        };
      },
      
      update: function(data) {
        return {
          eq: function(column, value) {
            return {
              select: function() {
                return {
                  async execute() {
                    return new Promise((resolve) => {
                      setTimeout(() => {
                        const items = mockDB.query(tableName, item => item[column] === value);
                        
                        if (items.length > 0) {
                          const updatedItem = { ...items[0], ...data };
                          const result = mockDB.upsert(tableName, updatedItem);
                          resolve({ data: [result], error: null });
                        } else {
                          resolve({ data: null, error: 'Kayıt bulunamadı' });
                        }
                      }, 100);
                    });
                  }
                };
              },
              
              async execute() {
                return new Promise((resolve) => {
                  setTimeout(() => {
                const items = mockDB.query(tableName, item => item[column] === value);
                
                if (items.length > 0) {
                  const updatedItem = { ...items[0], ...data };
                  const result = mockDB.upsert(tableName, updatedItem);
                      resolve({ data: result, error: null });
                    } else {
                      resolve({ data: null, error: 'Kayıt bulunamadı' });
                }
                  }, 100);
                });
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
                const success = mockDB.delete(tableName, item => item[column] === value);
                return { error: success ? null : 'Kayıt bulunamadı' };
              }
            };
          }
        };
      }
    };
  }
};

// Channel fonksiyonu ekle
mockSupabase.channel = function(channelName) {
  console.log(`Mock Supabase: ${channelName} kanalı oluşturuldu`);
  return {
    on: function(event, filter, callback) {
      console.log(`Mock Supabase: ${channelName} kanalında ${event} olayı dinleniyor`, filter);
      return this;
    },
    subscribe: function(callback) {
      console.log(`Mock Supabase: ${channelName} kanalına abone olundu`);
      if (callback && typeof callback === 'function') {
        callback('SUBSCRIBED');
      }
      return this;
    },
    unsubscribe: function() {
      console.log(`Mock Supabase: ${channelName} kanalı aboneliği iptal edildi`);
      return this;
    }
  };
};

// Supabase istemcisini global olarak tanımla
window.supabaseClient = mockSupabase;

console.log('Mock Supabase servisi yüklendi');