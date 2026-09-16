const DEFAULT_BACKEND_URL = 'https://findback-ai-qw1x.onrender.com';
const envApiUrl = import.meta.env.VITE_API_URL;

// Normalize API_BASE_URL to strip trailing slash and default to production Render URL
const rawApiUrl = envApiUrl && envApiUrl.trim() !== '' ? envApiUrl.trim() : DEFAULT_BACKEND_URL;
export const API_BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = options.headers || {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, don't set Content-Type header so browser sets boundary
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;

  let response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error('Unable to connect to the authentication server. Please verify backend is running.');
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
      } else if (errorJson.message) {
        errorDetail = errorJson.message;
      }
    } catch (e) {
      if (response.statusText) {
        errorDetail = `Server error (${response.status} ${response.statusText})`;
      }
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

