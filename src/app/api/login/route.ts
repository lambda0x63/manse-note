import { NextRequest, NextResponse } from 'next/server'
import { AUTH_PASSWORD, AUTH_COOKIE } from '@/lib/auth/constants'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  
  if (password === AUTH_PASSWORD) {
    const response = NextResponse.json({ success: true })
    response.cookies.set(AUTH_COOKIE, AUTH_PASSWORD, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    
    return response
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}
