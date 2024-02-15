import { defineConfig, PluginOption, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { createRequire } from 'node:module'
import requireTransform from 'vite-plugin-require-transform'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { VitePWA } from 'vite-plugin-pwa'
import replace from '@rollup/plugin-replace'

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
        },
        plugins: [
            // @TODO: Check if we can remove the config object inside the react plugin
            react({
                // Use React plugin in all *.jsx and *.tsx files
                include: '**/*.{jsx,tsx}',
            }),
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
            }),
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
                    target: 'https://preview.devtron.ai/',
                    changeOrigin: true,
                },
                '/grafana': 'https://preview.devtron.ai/',
            },
        },
    }
    if (mode === 'development') {
        console.log(mode)
        // Global override for node environment
        baseConfig['define'] = {
            global: 'globalThis',
        }
        // } else {
        //     baseConfig['define'] = {
        //         __BASE_URL__: '/dashboard/',
        //         __ORCHESTRATOR_ROOT__: '/orchestrator',
        //     }
    }

    return baseConfig
})
