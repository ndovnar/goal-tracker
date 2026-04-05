const STATIC_CACHE = "goal-tracker-static-v2";
const RUNTIME_CACHE = "goal-tracker-runtime-v2";

function getScopeUrl() {
  return new URL(self.registration.scope);
}

function getAppShellUrl() {
  return new URL(".", getScopeUrl()).toString();
}

function getIndexUrl() {
  return new URL("index.html", getScopeUrl()).toString();
}

function getStaticAssetUrls() {
  return [
    "",
    "index.html",
    "manifest.webmanifest",
    "icon.svg",
    "maskable-icon.svg",
  ].map((path) => new URL(path || ".", getScopeUrl()).toString());
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(getStaticAssetUrls())),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clonedResponse = response.clone();
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(getAppShellUrl(), clonedResponse));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(getAppShellUrl());
          return cachedResponse ?? caches.match(getIndexUrl());
        }),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(event.request, clonedResponse));
        }
        return response;
      });
    }),
  );
});
