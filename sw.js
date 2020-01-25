const CACHE_NAME = 'v1'

const FILES_TO_CACHE = [
    './index.html',
    './style.css',
    './script.js',
    './storyScript.text',
]
self.addEventListener('install', evt => {
    console.log('[Service Worker] Install event')
    evt.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[Service Worker] Pre-cache offline assets')
            return cache.addAll(FILES_TO_CACHE)
        })
    )

    self.skipWaiting()
})


self.addEventListener('activate', evt => {
    console.log('[Service Worker] Activate event')
    evt.waitUntil(
        caches.keys()
        .then(keyList => {
            return Promise.all(keyList.map((key) => {
                if(key!=CACHE_NAME) {
                    console.log('[Service Worker] Remove old cache', key)
                    return caches.delete(key)
                }
            }))
        })
    )

    self.clients.claim()
})


self.addEventListener('fetch', evt => {
    console.log('[Service Worker] Fetch', evt.request.url)

    if(evt.request.mode != 'navigate') {
        return
    }

    evt.respondWith(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.match(evt.request).then((resp) => {
                return resp || fetch(evt.request).then((resp) => {
                    cache.put(evt.request, resp.clone())
                    return resp
                })
            })
        })
    )
})