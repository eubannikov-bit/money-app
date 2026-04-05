self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'Новая задача', body: '' }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'e&a', {
      body: data.body || '',
      icon: '/money-app/icon.png',
      badge: '/money-app/icon.png',
      vibrate: [200, 100, 200],
      data: { taskId: data.taskId },
      tag: 'task-' + (data.taskId || 'new'),
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const taskId = event.notification.data && event.notification.data.taskId;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Сохраняем taskId через broadcast чтобы приложение его подхватило
      function broadcast(id) {
        clientList.forEach(c => {
          if (c.url && c.url.includes('/money-app/')) {
            c.postMessage({ type: 'open_task', taskId: id });
          }
        });
      }

      // Найдём уже открытое окно
      for (let i = 0; i < clientList.length; i++) {
        const c = clientList[i];
        if (c.url && c.url.includes('/money-app/') && 'focus' in c) {
          return c.focus().then(function() {
            if (taskId) broadcast(taskId);
          });
        }
      }

      // Открываем новое окно — taskId передаём через URL hash
      const url = '/money-app/' + (taskId ? '#task=' + taskId : '');
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function() { self.clients.claim(); });
