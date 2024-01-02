const prettierConfig = require('./.prettierrc')

module.exports = {
    parser: '@typescript-eslint/parser',
    env: {
        commonjs: true,
        browser: true,
        es6: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:react/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        'no-console': 'warn',
        'no-var': 'error',
        'no-duplicate-imports': 'error',
        curly: ['error', 'all'],
        'keyword-spacing': 'error',
        'prettier/prettier': ['error', prettierConfig],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
}
