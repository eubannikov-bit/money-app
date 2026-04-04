self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'Новая задача', body: '' }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Евгений и Аннушка', {
      body: data.body || '',
      icon: '/money-app/icon.png',
      badge: '/money-app/icon.png',
      vibrate: [200, 100, 200],
      data: { url: '/money-app/' }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let c of clientList) {
        if (c.url.includes('/money-app/') && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('/money-app/');
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
