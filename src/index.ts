import type {PathLike} from "node:fs";

export interface IsPathSafeOptions {
    /** When `true`, additionally blocks system directories, device files, and special prefixes. */
    maxSafety?: boolean;
}

/**
 * Is the path safe for writing?
 * Returns `true` if the string does not contain obvious pitfalls.
 */
export function isPathSafe(targetPath: PathLike, opts: IsPathSafeOptions = {}): boolean {
    if (typeof targetPath !== "string" || targetPath.trim() === "") return false;

    /** original without extra spaces */
    const raw = targetPath.trim();

    /** 0 - null-byte (before any manipulation) */
    if (raw.includes("\0")) return false;

    /** 1 - try decoding %xx   (URL-encoded bypass) */
    const decoded = raw.replace(/%([0-9A-Fa-f]{2})/g, (_, h) =>
        String.fromCharCode(parseInt(h, 16))
    );

    /** 2 - direct detection of `..` regardless of slashes */
    if (/(^|[\\/])\.\.([\\/]|$)/.test(decoded)) return false;

    /** ─────────────────────────────────────────────────────────── */
    if (opts.maxSafety) {
        /* special prefixes  \\?\  \\.\  //?/  //./ */
        if (/^[\\/]{2}[?.][\\/]/.test(raw)) return false;

        /* UNC root  \\server\share   //server/share   (exactly two segments) */
        if (/^[\\/]{2}[^\\/]+[\\/][^\\/]+[\\/]?$/.test(raw)) return false;
    }

    /* ── continue as before ───────────────────────────────────── */
    const unified = decoded.replace(/[\\/]+/g, "/").toLowerCase();

    const isWin = process.platform === "win32";

    if (!opts.maxSafety) return true;

    /* system directories, 8.3 names, device files — everything as before */
    if (isWin) {
        if (
            ["c:/windows", "c:/program files", "c:/program files (x86)"].some(f =>
                unified.startsWith(f)
            )
        )
            return false;
        if (/^c:\/progra~[12](\/|$)/i.test(unified)) return false;

        if (/(^|\/)(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|\/|$)/i.test(unified)) return false;
    } else {
        const forbid = [
            "/",
            "/bin",
            "/sbin",
            "/usr",
            "/etc",
            "/lib",
            "/dev",
            "/proc",
            "/sys",
            "/run"
        ];
        if (forbid.some(f => unified === f || unified.startsWith(f + "/"))) return false;
    }

    return true;
}

export default isPathSafe;
