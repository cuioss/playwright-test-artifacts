module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:jsdoc/recommended",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  plugins: [
    "prettier",
    "jsdoc",
    "sonarjs",
    "security",
    "unicorn"
  ],
  rules: {
    "no-console": "warn",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error",
    "prettier/prettier": "error",

    "jsdoc/require-description": "error",
    "jsdoc/require-param-description": "error",
    "jsdoc/require-returns-description": "error",
    "jsdoc/no-undefined-types": "off",

    "complexity": ["warn", 15],
    "max-depth": ["warn", 4],
    "max-lines-per-function": ["warn", 100],
    "max-params": ["error", 5],

    "camelcase": "error",

    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",

    "sonarjs/cognitive-complexity": ["warn", 15],
    "sonarjs/no-duplicate-string": "warn",
    "sonarjs/no-identical-functions": "warn",

    "unicorn/filename-case": ["error", { "case": "kebabCase" }],
    "unicorn/no-null": "off",
  },
  overrides: [
    {
      files: ["tests/**/*.js"],
      rules: {
        "max-lines-per-function": "off",
        "complexity": "off",
        "sonarjs/cognitive-complexity": "off",
        "sonarjs/no-duplicate-string": "off",
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-description": "off",
        "jsdoc/require-param-description": "off",
        "jsdoc/require-returns-description": "off",
        "jsdoc/require-example": "off",
        "no-unused-vars": "warn"
      }
    }
  ]
};
