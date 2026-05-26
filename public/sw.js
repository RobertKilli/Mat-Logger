self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { 
    title: 'MISSION_ALERT', 
    body: 'Tactical refueling window open. Priority: PROTEIN.' 
  };
  
  const opts = {
    body: data.body,
    icon: '/file.svg', // Assuming this is the placeholder for now
    badge: '/file.svg',
    vibrate: [200, 100, 200],
    tag: 'mission-alert',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, opts)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Cache basic assets for offline cockpit functionality
const CACHE_NAME = 'cockpit-cache-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/file.svg',
  '/globe.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
