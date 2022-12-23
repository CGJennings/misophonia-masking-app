const CACHE_VER = 101;
const CACHE_PREFIX = "misophonia-mask-v";
const CACHE_NAME = CACHE_PREFIX + CACHE_VER;

const ASSETS = [
    "./",
    "./index.html",
    "./index.css",
    "./index.js",
    "./icon.svg",
    "./clips/white.ogg",
    "./clips/grey.ogg",
    "./clips/red.ogg",
    "./clips/pink.ogg",
    "./clips/green.ogg",
    "./clips/blue.ogg",
    "./clips/purple.ogg",
    "./clips/white.mp3",
    "./clips/grey.mp3",
    "./clips/red.mp3",
    "./clips/pink.mp3",
    "./clips/green.mp3",
    "./clips/blue.mp3",
    "./clips/purple.mp3",    
];

// create current cache the first time this version is loaded
self.addEventListener("install", (ev) => {
    ev.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll(ASSETS)
        })
    );
});

// delete caches from old versions
self.addEventListener("activate", (ev) => {
    ev.waitUntil(
      caches.keys().then((keyList) =>
        Promise.all(
          keyList.map((key) => {
            if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
    );
  });

// use cache where possible, otherwise fetch from server
self.addEventListener("fetch", (ev) => {
    ev.respondWith(
        caches.match(ev.request).then((res) => {
            return res || fetch(ev.request);
        })
    );
});