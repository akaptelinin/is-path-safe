import {describe, expect, it} from "vitest";
import {isPathSafe} from "../src/index.js";

// Helper to temporarily mock `process.platform` regardless of host OS
function withMockedPlatform(platform: NodeJS.Platform, fn: () => void) {
    const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");

    try {
        Object.defineProperty(process, "platform", {
            value: platform,
            configurable: true
        });
        fn();
    } finally {
        if (originalPlatform) {
            Object.defineProperty(process, "platform", originalPlatform);
        }
    }
}

describe("isPathSafe()", () => {
    /* ──────────────────────────────────────────────────────────── */
    /* Generic input validation                                    */
    /* ──────────────────────────────────────────────────────────── */
    it("rejects non‑string or empty input", () => {
        // @ts-expect-error intentionally wrong type
        expect(isPathSafe(undefined)).toBe(false);
        expect(isPathSafe(123 as any)).toBe(false);
        expect(isPathSafe("")).toBe(false);
        expect(isPathSafe("   ")).toBe(false);
    });

    /* ──────────────────────────────────────────────────────────── */
    /* Path traversal & injection attempts                         */
    /* ──────────────────────────────────────────────────────────── */
    it('rejects traversal attempts (".." segments)', () => {
        expect(isPathSafe("../file.txt")).toBe(false);
        expect(isPathSafe("some/../../evil")).toBe(false);
        expect(isPathSafe("C:/temp/../Windows")).toBe(false);
    });

    it("rejects paths containing a null byte", () => {
        expect(isPathSafe("/tmp/foo\u0000bar")).toBe(false);
    });

    /* ──────────────────────────────────────────────────────────── */
    /* Unix‑family paths                                           */
    /* ──────────────────────────────────────────────────────────── */
    it("accepts typical Unix paths", () => {
        expect(isPathSafe("/home/alice/report.txt")).toBe(true);
        expect(isPathSafe("/tmp/sub/dir/file.log")).toBe(true);
        expect(isPathSafe("/var/log/app.log")).toBe(true);
    });

    it("handles duplicated separators in Unix paths", () => {
        expect(isPathSafe("/tmp//sub///file.txt")).toBe(true);
    });

    it("handles trailing separator in Unix paths", () => {
        expect(isPathSafe("/tmp/folder/")).toBe(true);
    });

    it("blocks Unix system directories when maxSafety=true", () => {
        withMockedPlatform("linux", () => {
            const forbidden = ["/", "/usr", "/usr/bin/bash", "/etc", "/bin/ls", "/sbin"];
            forbidden.forEach(p => expect(isPathSafe(p, {maxSafety: true})).toBe(false));
            expect(isPathSafe("/home/alice", {maxSafety: true})).toBe(true);
        });
    });

    it("does not block Unix system directories when maxSafety=false", () => {
        withMockedPlatform("linux", () => {
            const forbidden = ["/", "/usr", "/usr/bin/bash", "/etc", "/bin/ls", "/sbin"];
            forbidden.forEach(p => expect(isPathSafe(p)).toBe(true));
            expect(isPathSafe("/home/alice")).toBe(true);
        });
    });

    /* ──────────────────────────────────────────────────────────── */
    /* Windows‑family paths                                        */
    /* ──────────────────────────────────────────────────────────── */
    it("accepts normal Windows paths", () => {
        withMockedPlatform("win32", () => {
            expect(isPathSafe("C:\Users\Bob\Desktop\test.txt")).toBe(true);

            expect(isPathSafe("D:\workspace\project\file.js")).toBe(true);
        });
    });

    it("blocks Windows system directories when maxSafety=true", () => {
        withMockedPlatform("win32", () => {
            const forbidden = [
                "C:/Windows",
                "C:/Windows/System32",
                "C:/Program Files",
                "C:/Program Files (x86)"
            ];
            forbidden.forEach(p => expect(isPathSafe(p, {maxSafety: true})).toBe(false));
        });
    });

    it("does not block Windows system directories when maxSafety=false", () => {
        withMockedPlatform("win32", () => {
            const forbidden = [
                "C:/Windows",
                "C:/Windows/System32",
                "C:/Program Files",
                "C:/Program Files (x86)"
            ];
            forbidden.forEach(p => expect(isPathSafe(p, {maxSafety: false})).toBe(true));
        });
    });

    it("is case‑insensitive on Windows with maxSafety=true", () => {
        withMockedPlatform("win32", () => {
            expect(isPathSafe("c:/windows/SYSTEM32", {maxSafety: true})).toBe(false);
        });
    });

    it("is case‑insensitive on Windows with maxSafety=false", () => {
        withMockedPlatform("win32", () => {
            expect(isPathSafe("c:/windows/SYSTEM32", {maxSafety: false})).toBe(true);
        });
    });

    it("accepts Windows UNC paths", () => {
        withMockedPlatform("win32", () => {
            expect(isPathSafe("\\server\share\file.txt")).toBe(true);
        });
    });

    /* ──────────────────────────────────────────────────────────── */
    /* Misc edge‑cases                                             */
    /* ──────────────────────────────────────────────────────────── */
    it("treats dotfiles as safe", () => {
        expect(isPathSafe("/home/alice/.config")).toBe(true);
    });

    it("normalizes mixed slashes and still validates", () => {
        withMockedPlatform("win32", () => {
            expect(isPathSafe("C:/Users/Bob/Desktop/../Windows", {maxSafety: true})).toBe(false);
        });
    });
    /* %xx → ../  */
    it("blocks percent‑encoded traversal", () => {
        expect(isPathSafe("/tmp/%2e%2e/%2e%2e/etc/passwd", {maxSafety: true})).toBe(false);
    });

    /* ---------- Windows‑trees ---------- */
    it("blocks Windows device files and short names with maxSafety=true", () => {
        withMockedPlatform("win32", () => {
            const bad = [
                "nul",
                "C:/nul",
                "CON",
                "C:/COM1",
                "C:/PROGRA~1/App",
                "\\\\?\\C:\\Windows",
                "\\\\.\\NUL",
                "//?/C:/Windows", // same prefix after normalization
                "//server/share" // UNC‑root
            ];
            bad.forEach(p => expect(isPathSafe(p, {maxSafety: true})).toBe(false));
        });
    });

    it("blocks Windows device files and short names with maxSafety=false", () => {
        withMockedPlatform("win32", () => {
            const bad = [
                "nul",
                "C:/nul",
                "CON",
                "C:/COM1",
                "C:/PROGRA~1/App",
                "\\\\?\\C:\\Windows",
                "\\\\.\\NUL",
                "//?/C:/Windows", // same prefix after normalizatio
                "//server/share" // UNC‑root
            ];
            bad.forEach(p => expect(isPathSafe(p, {maxSafety: true})).toBe(false));
        });
    });

    /* ---------- Unix‑trees ---------- */
    it("blocks extra Unix system trees with maxSafety=true", () => {
        withMockedPlatform("linux", () => {
            const bad = ["/dev/null", "/proc/self/mem", "/sys", "/run"];
            bad.forEach(p => expect(isPathSafe(p, {maxSafety: true})).toBe(false));
        });
    });

    it("blocks extra Unix system trees with maxSafety=false", () => {
        withMockedPlatform("linux", () => {
            const bad = ["/dev/null", "/proc/self/mem", "/sys", "/run"];
            bad.forEach(p => expect(isPathSafe(p)).toBe(true));
        });
    });
});
