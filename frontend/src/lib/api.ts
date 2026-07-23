const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((headers as Record<string, string>) || {}),
  };

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      authHeaders['Authorization'] = `Bearer ${storedToken}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: authHeaders,
    ...rest,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { method: 'GET', ...options }),

  post: <T = any>(endpoint: string, body: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  patch: <T = any>(endpoint: string, body: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  put: <T = any>(endpoint: string, body: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { method: 'DELETE', ...options }),

  upload: async <T = any>(endpoint: string, formData: FormData, options?: FetchOptions) => {
    const { token, ...rest } = options || {};
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      ...rest,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json() as Promise<T>;
  },
};
