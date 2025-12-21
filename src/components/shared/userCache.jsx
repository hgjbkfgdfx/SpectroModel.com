// Base44-compatible user cache helpers.
// These are safe stubs that keep the app building/running on GitHub Pages.
// You can replace the internals later with real auth/session logic.

let _userCache = null;
let _userCacheAt = 0;
const TTL_MS = 60 * 1000; // 1 minute

// Fetch user data with a tiny in-memory cache.
// Accepts an optional async function to actually fetch the user.
export async function fetchUserWithCache(fetcher) {
  const now = Date.now();
  if (_userCache && now - _userCacheAt < TTL_MS) return _userCache;

  if (typeof fetcher === "function") {
    try {
      const user = await fetcher();
      _userCache = user ?? null;
      _userCacheAt = Date.now();
      return _userCache;
    } catch {
      return _userCache; // fall back to whatever we had
    }
  }

  // No fetcher provided: return cached (possibly null)
  return _userCache;
}

export function clearUserCache() {
  _userCache = null;
  _userCacheAt = 0;
}

// Optional convenience export if other files expect it
export const userCache = {
  get: () => _userCache,
  set: (u) => {
    _userCache = u ?? null;
    _userCacheAt = Date.now();
  },
  clear: clearUserCache,
};
