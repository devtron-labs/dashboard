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
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:prettier/recommended',
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
        // FIXME: Turn this OFF once react-scripts is upgraded or removed
        'react/jsx-uses-react': 'warn',
        'react/react-in-jsx-scope': 'warn',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
}
