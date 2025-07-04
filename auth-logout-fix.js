// Global logout functionality that works across all pages
// This file ensures logout is available on every page

(function() {
    // Define global logout function
    window.logout = function() {
        if (confirm('ログアウトしますか？')) {
            // Clear all auth-related data
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('rememberLogin');
            
            // Clear any other session data
            sessionStorage.clear();
            
            // Redirect to login page
            window.location.href = '/login.html';
        }
    };

    // Add logout to window for global access
    if (typeof window.logout === 'undefined') {
        console.warn('Logout function was not defined, using fallback');
    }

    // Ensure auth object is available
    document.addEventListener('DOMContentLoaded', function() {
        // Check if we're on a protected page
        const protectedPages = [
            'dashboard.html', 'profile.html', 'members.html', 
            'events.html', 'messages.html', 'business.html', 
            'invite.html', 'settings.html', 'admin.html'
        ];
        
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            // Check if user is logged in
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
                return;
            }
            
            // Update user info in UI if elements exist
            try {
                const user = JSON.parse(currentUser);
                
                // Update sidebar user info
                const userNameElements = document.querySelectorAll('.user-name');
                userNameElements.forEach(el => {
                    el.textContent = user.firstName + ' ' + user.lastName;
                });
                
                // Update user role
                const userRoleElements = document.querySelectorAll('.user-role');
                userRoleElements.forEach(el => {
                    el.textContent = user.position || user.role;
                });
                
                // Update profile images
                const userAvatars = document.querySelectorAll('.user-avatar, .user-menu-btn img');
                userAvatars.forEach(img => {
                    if (user.profileImage) {
                        img.src = user.profileImage;
                    }
                });
                
                // Show/hide admin menu items
                if (user.role !== 'admin') {
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = 'none';
                    });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        
        // Add click handlers for logout buttons/links
        const logoutElements = document.querySelectorAll('[onclick*="logout"], [href*="logout"]');
        logoutElements.forEach(element => {
            element.removeAttribute('onclick'); // Remove inline onclick
            element.addEventListener('click', function(e) {
                e.preventDefault();
                window.logout();
            });
        });
    });
})();