// Minimaler Service Worker: macht die App installierbar, lädt immer frisch aus dem Netz
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
