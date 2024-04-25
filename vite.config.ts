import { defineConfig, PluginOption, loadEnv, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { createRequire } from 'node:module'
import requireTransform from 'vite-plugin-require-transform'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { VitePWA } from 'vite-plugin-pwa'

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`

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
    const baseConfig = {
        base: '/dashboard/',
        preview: {
            port: 3000,
        },
        build: {
            sourcemap: true,
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        // separating the common lib chunk
                        if (id.includes('devtron-fe-common-lib')) {
                            return '@devtron-common'
                        }
                        if (id.includes('@devtron')) {
                            return '@devtron'
                        }
                    },
                },
            },
        },
        plugins: [
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
            VitePWA({
                srcDir: 'src',
                filename: 'service-worker.ts',
                strategies: 'injectManifest',
            }),
            jsToBottomNoModule(),
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
                    target: 'https://devtron-2.devtron.info/',
                    changeOrigin: true,
                },
                '/grafana': 'https://devtron-2.devtron.info',
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
