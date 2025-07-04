// Service Worker - オフライン対応とキャッシング

const CACHE_NAME = 'interconnect-v1';
const API_CACHE_NAME = 'interconnect-api-v1';

// キャッシュするファイルのリスト
const urlsToCache = [
    '/',
    '/styles.css',
    '/dashboard.css',
    '/auth.css',
    '/common.js',
    '/auth.js',
    '/offline.html',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Service Worker のインストール
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Service Worker のアクティベート
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// フェッチイベントの処理
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // APIリクエストの処理
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // 静的アセットの処理
    event.respondWith(
        caches.match(request)
            .then(response => {
                // キャッシュにある場合はそれを返す
                if (response) {
                    return response;
                }

                // キャッシュにない場合はネットワークから取得
                return fetch(request).then(response => {
                    // 有効なレスポンスでない場合は返すだけ
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // レスポンスをクローンしてキャッシュに保存
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // オフライン時の処理
                if (request.destination === 'document') {
                    return caches.match('/offline.html');
                }
            })
    );
});

// APIリクエストの処理（ネットワークファースト戦略）
async function handleApiRequest(request) {
    try {
        // ネットワークから取得を試みる
        const networkResponse = await fetch(request);
        
        // 成功した場合はキャッシュに保存
        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // ネットワークエラーの場合はキャッシュから取得
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // キャッシュにもない場合はエラーレスポンス
        return new Response(JSON.stringify({
            error: 'オフラインです。ネットワーク接続を確認してください。'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// バックグラウンド同期
self.addEventListener('sync', event => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

// メッセージの同期
async function syncMessages() {
    // IndexedDB からオフライン時に保存したメッセージを取得
    const pendingMessages = await getPendingMessages();
    
    for (const message of pendingMessages) {
        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            
            // 送信成功したらIndexedDBから削除
            await deletePendingMessage(message.id);
        } catch (error) {
            console.error('Failed to sync message:', error);
        }
    }
}

// プッシュ通知の処理
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '新しい通知があります',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'view', title: '表示', icon: '/icons/checkmark.png' },
            { action: 'close', title: '閉じる', icon: '/icons/xmark.png' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('INTERCONNECT', options)
    );
});

// 通知クリックの処理
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/dashboard.html')
        );
    }
});

// ヘルパー関数（実際の実装では IndexedDB を使用）
async function getPendingMessages() {
    // IndexedDB から保留中のメッセージを取得
    return [];
}

async function deletePendingMessage(id) {
    // IndexedDB から指定されたメッセージを削除
    return true;
}