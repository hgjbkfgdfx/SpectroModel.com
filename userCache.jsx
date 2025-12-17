import { base44 } from "@/api/base44Client";

let _userFetchPromise = null;
const USER_CACHE_TTL = 60000; // 1 minute cache
const CACHE_KEY = 'spectro_user_cache';
const TIMESTAMP_KEY = 'spectro_user_cache_time';

export const fetchUserWithCache = async () => {
  const now = Date.now();
  
  // Check in-memory/storage cache first
  try {
    const storedUser = sessionStorage.getItem(CACHE_KEY);
    const storedTime = parseInt(sessionStorage.getItem(TIMESTAMP_KEY) || '0');
    
    if (storedUser && (now - storedTime < USER_CACHE_TTL)) {
      return JSON.parse(storedUser);
    }
  } catch (e) {
    console.warn('Cache read error', e);
  }
  
  if (_userFetchPromise) return _userFetchPromise;

  _userFetchPromise = base44.auth.me().then(user => {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(user));
        sessionStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    } catch (e) { console.warn('Cache write error', e); }
    
    _userFetchPromise = null;
    return user;
  }).catch(err => {
    _userFetchPromise = null;
    
    // Return stale cache on error if available (fallback)
    try {
        const storedUser = sessionStorage.getItem(CACHE_KEY);
        if (storedUser) {
            console.warn('Using stale user cache due to error:', err.message);
            return JSON.parse(storedUser);
        }
    } catch (e) {}
    
    // Don't throw if it's just a 401 (not logged in), just return null
    if (err.message?.includes('401') || err.status === 401) {
        return null;
    }
    
    throw err;
  });

  return _userFetchPromise;
};

export const clearUserCache = () => {
  _userFetchPromise = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(TIMESTAMP_KEY);
  } catch (e) {}
};