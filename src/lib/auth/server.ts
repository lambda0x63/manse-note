import { cookies } from 'next/headers'
import { AUTH_COOKIE, AUTH_PASSWORD } from './constants'

export async function isServerAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const authToken = cookieStore.get(AUTH_COOKIE)
  return authToken?.value === AUTH_PASSWORD
}
