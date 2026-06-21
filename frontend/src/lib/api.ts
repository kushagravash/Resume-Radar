export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Standard fetch wrapper that automatically handles Auth tokens.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // We'll manage tokens in localStorage on the client side
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token');
  }

  const headers = new Headers(options.headers || {});
  
  // Don't set content-type for FormData, the browser sets it automatically with the boundary
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Attempt to extract the error detail
    let errorMessage = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
