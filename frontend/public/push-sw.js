self.addEventListener('push', function (event) {
    if (event.data) {
        const payload = event.data.json();
        const title = payload.title || 'MediSync-AI Notification';
        const options = {
            body: payload.body || 'You have a new notification.',
            icon: payload.icon || '/pwa-192x192.png',
            badge: '/masked-icon.svg',
            data: payload.data || {}
        };

        event.waitUntil(self.registration.showNotification(title, options));
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            const targetUrl = event.notification.data.url || '/';
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
