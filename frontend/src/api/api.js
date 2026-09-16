const DEFAULT_BACKEND_URL = 'https://findback-ai-qw1x.onrender.com';
const envApiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim() : '';

function getNormalizedApiUrl() {
  const isBrowser = typeof window !== 'undefined';
  const isProduction = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  let url = envApiUrl || DEFAULT_BACKEND_URL;

  // In production (e.g. Vercel deployment), strictly enforce production HTTPS backend
  if (isProduction) {
    if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
      url = DEFAULT_BACKEND_URL;
    }
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
  }

  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const API_BASE_URL = getNormalizedApiUrl();

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
    console.error('API Fetch network error:', fullUrl, err);
    throw new Error(`Unable to connect to backend server (${fullUrl}). Please verify backend is running.`);
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


