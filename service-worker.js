const CACHE_NAME = "berno-ia-v1";

const arquivosCache = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

// INSTALAÇÃO
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(arquivosCache);
            })
    );

    self.skipWaiting();
});

// ATIVAÇÃO
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// INTERCEPTAR REQUISIÇÕES
self.addEventListener("fetch", (event) => {

    // Não interferir nas perguntas para a IA
    if (
        event.request.url.includes(
            "/.netlify/functions/chat"
        )
    ) {
        return;
    }

    // Cache somente para GET
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {

                const copia = response.clone();

                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(
                            event.request,
                            copia
                        );
                    });

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
