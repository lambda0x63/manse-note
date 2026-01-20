let setLoadingFn: ((loading: boolean) => void) | null = null

export function setApiLoading(fn: (loading: boolean) => void) {
  setLoadingFn = fn
}

import { AUTH_PASSWORD, AUTH_HEADER_NAME } from '@/lib/auth/constants'

export async function apiRequestWithLoading(url: string, options?: RequestInit) {
  setLoadingFn?.(true)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        [AUTH_HEADER_NAME]: AUTH_PASSWORD,
        ...options?.headers,
      },
    })
    
    return response
  } finally {
    setTimeout(() => {
      setLoadingFn?.(false)
    }, 100)
  }
}
