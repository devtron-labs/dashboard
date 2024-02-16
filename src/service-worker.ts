import { precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute, Route } from 'workbox-routing'
import * as navigationPreload from 'workbox-navigation-preload'
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        // eslint-disable-next-line no-void
        void self.skipWaiting()
    }
})

clientsClaim()

// Precache the manifest
precacheAndRoute(self.__WB_MANIFEST)

// Enable navigation preload
navigationPreload.enable()

// Create a new navigation route that uses the Network-first, falling back to
// cache strategy for navigation requests with its own cache. This route will be
// handled by navigation preload. The NetworkOnly strategy will work as well.
const navigationRoute = new NavigationRoute(
    new NetworkFirst({
        cacheName: 'navigations',
    }),
)

// Register the navigation route
registerRoute(navigationRoute)

// Create a route for image, script, or style requests that use a
// stale-while-revalidate strategy. This route will be unaffected
// by navigation preload.
const staticAssetsRoute = new Route(
    ({ request }) => {
        return ['image', 'script', 'style'].includes(request.destination)
    },
    new StaleWhileRevalidate({
        cacheName: 'static-assets',
    }),
)

// Register the route handling static assets
registerRoute(staticAssetsRoute)
