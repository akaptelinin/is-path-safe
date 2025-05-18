# is‑path‑safe

Tiny **zero‑runtime** helper that answers one question:

> **Can I safely write to this path?**

It runs the *same* rules on **Linux, macOS and Windows**, auto‑picks ESM / CommonJS, ships its own TS types and drags in **zero production deps**.

---

## Quick install

```bash
npm i is-path-safe
````

---

## TL;DR — when is a path *unsafe*?

The function bails out (`false`) if the user‑supplied string…

* is empty, not a string, or contains a **NUL byte**
* tries **path‑traversal** (`../`, URL‑encoded `%2e%2e`, etc.)
* targets **well‑known system trees** when `maxSafety: true`

  * `/`, `/usr`, `/etc`, `/bin`, `/sbin`, `/dev`, `/proc`, `/sys`, `/run` on Unix
  * `C:\Windows`, `System32`, `Program Files`, DOS device names (`NUL`, `CON`, `COM1`, …) on Windows
* resolves to a **raw UNC root** (`\\server\share`) or a Win32 device path (`\\?\C:\…`)
* still looks shady after normalising mixed slashes and duplicate separators ([GitHub](./test/is-path-safe-test.test.ts))

Everything else is considered safe (`true`) – including ordinary sub‑folders, files, dot‑files and UNC paths with an actual file component.

---

## Usage

```ts
import {isPathSafe} from "is-path-safe";

isPathSafe("/tmp/report.txt");                          // true
isPathSafe("../../etc/passwd");                         // false
isPathSafe("C:\\Windows\\System32");                    // true   (loose mode)
isPathSafe("C:\\Windows\\System32", {maxSafety: true}); // false
```

### API

```ts
isPathSafe(targetPath: string, opts?: { maxSafety?: boolean }): boolean
```

| param        | type      | default | meaning                                          |
| ------------ | --------- | ------- | ------------------------------------------------ |
| `targetPath` | `string`  | –       | Path received from untrusted input               |
| `maxSafety`  | `boolean` | `false` | If `true`, block well‑known system locations too |

---

## Why not just use `path.resolve()`?

Because `path.resolve()` only normalises – **it does not vet what the final path points to**.
`is‑path‑safe` applies an allow‑list + deny‑list tuned for typical back‑end / CLI tools, so you get a boolean answer without reaching for `fs`, `stat`, or clever regexes.

---

## Supported Node versions

* Node 18 + LTS and later (both ESM and CJS entry points)

---

## Contributing

PRs and issues are welcome. Keep it lean: no prod deps, minimal footprint.

```bash
npm run lint && npm test && npm run build
```

---

## License

MIT © 2025 vibe coding
