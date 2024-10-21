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

import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import svgr from 'vite-plugin-svgr'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import tsconfigPaths from 'vite-tsconfig-paths'
import * as packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tsconfigPaths(),
        react(),
        libInjectCss(),
        svgr({
            svgrOptions: {},
        }),
        dts(),
        NodeGlobalsPolyfillPlugin({
            process: true,
        }),
    ],
    build: {
        target: 'ES2021',
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            formats: ['es'],
        },
        rollupOptions: {
            external: [...Object.keys(packageJson.peerDependencies)],
            input: './src/index.ts',
            output: {
                assetFileNames: 'assets/[name][extname]',
                entryFileNames: '[name].js',
            },
        },
    },
})
