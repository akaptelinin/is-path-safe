## README.md

````markdown
# is-path-safe 🔒

Tiny, zero‑runtime helper that answers a single question:

> **Can I safely write to this path?**

It runs the same logic on Windows, Linux and macOS, ships as ESM/​CJS, has no production dependencies and stays out of your way.

```sh
npm i is-path-safe
```
````

```ts
import {isPathSafe} from "is-path-safe";

isPathSafe("/tmp/report.txt"); // true
isPathSafe("../../etc/passwd"); // false
isPathSafe("C:\\Windows\\System32", {maxSafety: true}); // false on Windows
```

## API

```ts
isPathSafe(targetPath: string, opts?: { maxSafety?: boolean }): boolean;
```

| Param            | Type      | Default | Description                                                                                 |
| ---------------- | --------- | ------- | ------------------------------------------------------------------------------------------- |
| `targetPath`     | `string`  | —       | Path received from the user.                                                                |
| `opts`           | `object`  | `{}`    | Optional flags.                                                                             |
| `opts.maxSafety` | `boolean` | `false` | When **true** the function blocks well‑known system locations (`C:\Windows`, `/usr`, etc.). |

## Why another package?

- **Single job, zero deps** – does not pull the world.
- **ESM & CommonJS** – auto‑selects correct build.
- **TypeScript definitions included**.

## Contributing

PRs and issues are welcome. Please keep the package lean: no production deps and minimal footprint.

```sh
# lint, test, build
npm run lint && npm test && npm run build
```

## License

MIT © 2025 vibe coding
