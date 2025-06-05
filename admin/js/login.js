// ... existing code ...
            // Admin paneline y├Ânlendir
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Giri┼ş ba┼şar─▒s─▒z
            showNotification('Kullan─▒c─▒ ad─▒ veya ┼şifre hatal─▒', 'error');
        }
    } catch (error) {
        console.error('Giri┼ş i┼şlemi s─▒ras─▒nda hata:', error);
        showNotification('Giri┼ş s─▒ras─▒nda bir hata olu┼ştu: ' + error.message, 'error');
    } finally {
        // Y├╝kleniyor g├Âstergesini kald─▒r
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Hat─▒rlanan kullan─▒c─▒ ad─▒n─▒ y├╝kle
function loadRememberedUser() {
    const remembered = localStorage.getItem('kritik_admin_remember') === 'true';
    const username = localStorage.getItem('kritik_admin_username');

    if (remembered && username) {
        const usernameInput = document.getElementById('username');
        const rememberCheckbox = document.getElementById('remember');

        if (usernameInput) usernameInput.value = username;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

// Bildirim g├Âsterme
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification || !notificationMessage) return;
    
    // Renk ve stil ayarla
    notification.className = 'notification';
    
    if (type === 'success') {
        notification.classList.add('bg-green-500');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500');
    } else if (type === 'warning') {
        notification.classList.add('bg-yellow-500');
    } else if (type === 'info') {
        notification.classList.add('bg-blue-500');
    }
    
    // Mesaj─▒ ayarla
    notificationMessage.textContent = message;
    
    // G├Âster
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
    
    // 5 saniye sonra gizle
    setTimeout(() => {
        notification.style.transform = 'translateY(20px)';
        notification.style.opacity = '0';
    }, 5000);
}

// Notification icon olu┼ştur
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '<i class="ri-check-line"></i>';
        case 'error': return '<i class="ri-error-warning-line"></i>';
        case 'warning': return '<i class="ri-alert-line"></i>';
        case 'info': return '<i class="ri-information-line"></i>';
        default: return '<i class="ri-notification-3-line"></i>';
    }
}

// Sayfa y├╝klendi─şinde otomatik oturum kontrol├╝ yap
document.addEventListener('DOMContentLoaded', function() {
    // Oturum kontrol├╝ - e─şer zaten giri┼ş yap─▒lm─▒┼şsa, admin paneline y├Ânlendir
    const isLoggedIn = sessionStorage.getItem('kritik_admin_logged_in') === 'true';
    
    if (isLoggedIn) {
        console.log('Aktif oturum bulundu, y├Ânlendiriliyor...');
        window.location.href = 'index.html';
    }
}); 