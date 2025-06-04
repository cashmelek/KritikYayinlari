// Supabase konfigürasyonu
const SUPABASE_URL = 'https://lddzbhbzaxigfejysary.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZHpiaGJ6YXhpZ2ZlanlzYXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTExNzksImV4cCI6MjA2NDU2NzE3OX0.Mx0ve7D0zscuZsEmxYh8EALOtHVkYZeydgwOqtiGG34';

// Supabase client'ı oluştur
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase bağlantısı başlatılıyor...');

// Veritabanı bağlantısını test et
async function checkDatabaseConnection() {
    try {
        console.log('Supabase bağlantısı test ediliyor...');
        
        // Basit bir sorgu ile bağlantıyı test et
        const { data, error } = await supabaseClient
            .from('books')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('Supabase bağlantı hatası:', error);
            return false;
        }
        
        console.log('Supabase bağlantısı başarılı!');
        return true;
    } catch (error) {
        console.error('Supabase bağlantı test hatası:', error);
        return false;
    }
}

// Admin oturum yönetimi
class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.sessionToken = localStorage.getItem('admin_session_token');
        this.checkSession();
    }
    
    async checkSession() {
        if (!this.sessionToken) {
            return false;
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('admin_sessions')
                .select('*, admin_users(*)')
                .eq('token', this.sessionToken)
                .eq('is_active', true)
                .single();
                
            if (error || !data) {
                this.logout();
                return false;
            }
            
            // Oturum süresini kontrol et
            const expiresAt = new Date(data.expires_at);
            if (expiresAt < new Date()) {
                this.logout();
                return false;
            }
            
            this.currentUser = data.admin_users;
            return true;
        } catch (error) {
            console.error('Oturum kontrol hatası:', error);
            this.logout();
            return false;
        }
    }
    
    async login(username, password) {
        try {
            // Kullanıcıyı doğrula
            const { data: user, error: userError } = await supabaseClient
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .eq('is_active', true)
                .single();
                
            if (userError || !user) {
                throw new Error('Kullanıcı bulunamadı');
            }
            
            // Şifre kontrolü (gerçek uygulamada hash'lenmiş şifre kullanılmalı)
            if (user.password !== password) {
                throw new Error('Şifre hatalı');
            }
            
            // Yeni oturum oluştur
            const sessionToken = this.generateSessionToken();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat
            
            const { data: session, error: sessionError } = await supabaseClient
                .from('admin_sessions')
                .insert({
                    user_id: user.id,
                    token: sessionToken,
                    expires_at: expiresAt.toISOString(),
                    is_active: true
                })
                .select()
                .single();
                
            if (sessionError) {
                throw new Error('Oturum oluşturulamadı');
            }
            
            // Aktivite kaydı
            await this.logActivity(user.id, 'login', 'Başarılı giriş');
            
            this.sessionToken = sessionToken;
            this.currentUser = user;
            localStorage.setItem('admin_session_token', sessionToken);
            
            return { success: true, user };
        } catch (error) {
            console.error('Giriş hatası:', error);
            return { success: false, error: error.message };
        }
    }
    
    async logout() {
        if (this.sessionToken && this.currentUser) {
            try {
                // Oturumu pasif yap
                await supabaseClient
                    .from('admin_sessions')
                    .update({ is_active: false })
                    .eq('token', this.sessionToken);
                    
                // Aktivite kaydı
                await this.logActivity(this.currentUser.id, 'logout', 'Çıkış yapıldı');
                                } catch (error) {
                console.error('Çıkış hatası:', error);
            }
        }
        
        this.sessionToken = null;
        this.currentUser = null;
        localStorage.removeItem('admin_session_token');
        
        // Login sayfasına yönlendir
        if (window.location.pathname !== '/admin/login.html') {
            window.location.href = '/admin/login.html';
        }
    }
    
    generateSessionToken() {
        return 'admin_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    async logActivity(userId, action, description) {
        try {
            await supabaseClient
                .from('admin_activity_logs')
                .insert({
                    user_id: userId,
                    action,
                    description,
                    ip_address: '127.0.0.1', // Gerçek uygulamada IP adresi alınabilir
                    user_agent: navigator.userAgent
                });
                        } catch (error) {
            console.error('Aktivite kaydı hatası:', error);
        }
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    getUser() {
        return this.currentUser;
    }
}

// Global admin auth instance
const adminAuth = new AdminAuth();

// Sayfa yüklendiğinde bağlantıyı test et
document.addEventListener('DOMContentLoaded', async function() {
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
        console.error('Supabase bağlantısı kurulamadı!');
        // Kullanıcıya hata mesajı göster
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = 'Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.';
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    
    // Login sayfası değilse oturum kontrolü yap
    if (!window.location.pathname.includes('login.html')) {
        const isLoggedIn = await adminAuth.checkSession();
        if (!isLoggedIn) {
            window.location.href = '/admin/login.html';
        }
    }
});

// Supabase client'ı global olarak kullanılabilir hale getir
window.supabaseClient = supabaseClient;
window.adminAuth = adminAuth;
