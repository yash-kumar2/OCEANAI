// src/api.js
export const API_BASE = "http://localhost:5000/api";

export const apiCall = async (token, endpoint, method = 'GET', body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    if (res.status === 401) {
      const err = new Error('Unauthorized');
      err.code = 401;
      throw err;
    }

    if (!res.ok) {
      const errBody = await res.json().catch(()=> ({}));
      throw new Error(errBody.error || 'Request failed');
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return await res.blob();
  } catch (err) {
    throw err;
  }
};
