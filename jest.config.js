module.exports = {
    preset: 'ts-jest',
    verbose: false,
    silent: false,
    testEnvironment: 'node',
    rootDir: './src',
    roots: ['./src'],
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    collectCoverage: true,
    collectCoverageFrom: ['./src/**/*.{ts,tsx,js,jsx}', '!**/node_modules/**', '!**/serviceWorker.ts'],
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
    setupFilesAfterEnv: ['jest-extended'],
    // setupFilesAfterEnv: ['./src/setupTests.js'],
    // setupFiles: ['./src/setupTests.js', 'jsdom-worker'],
}
