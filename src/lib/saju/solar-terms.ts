// 한국천문연구원 24절기 입절시각 데이터
// 2020-2030년 주요 데이터 (실제로는 100년치 필요)
export const SOLAR_TERMS_DATA: Record<number, Record<string, string>> = {
  2024: {
    입춘: "2024-02-04T17:27:00+09:00",
    경칩: "2024-03-05T11:23:00+09:00",
    청명: "2024-04-04T15:02:00+09:00",
    입하: "2024-05-05T09:10:00+09:00",
    망종: "2024-06-05T13:10:00+09:00",
    소서: "2024-07-06T23:20:00+09:00",
    입추: "2024-08-07T09:09:00+09:00",
    백로: "2024-09-07T12:11:00+09:00",
    한로: "2024-10-08T04:00:00+09:00",
    입동: "2024-11-07T13:20:00+09:00",
    대설: "2024-12-06T18:17:00+09:00",
    소한: "2024-01-06T05:49:00+09:00"
  },
  2025: {
    입춘: "2025-02-03T23:10:00+09:00",
    경칩: "2025-03-05T17:07:00+09:00",
    청명: "2025-04-04T21:48:00+09:00",
    입하: "2025-05-05T15:57:00+09:00",
    망종: "2025-06-05T19:56:00+09:00",
    소서: "2025-07-07T06:05:00+09:00",
    입추: "2025-08-07T15:52:00+09:00",
    백로: "2025-09-07T18:52:00+09:00",
    한로: "2025-10-08T10:41:00+09:00",
    입동: "2025-11-07T19:59:00+09:00",
    대설: "2025-12-07T00:53:00+09:00",
    소한: "2025-01-05T11:33:00+09:00"
  },
  // 더 많은 년도 데이터 필요...
}

// 절기 경계 체크 함수
export function checkSolarTermBoundary(date: Date): {
  isNearBoundary: boolean
  nearestTerm?: string
  hoursFromBoundary?: number
} {
  const year = date.getFullYear()
  const yearData = SOLAR_TERMS_DATA[year]
  
  if (!yearData) {
    return { isNearBoundary: false }
  }
  
  let nearestTerm = ''
  let minHoursDiff = Infinity
  
  for (const [term, termDateStr] of Object.entries(yearData)) {
    const termDate = new Date(termDateStr)
    const hoursDiff = Math.abs(date.getTime() - termDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff < minHoursDiff) {
      minHoursDiff = hoursDiff
      nearestTerm = term
    }
  }
  
  // 절기 경계 ±1시간 이내면 경고
  const isNearBoundary = minHoursDiff <= 1
  
  return {
    isNearBoundary,
    nearestTerm: isNearBoundary ? nearestTerm : undefined,
    hoursFromBoundary: isNearBoundary ? minHoursDiff : undefined
  }
}

// 서머타임 기간 체크
export function checkSummerTime(date: Date): boolean {
  
  // 한국 서머타임 시행 기간 (주요 년도만)
  const summerTimePeriods = [
    { start: new Date('1948-06-01'), end: new Date('1948-09-12') },
    { start: new Date('1949-04-03'), end: new Date('1949-09-10') },
    { start: new Date('1950-04-01'), end: new Date('1950-09-09') },
    { start: new Date('1951-05-06'), end: new Date('1951-09-08') },
    { start: new Date('1955-05-05'), end: new Date('1955-09-08') },
    { start: new Date('1956-05-20'), end: new Date('1956-09-29') },
    { start: new Date('1957-05-05'), end: new Date('1957-09-21') },
    { start: new Date('1958-05-04'), end: new Date('1958-09-20') },
    { start: new Date('1959-05-03'), end: new Date('1959-09-19') },
    { start: new Date('1960-05-01'), end: new Date('1960-09-17') },
    { start: new Date('1987-05-10'), end: new Date('1987-10-11') },
    { start: new Date('1988-05-08'), end: new Date('1988-10-09') },
  ]
  
  return summerTimePeriods.some(period => 
    date >= period.start && date <= period.end
  )
}