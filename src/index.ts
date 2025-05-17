import * as path from 'path';

export interface IsSafePathOpts {
  /** If true, system restrictions are applied (Windows + *nix) */
  maxSafety?: boolean;
}

/**
 * Checks the path for "safety" before writing.
 *
 * @param targetPath — the path as received from the user
 * @param opts — { maxSafety?: boolean }
 * @returns true / false
 */
export function isPathSafe(
  targetPath: string,
  opts: IsSafePathOpts = {}
): boolean {
  if (typeof targetPath !== 'string' || !targetPath.length) return false;

  const p = path.normalize(targetPath.trim());

  if (p.includes('\0')) return false;

  const segments = p.split(path.sep);
  if (segments.includes('..')) return false;

  if (opts.maxSafety) {
    const lower = p.toLowerCase();

    if (process.platform === 'win32') {
      const forbiddenWin = [
        'c:\\windows',
        'c:\\program files',
        'c:\\program files (x86)'
      ];
      if (forbiddenWin.some(f => lower.startsWith(f))) return false;
    } else {
      const forbiddenUnix = ['/bin', '/sbin', '/usr', '/etc', '/lib'];
      if (
        forbiddenUnix.some(f => p === f || p.startsWith(f + path.sep)) ||
        p === '/'
      )
        return false;
    }
  }

  return true;
}

export default isPathSafe;
