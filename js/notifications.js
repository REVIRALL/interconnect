// Notifications JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initNotifications();
    initNotificationFilters();
});

// Sample notification data
const notifications = [
    {
        id: 1,
        type: 'event',
        title: '「DX推進セミナー：AIを活用した業務効率化」の参加申込を受け付けました',
        time: '2時間前',
        icon: 'fa-calendar-alt',
        unread: true
    },
    {
        id: 2,
        type: 'match',
        title: '新しいマッチング候補が見つかりました',
        time: '4時間前',
        icon: 'fa-handshake',
        unread: true
    },
    {
        id: 3,
        type: 'message',
        title: '山田太郎さんがあなたのプロフィールを閲覧しました',
        time: '6時間前',
        icon: 'fa-envelope',
        unread: false
    }
];

// Initialize notifications
function initNotifications() {
    // Get all notification buttons
    const notificationBtns = document.querySelectorAll('.notification-btn');
    const notificationBadges = document.querySelectorAll('.notification-badge');
    
    // Create notification dropdown for each button
    notificationBtns.forEach((btn, index) => {
        // Skip if dropdown already exists or if button is inside another button
        if (btn.querySelector('.notification-dropdown') || btn.closest('.notification-dropdown')) return;
        
        // Skip if this is a link (anchor tag) - let it work normally
        if (btn.tagName === 'A') {
            console.log('🔔 Skipping notification link:', btn.href);
            return;
        }
        
        // Create wrapper to handle position
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        
        // Wrap the button
        btn.parentNode.insertBefore(wrapper, btn);
        wrapper.appendChild(btn);
        
        // Create dropdown container
        const dropdown = createNotificationDropdown();
        wrapper.appendChild(dropdown);
        
        // Toggle dropdown on button click
        btn.addEventListener('click', function(e) {
            // Only prevent default for buttons, not links
            if (btn.tagName !== 'A') {
                e.preventDefault();
                e.stopPropagation();
            } else {
                // リンクの場合は何もしない
                console.log('🔗 Notification link clicked, allowing navigation');
                return;
            }
            
            // Close all other dropdowns
            document.querySelectorAll('.notification-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('show');
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('show');
            
            // Mark notifications as read when opened
            if (dropdown.classList.contains('show')) {
                setTimeout(() => {
                    markNotificationsAsRead(dropdown);
                    updateNotificationBadge();
                }, 1000);
            }
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.notification-btn') && !e.target.closest('.notification-dropdown')) {
            document.querySelectorAll('.notification-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
    
    // Mark all as read button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('mark-all-read')) {
            e.preventDefault();
            markAllNotificationsAsRead();
            updateNotificationBadge();
        }
    });
    
    // View all button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-all-btn')) {
            e.preventDefault();
            window.location.href = 'notifications.html';
        }
    });
}

// Create notification dropdown HTML
function createNotificationDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    
    const hasNotifications = notifications.length > 0;
    
    dropdown.innerHTML = `
        <div class="notification-header">
            <h3>通知</h3>
            ${hasNotifications ? '<button class="mark-all-read">すべて既読にする</button>' : ''}
        </div>
        ${hasNotifications ? `
            <div class="notification-list">
                ${notifications.map(notification => createNotificationItem(notification)).join('')}
            </div>
            <div class="notification-footer">
                <a href="notifications.html" class="view-all-btn">すべて見る</a>
            </div>
        ` : `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>新しい通知はありません</p>
            </div>
        `}
    `;
    
    // Add styles
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'css/notifications.css';
    if (!document.querySelector('link[href="css/notifications.css"]')) {
        document.head.appendChild(style);
    }
    
    return dropdown;
}

// Create individual notification item
function createNotificationItem(notification) {
    return `
        <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
            <div class="notification-content">
                <div class="notification-icon ${notification.type}">
                    <i class="fas ${notification.icon}"></i>
                </div>
                <div class="notification-details">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            </div>
        </div>
    `;
}

// Mark notifications as read
function markNotificationsAsRead(dropdown) {
    const unreadItems = dropdown.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
        const notificationId = item.dataset.id;
        const notification = notifications.find(n => n.id == notificationId);
        if (notification) {
            notification.unread = false;
        }
    });
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    notifications.forEach(notification => {
        notification.unread = false;
    });
    
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
    });
}

// Update notification badge
function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => n.unread).length;
    const badges = document.querySelectorAll('.notification-badge');
    
    badges.forEach(badge => {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    });
}

// Initialize notification filters (for notifications page)
function initNotificationFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const notificationItems = document.querySelectorAll('.notification-item-full');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter notifications
            notificationItems.forEach(item => {
                if (filter === 'all' || item.dataset.type === filter) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Update group visibility
            document.querySelectorAll('.notifications-group').forEach(group => {
                const visibleItems = group.querySelectorAll('.notification-item-full:not([style*="display: none"])');
                if (visibleItems.length === 0) {
                    group.style.display = 'none';
                } else {
                    group.style.display = 'block';
                }
            });
        });
    });
}

// Add notification click handlers
document.addEventListener('click', function(e) {
    const notificationItem = e.target.closest('.notification-item');
    if (notificationItem) {
        // Handle notification click
        const notificationId = notificationItem.dataset.id;
        console.log('Notification clicked:', notificationId);
        
        // You can add navigation logic here based on notification type
        // For example:
        // - Event notifications -> go to event page
        // - Match notifications -> go to matching page
        // - Message notifications -> go to messages page
    }
});