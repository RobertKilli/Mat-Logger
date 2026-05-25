self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Måltidspåminnelse', body: 'Det er tid for drivstoff!' };
  
  const opts = {
    body: data.body,
    icon: '/next.svg',
    badge: '/next.svg',
    vibrate: [100, 50, 100],
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
