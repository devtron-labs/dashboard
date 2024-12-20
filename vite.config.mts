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

// Changed to .mts to support importing from ESM module

import { defineConfig, PluginOption, loadEnv, splitVendorChunkPlugin, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { createRequire } from 'node:module'
import requireTransform from 'vite-plugin-require-transform'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { VitePWA } from 'vite-plugin-pwa'
// import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import tsconfigPaths from 'vite-tsconfig-paths'

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`
const TARGET_URL = 'https://staging.devtron.info/'

function reactVirtualized(): PluginOption {
    return {
        name: 'flat:react-virtualized',
        // Note: we cannot use the `transform` hook here
        //       because libraries are pre-bundled in vite directly,
        //       plugins aren't able to hack that step currently.
        //       so instead we manually edit the file in node_modules.
        //       all we need is to find the timing before pre-bundling.
        configResolved: async () => {
            const require = createRequire(import.meta.url)
            const reactVirtualizedPath = require.resolve('react-virtualized')
            const { pathname: reactVirtualizedFilePath } = new url.URL(reactVirtualizedPath, import.meta.url)
            const file = reactVirtualizedFilePath.replace(
                path.join('dist', 'commonjs', 'index.js'),
                path.join('dist', 'es', 'WindowScroller', 'utils', 'onScroll.js'),
            )
            const code = await fs.readFile(file, 'utf-8')
            const modified = code.replace(WRONG_CODE, '')
            await fs.writeFile(file, modified)
        },
    }
}
// this method is used to move all the script and styles to bottom after body
const jsToBottomNoModule = () => {
    return {
        name: 'no-attribute',
        transformIndexHtml(html) {
            let customInjection = ''
            const scriptTag = html.match(/<script type="module"[^>]*>(.*?)<\/script[^>]*>/)[0]
            console.log('\n SCRIPT TAG', scriptTag, '\n')
            html = html.replace(scriptTag, '')
            customInjection += scriptTag

            const linkTagModulePreloadList = [...html.matchAll(/<link rel="modulepreload"[^>]*>/g)]
            console.log('------------------------------------------------------------')
            linkTagModulePreloadList.forEach((linkData) => {
                console.log('\n modulepreload', linkData[0], '\n')
                html = html.replace(linkData[0], '')
                customInjection += linkData[0]
            })

            /*
             * uncomment bellow after CSS fix on pull image digest cluster env and others wherever order is giving issues
             */
            // let linkTagStyleSheetList = [...html.matchAll(/<link rel="stylesheet"[^>]*>/g)]
            // console.log('------------------------------------------------------------')
            // linkTagStyleSheetList.forEach((linkData) => {
            //     console.log('\n stylesheet', linkData[0], '\n')
            //     html = html.replace(linkData[0], '')
            //     customInjection += linkData[0]
            // })

            html = html.replace('<!-- # INSERT SCRIPT HERE -->', customInjection)
            console.log('------------------------------------------------------------')
            return html
        },
    }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
    const baseConfig: UserConfig = {
        base: '/dashboard',
        preview: {
            port: 3000,
        },
        build: {
            sourcemap: true,
            rollupOptions: {
                output: {
                    manualChunks(id: string): `@${string}` | undefined {
                        if (
                            id.includes('/node_modules/moment') ||
                            id.includes('/node_modules/moment-timezone') ||
                            id.includes('@moment')
                        ) {
                            return '@moment'
                        }

                        // @react-select is generated from @devtron-labs libs; same for others
                        if (id.includes('/node_modules/react-select') || id.includes('@react-select')) {
                            return '@react-select'
                        }

                        if (id.includes('node_modules/react-virtualized')) {
                            return '@react-virtualized'
                        }

                        if (id.includes('node_modules/react-dates') || id.includes('@react-dates')) {
                            return '@react-dates'
                        }

                        if (id.includes('node_modules/@rjsf')) {
                            return '@rjsf'
                        }

                        if (id.includes('node_modules/react-mde')) {
                            return '@react-mde'
                        }

                        if (
                            id.includes('node_modules/monaco-editor') ||
                            id.includes('node_modules/react-monaco-editor') ||
                            id.includes('dist/@monaco-editor')
                        ) {
                            return '@monaco-editor'
                        }

                        if (id.includes('node_modules/@rxjs')) {
                            return '@rxjs'
                        }

                        if (id.includes('node_modules/@sentry')) {
                            return '@sentry'
                        }

                        if (id.includes('react-router-dom') || id.includes('react-router')) {
                            return '@react-router'
                        }

                        // separating the common lib chunk
                        if (id.includes('devtron-fe-common-lib')) {
                            const splittedChunk = id.split('devtron-fe-common-lib/dist/')?.[1]

                            if (splittedChunk) {
                                return `@devtron-common-${splittedChunk}`
                            }
                            return '@devtron-common'
                        }

                        // if (id.includes('devtron-fe-lib')) {
                        //     const splittedChunk = id.split('devtron-fe-lib/dist/')?.[1]

                        //     if (splittedChunk) {
                        //         return `@devtron-fe-lib-${splittedChunk}`
                        //     }
                        //     return '@devtron-fe-lib'
                        // }
                    },
                },
            },
            assetsInlineLimit: 0,
        },
        plugins: [
            tsconfigPaths(),
            // @TODO: Check if we can remove the config object inside the react plugin
            react({
                // Use React plugin in all *.jsx and *.tsx files
                include: '**/*.{jsx,tsx}',
            }),
            splitVendorChunkPlugin(),
            svgr({
                svgrOptions: {},
            }),
            reactVirtualized(),
            requireTransform(),
            NodeGlobalsPolyfillPlugin({
                process: true,
            }),
            // Commented since it merges the attributes of svg there by messing up with
            // the styles
            // ViteImageOptimizer({
            //     logStats: false,
            //     cache: true,
            //     cacheLocation: '.build-cache/vite-image-optimizer',
            // }),
            // VitePWA and jsToBottomNoModule is not to be added for storybook
            ...(process.env.IS_STORYBOOK
                ? []
                : [
                      VitePWA({
                          filename: 'service-worker.js',
                          injectRegister: 'script',
                          workbox: {
                              globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                              cleanupOutdatedCaches: true,
                              maximumFileSizeToCacheInBytes: 10000000,
                          },
                          manifest: {
                              short_name: 'Devtron',
                              name: 'Devtron Dashboard',
                              description:
                                  'Easily containerize your application to move it to Kubernetes in the cloud or in your own data center. Build, test, secure, deploy, and manage your applications on Kubernetes using open-source software.',
                              icons: [
                                  {
                                      src: 'favicon.ico',
                                      sizes: '64x64 32x32 24x24 16x16',
                                      type: 'image/x-icon',
                                  },
                              ],
                              start_url: '.',
                              display: 'standalone',
                              theme_color: '#0066cc',
                              background_color: '#ffffff',
                          },
                          strategies: 'generateSW',
                          registerType: 'prompt',
                      }),
                      jsToBottomNoModule(),
                  ]),
        ],
        // test: {
        //     globals: true,
        //     environment: 'jsdom',
        //     setupFiles: './src/setupTests.ts',
        //     css: true,
        //     reporters: ['verbose'],
        //     coverage: {
        //         reporter: ['text', 'json', 'html'],
        //         include: ['src/**/*'],
        //         exclude: [],
        //     },
        // },
        server: {
            port: 3000,
            proxy: {
                '/orchestrator': {
                    target: TARGET_URL,
                    changeOrigin: true,
                },
                '/grafana': TARGET_URL,
            },
        },
    }
    if (mode === 'development') {
        console.log(mode)
        // Global override for node environment
        baseConfig['define'] = {
            global: 'globalThis',
        }
    }

    return baseConfig
})
