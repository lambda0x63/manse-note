export const AUTH_COOKIE = 'auth-token'
export const AUTH_HEADER_NAME = 'x-auth-token'

// 클라이언트/서버 공용 비밀번호 상수 (환경변수로 오버라이드 가능)
export const AUTH_PASSWORD =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_PASSWORD) || '990110'

