/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
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

// clean old assets
cleanupOutdatedCaches()

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
    ({ request, url }) =>
        ['image', 'script', 'style'].includes(request.destination) && url.pathname.includes('/dashboard/assets/'),
    new StaleWhileRevalidate({
        cacheName: 'static-assets',
    }),
)

// Register the route handling static assets
registerRoute(staticAssetsRoute)
