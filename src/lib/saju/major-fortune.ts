// 대운(大運) 계산 로직

import solarTermsData from './solar-terms-data.json'
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from './constants'

// 대운수 계산 (절기 기준)
export function calculateFortuneStartAge(
  birthDate: Date,
  gender: '남' | '여',
  yearStem: string
): number {
  const isYangStem = ['甲', '丙', '戊', '庚', '壬'].includes(yearStem)
  const isForward = (gender === '남' && isYangStem) || (gender === '여' && !isYangStem)
  
  const year = birthDate.getFullYear()
  const yearData = (solarTermsData as Record<string, Record<string, string>>)[year]
  
  if (!yearData) {
    // 데이터가 없으면 기본값 사용
    return gender === '남' ? 7 : 6
  }
  
  // 절(節)만 사용 - 월의 시작점이 되는 12개 절기
  const JEOL_TERMS = ['소한', '입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설']
  
  // 절(節)만 필터링하여 날짜순으로 정렬
  const terms = Object.entries(yearData)
    .filter(([name]) => JEOL_TERMS.includes(name))
    .map(([name, date]) => ({
      name,
      date: new Date(date as string)
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  
  // 순행: 다음 절기까지, 역행: 이전 절기까지의 날짜 계산
  let daysDiff = 0
  
  if (isForward) {
    // 다음 절기 찾기
    const nextTerm = terms.find(t => t.date > birthDate)
    if (nextTerm) {
      daysDiff = Math.floor((nextTerm.date.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      // 다음 해 첫 절기 (소한) 사용
      const nextYearData = (solarTermsData as Record<string, Record<string, string>>)[year + 1]
      if (nextYearData && nextYearData['소한']) {
        const nextDate = new Date(nextYearData['소한'])
        daysDiff = Math.floor((nextDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    }
  } else {
    // 이전 절기 찾기
    const prevTerms = terms.filter(t => t.date <= birthDate)
    const prevTerm = prevTerms[prevTerms.length - 1]
    if (prevTerm) {
      daysDiff = Math.floor((birthDate.getTime() - prevTerm.date.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      // 이전 해 마지막 절기(대설) 사용
      const prevYearData = (solarTermsData as Record<string, Record<string, string>>)[year - 1]
      if (prevYearData && prevYearData['대설']) {
        const prevDate = new Date(prevYearData['대설'])
        daysDiff = Math.floor((birthDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    }
  }
  
  // 3일 = 1년 환산 (대운수 계산 공식)
  const fortuneStartAge = Math.round(daysDiff / 3)
  
  // 최소값 1세, 최대값 10세로 제한
  return Math.max(1, Math.min(10, fortuneStartAge))
}

// 대운 계산
export function calculateFortunes(
  gender: '남' | '여',
  yearStem: string,
  monthStem: string,
  monthBranch: string,
  birthDate: Date
): {
  fortuneStartAge: number
  fortunes: Array<{
    startAge: number
    endAge: number
    stem: string
    branch: string
  }>
} {
  // 양간(甲丙戊庚壬)인지 음간(乙丁己辛癸)인지 확인
  const isYangStem = ['甲', '丙', '戊', '庚', '壬'].includes(yearStem)
  
  // 순행/역행 결정
  const isForward = (gender === '남' && isYangStem) || (gender === '여' && !isYangStem)
  
  // 대운수 계산 (절기 기준)
  const fortuneStartAge = calculateFortuneStartAge(birthDate, gender, yearStem)
  
  // 월주를 기준으로 대운 생성
  const monthStemIndex = HEAVENLY_STEMS.indexOf(monthStem as typeof HEAVENLY_STEMS[number])
  const monthBranchIndex = EARTHLY_BRANCHES.indexOf(monthBranch as typeof EARTHLY_BRANCHES[number])
  
  const fortunes: Array<{
    startAge: number
    endAge: number
    stem: string
    branch: string
  }> = []
  
  for (let i = 0; i < 8; i++) {
    const age = fortuneStartAge + (i * 10)
    
    // 순행/역행에 따라 천간지지 계산
    const stemOffset = isForward ? i + 1 : -(i + 1)
    const branchOffset = isForward ? i + 1 : -(i + 1)
    
    // 60갑자 순환
    const stemIdx = ((monthStemIndex + stemOffset) % 10 + 10) % 10
    const branchIdx = ((monthBranchIndex + branchOffset) % 12 + 12) % 12
    
    fortunes.push({
      startAge: age,
      endAge: age + 9,
      stem: HEAVENLY_STEMS[stemIdx],
      branch: EARTHLY_BRANCHES[branchIdx]
    })
  }
  
  return { fortuneStartAge, fortunes }
}
