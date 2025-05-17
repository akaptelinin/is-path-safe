module.exports = {
    root: true,
    env: {
        es2020: true,
        node: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 11,
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    rules: {
        curly: ["error", "multi-line"],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        quotes: ["error", "double", {avoidEscape: true}],
        "no-multi-spaces": ["error"],
        "object-curly-spacing": ["error", "never"],
        "array-bracket-spacing": ["error", "never"]
    }
};
