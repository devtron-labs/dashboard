module.exports = {
    preset: 'ts-jest',
    verbose: true,
    silent: false,
    testEnvironment: 'node',
    rootDir: './src',
    roots: ['./src'],
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        './src/**/*.{ts,tsx,js,jsx}',
        "!**/node_modules/**",
        "!**/coverage/**",
        "!**/serviceWorker.js",
        "!**/index.js"
    ],
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
    setupFilesAfterEnv: ['jest-extended'],
    setupFiles: ['jsdom-worker'],
};