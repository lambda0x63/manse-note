// 입력: YYMMDD (6자리 숫자)
export function parseYYMMDDToISO(six: string): string {
  const cleaned = six.replace(/\D/g, '')
  if (cleaned.length !== 6) return ''
  const year2 = parseInt(cleaned.substring(0, 2))
  const month = cleaned.substring(2, 4)
  const day = cleaned.substring(4, 6)
  const fullYear = year2 < 50 ? 2000 + year2 : 1900 + year2
  return `${fullYear}-${month}-${day}`
}

// 입력: HHMM (4자리 숫자)
export function parseHHMMToTime(four: string): string {
  const cleaned = four.replace(/\D/g, '')
  if (cleaned.length !== 4) return ''
  const hour = cleaned.substring(0, 2)
  const minute = cleaned.substring(2, 4)
  const h = parseInt(hour, 10)
  const m = parseInt(minute, 10)
  if (h > 23 || m > 59) return ''
  return `${hour}:${minute}`
}

