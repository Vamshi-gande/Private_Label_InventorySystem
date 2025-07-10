/**
 * Environment helper utilities.
 * Handles missing or malformed environment variables gracefully and provides sensible defaults.
 */

const DEFAULT_API_BASE = 'http://localhost:5000/api';

export function getApiBaseUrl() {
  const raw = process.env.BACKEND_API_URL;
  if (!raw) return DEFAULT_API_BASE;

  const isAbsolute = /^https?:\/\//i.test(raw);
  if (!isAbsolute) {
    console.warn(
      `BACKEND_API_URL should be absolute (got "${raw}"). Falling back to ${DEFAULT_API_BASE}`,
    );
    return DEFAULT_API_BASE;
  }

  // Remove trailing slash for consistency "https://x.com/api/" => "https://x.com/api"
  return raw.replace(/\/$/, '');
}
