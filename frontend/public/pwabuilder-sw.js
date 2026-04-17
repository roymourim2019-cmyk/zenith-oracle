const CACHE_VERSION = 'zenith-oracle-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/zenith-oracle-logo.png',
  '/assets/screenshot1.png',
];

const API_CACHE_ROUTES = [
  '/api/daily-oracle',
  '/api/oracle-feed',
  '/api/daily-tarot-card',
  '/api/accuracy/engine-status',
];

const MAX_DYNAMIC_CACHE_SIZE = 80;
const API_CACHE_TTL = 15 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== STATIC_CACHE && n !== DYNAMIC_CACHE && n !== API_CACHE)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  const path = new URL(url).pathname;
  return (
    path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') ||
    path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.svg') ||
    path.endsWith('.webp') || path.endsWith('.woff') || path.endsWith('.woff2') ||
    path.endsWith('.ico') || path.endsWith('.json')
  );
}

function isApiRoute(url) {
  const path = new URL(url).pathname;
  return API_CACHE_ROUTES.some((route) => path.startsWith(route));
}

function isCacheableApi(url) {
  const path = new URL(url).pathname;
  return path.startsWith('/api/') && (
    path.includes('daily-oracle') || path.includes('oracle-feed') ||
    path.includes('daily-tarot-card') || path.includes('engine-status')
  );
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await Promise.all(keys.slice(0, keys.length - maxItems).map((k) => cache.delete(k)));
  }
}

async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return caches.match('/index.html');
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response && response.status === 200) {
        const cache = await caches.open(API_CACHE);
        const headers = new Headers(response.headers);
        headers.set('sw-cache-time', Date.now().toString());
        const cachedResponse = new Response(await response.clone().blob(), {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        });
        cache.put(request, cachedResponse);
      }
      return response;
    })
    .catch(() => cached);

  if (cached) {
    const cacheTime = parseInt(cached.headers.get('sw-cache-time') || '0');
    if (Date.now() - cacheTime < API_CACHE_TTL) {
      return cached;
    }
  }
  return fetchPromise;
}

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== 'opaque') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('/index.html');
    return new Response(JSON.stringify({ error: 'Offline', message: 'The cosmos is temporarily veiled. Please reconnect.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;

  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isCacheableApi(request.url)) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  } else if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
  }
});

self.addEventListener('push', (event) => {
  let data = { title: 'Zenith Oracle', body: 'Your daily cosmic update is ready.' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {}

  const options = {
    body: data.body || 'The cosmos has a message for you.',
    icon: '/assets/zenith-oracle-logo.png',
    badge: '/assets/zenith-oracle-logo.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/daily' },
    actions: [
      { action: 'open', title: 'View Oracle' },
      { action: 'dismiss', title: 'Later' },
    ],
    tag: 'zenith-daily',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Zenith Oracle', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/daily';
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-readings') {
    event.waitUntil(syncPendingReadings());
  }
});

async function syncPendingReadings() {
  try {
    const cache = await caches.open('zenith-pending-sync');
    const requests = await cache.keys();
    for (const request of requests) {
      try {
        const cachedResponse = await cache.match(request);
        const body = await cachedResponse.text();
        await fetch(request, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
        await cache.delete(request);
      } catch (e) {}
    }
  } catch (e) {}
}
