module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],
    "react-hooks/set-state-in-effect": "off",
    "react-hooks/use-memo": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prefer-const": "off",
    "no-case-declarations": "off",
    "no-empty": "off",
  },
  ignorePatterns: [".next/", "node_modules/"],
};
