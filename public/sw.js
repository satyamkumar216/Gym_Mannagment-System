// IronForge Gym – Service Worker v1
const CACHE_NAME = 'ironforge-v1';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
];

// ─── Install: pre-cache shell assets ───────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

// ─── Activate: clean up old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ─── Fetch: strategy router ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Determine strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Returns true for static assets that benefit from cache-first.
 */
function isStaticAsset(url) {
  const staticExtensions = /\.(js|css|svg|png|jpg|jpeg|webp|avif|gif|ico|woff2?|ttf|eot)$/;
  // Vite hashed assets live under /assets/
  if (url.pathname.startsWith('/assets/')) return true;
  return staticExtensions.test(url.pathname);
}

/**
 * Cache-first: return from cache if available, else fetch & cache.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback();
  }
}

/**
 * Network-first: try network, fall back to cache, then offline page.
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineFallback();
  }
}

/**
 * Returns a minimal offline fallback page styled to match IronForge brand.
 */
function offlineFallback() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Offline – IronForge Gym</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',system-ui,sans-serif;background:#0A0A0A;color:#F5F5F5;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}
    .card{max-width:420px}
    h1{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:#E02020;margin-bottom:.5rem;letter-spacing:.05em}
    p{font-size:1rem;line-height:1.6;color:#A0A0A0;margin-bottom:1.5rem}
    button{background:#E02020;color:#fff;border:none;padding:.75rem 2rem;border-radius:.5rem;font-size:1rem;font-weight:600;cursor:pointer;transition:background .2s}
    button:hover{background:#C41A1A}
    .icon{font-size:3rem;margin-bottom:1rem}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🏋️</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Check your network and try again.</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
