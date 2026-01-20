import { AUTH_PASSWORD, AUTH_HEADER_NAME } from '@/lib/auth/constants'

export function getApiHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    [AUTH_HEADER_NAME]: AUTH_PASSWORD
  }
}

export async function apiRequest(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    headers: {
      ...getApiHeaders(),
      ...options?.headers
    }
  })
}
