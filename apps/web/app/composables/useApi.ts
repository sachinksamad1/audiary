/**
 * useApi — Fetch wrapper for NestJS backend API
 */
export function useApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiUrl || 'http://localhost:4000/api';

  async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  return {
    get: <T>(endpoint: string) => request<T>(endpoint),

    post: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    put: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  };
}
