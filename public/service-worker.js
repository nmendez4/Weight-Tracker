const CACHE_NAME = "data-cache-v1";
const DATA_CACHE_NAME = "static-cache-v1"

const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/db.js',
    './manifest.json',
    './icons/icon8-weight-care-50.png',
    './icons/icons8-weight-care-100.png',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
];

self.addEventListener("install", (evt) => {
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (evt) => {
    // remove old caches
    evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  self.addEventListener("fetch", (evt) => {
    // cache successful GET requests to the API
    if (evt.request.url.includes("/api/") && evt.request.method === "GET") {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request, response.clone());
                }
  
                return response;
              })
              .catch(() => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      // stop execution of the fetch event callback
      return;
    }
  
    // if the request is not for the API, serve static assets using
    // "offline-first" approach.
    evt.respondWith(
      caches.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      })
    );
  });