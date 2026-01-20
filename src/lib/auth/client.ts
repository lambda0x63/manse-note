import { AUTH_PASSWORD } from './constants'

export function checkPassword(input: string): boolean {
  return input === AUTH_PASSWORD
}

export function setAuthSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('authenticated', 'true')
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('authenticated') === 'true'
  }
  return false
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('authenticated')
  }
}
