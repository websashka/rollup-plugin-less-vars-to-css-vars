import { resolve, posix, win32, isAbsolute } from 'path';

import picomatch from 'picomatch';

const normalizePath = function normalizePath(filename: string) {
  return filename.split(win32.sep).join(posix.sep);
};

function getMatcherString(id: string, resolutionBase: string | false | null | undefined) {
  if (resolutionBase === false || isAbsolute(id) || id.startsWith('**')) {
    return normalizePath(id);
  }

  const basePath = normalizePath(resolve(resolutionBase || '')).replace(
    /[-^$*+?.()|[\]{}]/g,
    '\\$&'
  );
  return posix.join(basePath, normalizePath(id));
}

const getMatcher = (id: string | RegExp) =>
  id instanceof RegExp
    ? id
    : {
        test: (what: string) => {
          const pattern = getMatcherString(id, undefined);
          const fn = picomatch(pattern, { dot: true });
          const result = fn(what);
          return result;
        }
      };

export const filterByExclude = (id: string, exclude: string[] | RegExp[]) => {
  const pathId = normalizePath(id);
  const excludeMatchers = exclude.map(getMatcher);
  return excludeMatchers.some((matcher) => matcher.test(pathId));
};
