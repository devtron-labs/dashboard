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

const tsconfigPath = require('./tsconfig.json')

module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'prettier', 'import', 'simple-import-sort'],
    env: {
        browser: true,
        es2021: true,
    },
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
        project: ['./tsconfig.json'],
    },
    globals: {
        JSX: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:@typescript-eslint/eslint-recommended',
        'airbnb',
        'airbnb/hooks',
        'prettier',
        'plugin:storybook/recommended',
    ],
    rules: {
        'prettier/prettier': ['error'],
        'linebreak-style': ['error', 'unix'],
        'no-console': 'warn',
        'no-var': 'error',
        'no-duplicate-imports': 'error',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        // Since we are using typescript, we can disable the no-unused-vars rule for enum,etc
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'react/jsx-filename-extension': [
            'error',
            {
                extensions: ['tsx'],
            },
        ],
        'react/jsx-props-no-spreading': 'off',
        'react/prefer-stateless-function': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        'no-underscore-dangle': 'off',
        'import/no-extraneous-dependencies': [
            'warn',
            {
                devDependencies: true,
            },
        ],
        'import/no-named-as-default-member': 'off',
        'no-plusplus': [
            'error',
            {
                allowForLoopAfterthoughts: true,
            },
        ],
        // Since we dont use prop-types, we can disable this rule
        'react/require-default-props': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react/function-component-definition': [
            'warn',
            {
                namedComponents: 'arrow-function',
                unnamedComponents: 'arrow-function',
            },
        ],
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        // additional rules:
        '@typescript-eslint/no-floating-promises': 'error',
        'import/prefer-default-export': 'off',
        'import/extensions': [
            'warn',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        // Re-add this while resolving ESLint issues
        'import/no-cycle': 'off',
        'import/prefer-default-export': 'off',
        'no-restricted-exports': 'off',
        'import/named': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': 'error',
        'simple-import-sort/imports': [
            'error',
            {
                groups: [
                    // Packages `react` related packages and external packages.
                    ['^react', '^@?\\w'],
                    // Devtron packages
                    ['^@devtron-labs'],
                    // Internal packages.
                    [...Object.keys(tsconfigPath.compilerOptions.paths).map((alias) => alias.replace('/*', ''))],
                    // Side effect imports.
                    ['^\\u0000'],
                    // Put same-folder imports, `..` and `.` last. Other relative imports.
                    ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$',],
                    // Style imports.
                    [ '^.+\\.?(css|scss)$'],
                ],
            },
        ],
        'simple-import-sort/exports': 'error',
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                'no-undef': 'off',
            },
        },
    ],
    settings: {
        react: {
            version: 'detect',
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
            node: {
                moduleDirectory: ['src', 'node_modules'],
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
        'import/ignore': ['\\.png$', '\\.jpg$', '\\.svg$'],
    },
    ignorePatterns: ['.eslintrc.cjs', 'vite.config.mts'],
}
