const CACHE_VER = 102;
const CACHE_PREFIX = "misophonia-mask-v";
const CACHE_NAME = CACHE_PREFIX + CACHE_VER;

// supported clip formats (see index.js)
const CLIP_FORMATS = [
  "ogg",
  "mp3",
]

// files to be cached for offline use
const ASSETS = [
    "./",
    "./index.html",
    "./index.css",
    "./index.js",
    "./icon.svg",
];
// add all audio clip files as assets
[
  "white",
  "grey",
  "red",
  "pink",
  "green",
  "blue",
  "purple",
].forEach((base) => CLIP_FORMATS.forEach((ext) => ASSETS.push(`./clips/${base}.${ext}`)));


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