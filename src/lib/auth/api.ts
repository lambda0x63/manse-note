import { NextRequest } from 'next/server'
import { AUTH_PASSWORD, AUTH_HEADER_NAME } from './constants'

export function checkApiAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get(AUTH_HEADER_NAME)
  return authHeader === AUTH_PASSWORD
}
