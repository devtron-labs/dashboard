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

module.exports = {
    preset: 'ts-jest',
    verbose: false,
    silent: false,
    testEnvironment: 'node',
    rootDir: './src',
    roots: ['./src'],
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    collectCoverage: true,
    collectCoverageFrom: ['./src/**/*.{ts,tsx,js,jsx}'],
    coverageReporters: ['html'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    globals: {
        'ts-jest': {
            diagnostics: false,
            verbose: false,
            silent: false,
            tsConfig: 'tsconfig.jest.json',
        },
    },
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.(ts|tsx)?$': 'ts-jest',
    },
    // setupFilesAfterEnv: ['./src/setupTests.js'],
    // setupFiles: ['./src/setupTests.js', 'jsdom-worker'],
};