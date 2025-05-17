import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./test/setup.ts",
        coverage: {
            provider: "v8",
            reportsDirectory: "./coverage",
            reporter: ["text", "json", "html", "lcov"],
            all: true,
            include: ["src/**/*.ts", "src/**/*.tsx"],
            exclude: ["node_modules", "tests", "dist", "test"],
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80
            }
        }
    },
    resolve: {
        alias: {
            "@": "/src"
        }
    }
});
