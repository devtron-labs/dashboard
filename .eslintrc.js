module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'prettier'],
    env: {
        browser: true,
        // ESLint 6 supports till ES2020 only
        es2020: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'airbnb',
        'airbnb/hooks',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
        project: ['./tsconfig.json'],
    },
    rules: {
        'no-console': 'warn',
        'no-var': 'error',
        'no-duplicate-imports': 'error',
        curly: ['error', 'all'],
        'keyword-spacing': 'error',
        'prettier/prettier': ['error'],
        'linebreak-style': ['error', 'unix'],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        // Since we are using typescript, we can disable the no-unused-vars rule for enum,etc
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
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
        // FIXME: Turn this OFF once react-scripts is upgraded or removed
        'react/jsx-uses-react': 'warn',
        'react/react-in-jsx-scope': 'warn',
        // additional rules:
        '@typescript-eslint/no-floating-promises': 'error',
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
        // Turning off as ESLint 6.x doesn't support optional chaining.
        // FIXME: Remove once ESLint is upgraded to latest version
        'dot-notation': 'off',
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
        'import/resolver': {
            node: {
                moduleDirectory: ['src', 'node_modules'],
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    }
}
