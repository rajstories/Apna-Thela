// Service Worker for Apna Thela PWA
const CACHE_NAME = 'apna-thela-v1.2.0';
const DATA_CACHE_NAME = 'apna-thela-data-v1.0.0';

// Static assets to cache
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/inventory',
  '/api/inventory/low-stock',
  '/api/suppliers',
  '/api/suppliers/categories'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  return self.clients.claim();
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request).then((response) => {
          // If online, cache the response and return it
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          // If offline, try to serve from cache
          console.log('[SW] Serving API data from cache:', url.pathname);
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              // Add offline indicator to response headers
              const headers = new Headers(cachedResponse.headers);
              headers.set('X-Served-From', 'cache');
              return new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: headers
              });
            }
            
            // Return fallback offline data
            return getFallbackData(url.pathname);
          });
        });
      })
    );
    return;
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }
      
      // Try to fetch from network
      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200 && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return offline fallback for HTML pages
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-inventory') {
    console.log('[SW] Background sync: Updating inventory data');
    event.waitUntil(syncInventoryData());
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'apna-thela-notification',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Apna Thela', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Fallback data for when offline and no cache available
function getFallbackData(pathname) {
  const fallbackData = {
    '/api/inventory': JSON.stringify([
      {
        id: 'offline-1',
        name: 'Cached Inventory Item',
        quantity: 0,
        unit: 'kg',
        category: 'vegetables',
        lowStockThreshold: 5,
        isOffline: true
      }
    ]),
    '/api/inventory/low-stock': JSON.stringify([]),
    '/api/suppliers': JSON.stringify([
      {
        id: 'offline-supplier',
        name: 'Offline Mode - Check Connection',
        category: 'vegetables',
        city: 'Delhi',
        phone: '',
        isOffline: true
      }
    ]),
    '/api/suppliers/categories': JSON.stringify([
      'vegetables', 'spices', 'oil', 'dairy', 'meat'
    ])
  };
  
  const data = fallbackData[pathname] || JSON.stringify({ error: 'Offline', message: 'No cached data available' });
  
  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'X-Served-From': 'fallback'
    }
  });
}

// Sync inventory data when connection is restored
async function syncInventoryData() {
  try {
    const response = await fetch('/api/inventory');
    if (response.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put('/api/inventory', response.clone());
      console.log('[SW] Inventory data synced successfully');
    }
  } catch (error) {
    console.log('[SW] Failed to sync inventory data:', error);
  }
}

// Periodic background sync (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncInventoryData());
  }
});