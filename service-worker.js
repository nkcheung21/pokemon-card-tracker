// Service Worker for offline functionality
const CACHE_NAME = 'pokemon-tracker-v1.0.0';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/assets/icons/pokeball.svg',
  '/assets/icons/search.svg',
  '/assets/icons/plus.svg',
  '/assets/icons/trash.svg',
  '/assets/icons/refresh.svg',
  '/assets/icons/download.svg',
  '/assets/icons/upload.svg',
  '/assets/icons/database.svg',
  '/components/CardRow.js',
  '/components/StatsPanel.js',
  '/components/Dropdown.js',
  '/utils/api.js',
  '/utils/cache.js',
  '/utils/export.js',
  '/utils/icons.js'
];

// API URLs to cache (common Pokémon)
const API_TO_CACHE = [
  'https://api.pokemontcg.io/v2/cards?q=name:pikachu&pageSize=50',
  'https://api.pokemontcg.io/v2/cards?q=name:charizard&pageSize=50',
  'https://api.pokemontcg.io/v2/cards?q=name:blastoise&pageSize=50',
  'https://api.pokemontcg.io/v2/cards?q=name:venusaur&pageSize=50',
  'https://api.pokemontcg.io/v2/cards?q=name:mewtwo&pageSize=50',
  'https://api.pokemontcg.io/v2/cards?q=name:gengar&pageSize=50'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then(cache => cache.addAll(STATIC_FILES)),
      
      caches.open(API_CACHE)
        .then(cache => Promise.all(
          API_TO_CACHE.map(url => 
            cache.add(url).catch(err => 
              console.log(`Failed to cache ${url}:`, err)
            )
          )
        ))
    ])
    .then(() => {
      console.log('✅ All files cached');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![CACHE_NAME, STATIC_CACHE, API_CACHE].includes(cacheName)) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API requests
  if (url.href.includes('api.pokemontcg.io')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            // Update cache in background
            fetch(event.request)
              .then(response => {
                if (response.ok) {
                  cache.put(event.request, response.clone());
                }
              })
              .catch(() => {}); // Ignore errors
            return cachedResponse;
          }
          
          // Otherwise fetch from network
          return fetch(event.request)
            .then(response => {
              if (response.ok) {
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(error => {
              console.log('Network error:', error);
              return new Response(JSON.stringify({
                error: 'Offline mode',
                message: 'Cannot connect to Pokémon TCG API'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        });
      })
    );
    return;
  }
  
  // Static files
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pokemon-data') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(syncPokemonData());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: 'assets/icons/pokeball.svg',
    badge: 'assets/icons/pokeball.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Tracker'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
async function syncPokemonData() {
  try {
    const cache = await caches.open(API_CACHE);
    
    // Refresh common Pokémon data
    for (const url of API_TO_CACHE) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log(`✅ Synced: ${url}`);
        }
      } catch (error) {
        console.log(`❌ Sync failed for ${url}:`, error);
      }
    }
    
    // Notify about successful sync
    self.registration.showNotification('Pokémon Tracker', {
      body: 'Collection data synced successfully!',
      icon: 'assets/icons/pokeball.svg'
    });
    
  } catch (error) {
    console.log('Sync error:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data.type === 'CACHE_API') {
    caches.open(API_CACHE).then(cache => {
      cache.put(event.data.url, new Response(JSON.stringify(event.data.data), {
        headers: { 'Content-Type': 'application/json' }
      }));
    });
  }
  
  if (event.data.type === 'GET_CACHE_STATS') {
    caches.open(API_CACHE).then(cache => {
      cache.keys().then(keys => {
        event.ports[0].postMessage({
          cachedItems: keys.length,
          cacheName: API_CACHE
        });
      });
    });
  }
});