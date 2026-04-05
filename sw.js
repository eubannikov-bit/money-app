self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'Новая задача', body: '' }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Евгений и Аннушка', {
      body: data.body || '',
      icon: '/money-app/icon.png',
      badge: '/money-app/icon.png',
      vibrate: [200, 100, 200],
      data: { taskId: data.taskId, url: '/money-app/' },
      tag: 'task-notification',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const taskId = event.notification.data?.taskId;
  const url = '/money-app/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let c of clientList) {
        if (c.url.includes('/money-app/')) {
          c.focus();
          // Открыть задачу если есть taskId
          if (taskId) c.postMessage({ type: 'open_task', taskId });
          return;
        }
      }
      // Приложение не открыто — открываем с параметром
      const target = taskId ? url + '?task=' + taskId : url;
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
