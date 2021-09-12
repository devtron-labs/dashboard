module.exports = {
    "parser": "@typescript-eslint/parser",
    "env": {
        "commonjs": true,
        "browser": true,
        "es6": true
    },
    "parserOptions": {
       "ecmaVersion":  2018,
       "sourceType":  "module",
       "ecmaFeatures":  {
            "jsx":  true,
        }
    },
    "rules": {
        "no-var": "off",
        "no-duplicate-imports": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "curly": [0, "all"],
        "keyword-spacing": "off",
        "prefer-const": "off",
        "@typescript-eslint/no-extra-semi": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "react/prop-types": "off",
        "react/display-name": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-this-alias": "off",
        "react/jsx-key": "off",
        "react/no-unescaped-entities": "off",
        "react/no-unknown-property": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "react/jsx-no-target-blank": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "react/no-deprecated": "off",
        "react/no-direct-mutation-state": "off",
        "prefer-rest-params": "off"
    },
    "extends": [
        "plugin:@typescript-eslint/recommended",
        // "prettier",
        // "plugin:prettier/recommended",
        "plugin:react/recommended"
    ],
    "settings":  {
        "react":  {
            "version":  "detect"
        }
    }
}