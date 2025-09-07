const CACHE_NAME = 'jisero-v1.1.5';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/tailwind.config.js',
  '/manifest.json',
  '/styles/global.css',
  '/data/fakeData.js',
  '/utils/commonEmojis.js',
  '/utils/validation.js',
  '/utils/notifications.js',
  '/utils/storage.js',
  '/context/AppContext.js',
  '/hooks/useChat.js',
  '/hooks/useKeyboardHeight.js',
  '/components/ErrorBoundary.js',
  '/components/LazyImage.js',
  '/components/Toast.js',
  '/components/TypingIndicator.js',
  '/components/Message.js',
  '/components/MessageInput.js',
  '/components/ChatHeader.js',
  '/components/ContactProfile.js',
  '/components/SwipeableChatItem.js',
  '/components/ChatsPage.js',
  '/components/ChatDetail.js',
  '/components/SettingsSection.js',
  '/components/SettingsPage.js',
  '/components/BottomNavigation.js',
  '/components/Login.js',
  '/components/App.js',
  '/config/ios-splash.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip caching for external CDN resources to avoid CORS issues
  if (event.request.url.includes('cdn.tailwindcss.com') || 
      event.request.url.includes('unpkg.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for offline message sending
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline message queue
  return new Promise((resolve) => {
    // This would sync pending messages when back online
    console.log('Background sync triggered');
    resolve();
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New message received',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Chat',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Jisero', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
