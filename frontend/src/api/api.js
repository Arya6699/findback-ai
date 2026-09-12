const API_BASE_URL = '';

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

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
