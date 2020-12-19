// pass caches to bindings for later use
const CACHE_NAME = "static-cache-v3";
const DATA_CACHE_NAME = "data-cache-v3";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.webmanifest",
  "/index.js",
  "/indexedDb.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// install
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(DATA_CACHE_NAME).then(function (cache) {
      console.log("Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// fetch
self.addEventListener("fetch", e => {
  if (e.request.url.includes("/api/")) {
    console.log("[Service Worker] Fetch (data)", e.request.url);

    e.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(e.request)
          .then((res) => {
            if (res.status === 200) {
              cache.put(e.request.url, res.clone());
            }

            return res;
          })
          .catch(err => {return cache.match(e.request);});
      })
    );
    return;
  }

  // if/else responses depending on response
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then(res => {
        if (res) {
          return res;
        } else if (e.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});
