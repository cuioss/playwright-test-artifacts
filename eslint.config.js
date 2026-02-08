import js from "@eslint/js";
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-plugin-prettier/recommended";
import sonarjs from "eslint-plugin-sonarjs";
import security from "eslint-plugin-security";
import unicorn from "eslint-plugin-unicorn";

export default [
    js.configs.recommended,
    jsdoc.configs["flat/recommended"],
    prettier,
    sonarjs.configs.recommended,
    security.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            unicorn,
        },
        rules: {
            "no-console": "warn",
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "prefer-const": "error",
            "no-var": "error",

            "jsdoc/require-description": "error",
            "jsdoc/require-param-description": "error",
            "jsdoc/require-returns-description": "error",
            "jsdoc/no-undefined-types": "off",

            complexity: ["warn", 15],
            "max-depth": ["warn", 4],
            "max-lines-per-function": ["warn", 100],
            "max-params": ["error", 5],

            camelcase: "error",

            "security/detect-object-injection": "warn",
            "security/detect-non-literal-regexp": "warn",

            "unicorn/filename-case": ["error", { case: "kebabCase" }],
            "unicorn/no-null": "off",
        },
    },
    {
        files: ["tests/**/*.js"],
        rules: {
            "max-lines-per-function": "off",
            complexity: "off",
            "sonarjs/cognitive-complexity": "off",
            "sonarjs/no-duplicate-string": "off",
            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-description": "off",
            "jsdoc/require-param-description": "off",
            "jsdoc/require-returns-description": "off",
            "jsdoc/require-example": "off",
            "no-unused-vars": "warn",
        },
    },
];
