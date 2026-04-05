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
      // Если приложение уже открыто в фоне — отправляем postMessage и фокусируем
      for (let i = 0; i < clientList.length; i++) {
        const c = clientList[i];
        if (c.url && c.url.includes('/money-app/') && 'focus' in c) {
          return c.focus().then(function() {
            // postMessage работает когда приложение уже открыто
            if (taskId) {
              setTimeout(function() {
                c.postMessage({ type: 'open_task', taskId: taskId });
              }, 300);
            }
          });
        }
      }
      // Приложение закрыто — открываем на вкладке задач
      // iOS игнорирует параметры в URL, поэтому просто открываем приложение
      if (clients.openWindow) return clients.openWindow('/money-app/');
    })
  );
});

self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function() { self.clients.claim(); });
