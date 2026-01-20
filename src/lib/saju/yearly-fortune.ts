// 세운(歲運) 계산 로직

import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from './constants'

// 60갑자 계산
function getStemBranch(year: number): { stem: string; branch: string } {
  // 1984년이 甲子년 (60갑자 시작)
  const baseYear = 1984
  const diff = year - baseYear
  const index = ((diff % 60) + 60) % 60
  
  const stemIndex = index % 10
  const branchIndex = index % 12
  
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  }
}

// 세운 계산 (현재 년도 기준으로 앞뒤 10년)
export function calculateYearlyFortunes(currentYear: number): Array<{
  year: number
  age?: number
  stem: string
  branch: string
  isCurrent: boolean
}> {
  const yearlyFortunes = []
  
  // 현재 년도 기준 앞뒤 10년씩 계산
  for (let i = -10; i <= 10; i++) {
    const year = currentYear + i
    const { stem, branch } = getStemBranch(year)
    
    yearlyFortunes.push({
      year,
      stem,
      branch,
      isCurrent: year === currentYear
    })
  }
  
  return yearlyFortunes
}

// 특정 생년월일 기준 세운 계산 (나이 포함)
export function calculateYearlyFortunesWithAge(
  birthDate: Date,
  currentYear: number
): Array<{
  year: number
  age: number
  stem: string
  branch: string
  isCurrent: boolean
}> {
  const yearlyFortunes = []
  
  // 실제 출생년도 (입춘 기준 아님, 만 나이 계산용)
  const birthYear = birthDate.getFullYear()
  
  // 현재 년도 기준 앞뒤 10년씩 계산
  for (let i = -10; i <= 10; i++) {
    const year = currentYear + i
    
    // 만 나이 계산
    const targetDate = new Date(year, birthDate.getMonth(), birthDate.getDate())
    const yearAge = year - birthYear
    const monthDiff = targetDate.getMonth() - birthDate.getMonth()
    const dayDiff = targetDate.getDate() - birthDate.getDate()
    
    let age = yearAge
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--
    }
    
    const { stem, branch } = getStemBranch(year)
    
    yearlyFortunes.push({
      year,
      age,
      stem,
      branch,
      isCurrent: year === currentYear
    })
  }
  
  return yearlyFortunes
}
