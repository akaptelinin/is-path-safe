import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
    {
        files: ["**/*.ts", "**/*.js"],
        ignores: ["dist/**", "node_modules/**"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            parser: typescriptEslintParser
        },
        plugins: {
            "@typescript-eslint": typescriptEslintPlugin,
            prettier: eslintPluginPrettier
        },
        rules: {
            curly: ["error", "multi-line"],
            "brace-style": ["error", "1tbs", {allowSingleLine: true}],
            "@typescript-eslint/explicit-module-boundary-types": "off",
            quotes: ["error", "double", {avoidEscape: true}],
            "no-multi-spaces": ["error"],
            "object-curly-spacing": ["error", "never"],
            "array-bracket-spacing": ["error", "never"]
        },
        settings: {
            env: {
                es2020: true,
                node: true
            }
        }
    },
    {
        files: ["README.md"],
        rules: {
            "no-undef": "off",
            "no-unused-vars": "off"
        }
    }
];
