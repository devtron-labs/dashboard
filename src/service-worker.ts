// import { precacheAndRoute } from 'workbox-precaching'
// import { NavigationRoute, registerRoute, Route } from 'workbox-routing'
// import * as navigationPreload from 'workbox-navigation-preload'
// import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
// import { clientsClaim } from 'workbox-core'

import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        // eslint-disable-next-line no-void
        void self.skipWaiting()
    }
})

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

clientsClaim()
