// Сохранить pending task в IndexedDB (доступен из SW)
function savePendingTask(taskId) {
  return new Promise(function(resolve) {
    const req = indexedDB.open('eadb', 1);
    req.onupgradeneeded = function(e) {
      e.target.result.createObjectStore('kv');
    };
    req.onsuccess = function(e) {
      const db = e.target.result;
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(taskId, 'pendingTask');
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    };
    req.onerror = resolve;
  });
}

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
    (taskId ? savePendingTask(taskId) : Promise.resolve()).then(function() {
      return clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function(clientList) {
      // Приложение уже открыто — отправляем postMessage
      for (let i = 0; i < clientList.length; i++) {
        const c = clientList[i];
        if (c.url && c.url.includes('/money-app/') && 'focus' in c) {
          return c.focus().then(function() {
            if (taskId) c.postMessage({ type: 'open_task', taskId: taskId });
          });
        }
      }
      // Открываем новое окно
      if (clients.openWindow) return clients.openWindow('/money-app/');
    })
  );
});

self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function() { self.clients.claim(); });
