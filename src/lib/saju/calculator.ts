/* eslint-disable @typescript-eslint/no-explicit-any */
// 통합 만세력 계산 모듈

import type { Person } from '@prisma/client'
import solarTermsData from './solar-terms-data.json'
import { checkSolarTermBoundary, checkSummerTime } from './solar-terms'
import { calculateAllTenGods } from './ten-gods'
import { calculateFortunes } from './major-fortune'
import { calculateShinsal } from './shinsal'
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from './constants'

// ===== 상수 정의 =====
// moved to constants.ts

// 시간별 지지 매핑
const TIME_TO_BRANCH: Record<number, string> = {
  23: '子', 0: '子',   // 자시 (23:00 - 01:00)
  1: '丑', 2: '丑',    // 축시 (01:00 - 03:00)
  3: '寅', 4: '寅',    // 인시 (03:00 - 05:00)
  5: '卯', 6: '卯',    // 묘시 (05:00 - 07:00)
  7: '辰', 8: '辰',    // 진시 (07:00 - 09:00)
  9: '巳', 10: '巳',   // 사시 (09:00 - 11:00)
  11: '午', 12: '午',  // 오시 (11:00 - 13:00)
  13: '未', 14: '未',  // 미시 (13:00 - 15:00)
  15: '申', 16: '申',  // 신시 (15:00 - 17:00)
  17: '酉', 18: '酉',  // 유시 (17:00 - 19:00)
  19: '戌', 20: '戌',  // 술시 (19:00 - 21:00)
  21: '亥', 22: '亥'   // 해시 (21:00 - 23:00)
}

// ===== 기본 사주 계산 함수 =====

// 연주 계산 (입춘 기준)
function calculateYearPillar(birthDate: Date): { stem: string; branch: string } {
  const year = birthDate.getFullYear()
  const yearData = (solarTermsData as any)[year]
  
  let actualYear = year
  
  // 입춘 확인
  if (yearData && yearData['입춘']) {
    const ipchunDate = new Date(yearData['입춘'])
    if (birthDate < ipchunDate) {
      actualYear = year - 1 // 입춘 전이면 전년도
    }
  } else {
    // 절기 데이터 없으면 대략 2월 4일 기준
    const month = birthDate.getMonth() + 1
    const day = birthDate.getDate()
    if (month === 1 || (month === 2 && day < 4)) {
      actualYear = year - 1
    }
  }
  
  // 육십갑자 계산
  const index = ((actualYear - 4) % 60 + 60) % 60
  const stemIndex = index % 10
  const branchIndex = index % 12
  
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  }
}

// 월주 계산 (절기 기준)
function calculateMonthPillar(birthDate: Date, yearStem: string): { stem: string; branch: string } {
  const year = birthDate.getFullYear()
  const yearData = (solarTermsData as any)[year]
  
  // 절기별 월지지
  const TERM_TO_BRANCH: { [key: string]: string } = {
    '입춘': '寅', '우수': '寅',
    '경칩': '卯', '춘분': '卯',
    '청명': '辰', '곡우': '辰',
    '입하': '巳', '소만': '巳',
    '망종': '午', '하지': '午',
    '소서': '未', '대서': '未',
    '입추': '申', '처서': '申',
    '백로': '酉', '추분': '酉',
    '한로': '戌', '상강': '戌',
    '입동': '亥', '소설': '亥',
    '대설': '子', '동지': '子',
    '소한': '丑', '대한': '丑'
  }
  
  const SOLAR_TERMS_ORDER = [
    '입춘', '우수', '경칩', '춘분', '청명', '곡우',
    '입하', '소만', '망종', '하지', '소서', '대서',
    '입추', '처서', '백로', '추분', '한로', '상강',
    '입동', '소설', '대설', '동지', '소한', '대한'
  ]
  
  let currentBranch = ''
  
  // 1월 초는 전년도 절기도 확인
  if (birthDate.getMonth() === 0) {
    const prevYearData = (solarTermsData as any)[year - 1]
    if (prevYearData) {
      // 전년도 대설, 동지 확인
      if (prevYearData['동지']) {
        const dongjiDate = new Date(prevYearData['동지'])
        if (birthDate >= dongjiDate) {
          currentBranch = '子'
        }
      }
      if (prevYearData['소한']) {
        const sohanDate = new Date(prevYearData['소한'])
        if (birthDate >= sohanDate) {
          currentBranch = '丑'
        }
      }
    }
  }
  
  // 현재 년도 절기 확인
  if (yearData) {
    for (const term of SOLAR_TERMS_ORDER) {
      if (yearData[term]) {
        const termDate = new Date(yearData[term])
        if (birthDate >= termDate) {
          currentBranch = TERM_TO_BRANCH[term]
        } else {
          break
        }
      }
    }
  }
  
  // 절기 데이터 없으면 대략적 계산
  if (!currentBranch) {
    const month = birthDate.getMonth() + 1
    const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
    currentBranch = monthBranches[(month + 10) % 12] // 대략적 매핑
  }
  
  // 월천간 계산 (년간 기준)
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem as typeof HEAVENLY_STEMS[number])
  const inMonthStems = ['丙', '戊', '庚', '壬', '甲'] // 甲己→丙寅, 乙庚→戊寅...
  const monthStartStemIndex = HEAVENLY_STEMS.indexOf(inMonthStems[yearStemIndex % 5] as typeof HEAVENLY_STEMS[number])
  
  const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
  const currentMonthIndex = monthBranches.indexOf(currentBranch)
  const monthsFromIn = (currentMonthIndex + 12) % 12
  
  const monthStemIndex = (monthStartStemIndex + monthsFromIn) % 10
  
  return {
    stem: HEAVENLY_STEMS[monthStemIndex],
    branch: currentBranch
  }
}

// 일주 계산
function calculateDayPillar(birthDate: Date): { stem: string; branch: string } {
  // 기준일: 1900년 1월 1일 = 甲戌
  const baseDate = new Date('1900-01-01')
  const baseStemIndex = 0 // 甲
  const baseBranchIndex = 10 // 戌
  
  // 일수 차이 계산
  const diffTime = birthDate.getTime() - baseDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // 육십갑자 순환
  const stemIndex = (baseStemIndex + diffDays) % 10
  const branchIndex = (baseBranchIndex + diffDays) % 12
  
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  }
}

// 시주 계산
function calculateHourPillar(
  dayStem: string,
  hour: number
): { stem: string; branch: string } {
  const hourBranch = TIME_TO_BRANCH[hour]
  const hourBranchIndex = EARTHLY_BRANCHES.indexOf(hourBranch as typeof EARTHLY_BRANCHES[number])
  
  // 일간에 따른 시간 천간
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem as typeof HEAVENLY_STEMS[number])
  const startStemIndex = (dayStemIndex % 5) * 2
  const hourStemIndex = (startStemIndex + hourBranchIndex) % 10
  
  return {
    stem: HEAVENLY_STEMS[hourStemIndex],
    branch: hourBranch
  }
}

// ===== 대운 계산 함수 =====


// ===== 메인 계산 함수 =====

// 메인 계산 함수 - 직접 구현한 정확한 사주 계산
export function calculateSaju(
  name: string,
  birthDate: Date,
  birthTime: string | undefined,
  gender: '남' | '여',
  memo?: string
): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
  // 사주 계산 (절기 데이터 기반 정확한 계산)
  const yearPillar = calculateYearPillar(birthDate)
  const monthPillar = calculateMonthPillar(birthDate, yearPillar.stem)
  const dayPillar = calculateDayPillar(birthDate)
  
  // 시주 계산
  let hourPillar = undefined
  if (birthTime) {
    const [hour] = birthTime.split(':').map(Number)
    hourPillar = calculateHourPillar(dayPillar.stem, hour)
  }
  
  // 대운 계산
  const { fortuneStartAge, fortunes } = calculateFortunes(
    gender, 
    yearPillar.stem,
    monthPillar.stem,
    monthPillar.branch,
    birthDate
  )
  
  // 엣지케이스 체크
  const warnings: string[] = []
  let reliability: '확실' | '확인필요' = '확실'
  
  // 절기 경계 체크
  const solarTermCheck = checkSolarTermBoundary(birthDate)
  if (solarTermCheck.isNearBoundary) {
    warnings.push(`절기 경계 근처 출생 (${solarTermCheck.nearestTerm} ±${solarTermCheck.hoursFromBoundary?.toFixed(1)}시간)`)
    reliability = '확인필요'
  }
  
  // 서머타임 체크
  if (checkSummerTime(birthDate)) {
    warnings.push('서머타임 기간 출생 (시간 확인 필요)')
    reliability = '확인필요'
  }
  
  // 자시 경계 체크
  if (birthTime) {
    const [hour] = birthTime.split(':').map(Number)
    if (hour === 23 || hour === 0) {
      warnings.push('자시 경계 출생 (초자시/정자시 구분 필요)')
      reliability = '확인필요'
    }
  }
  
  // 출생시간 미입력
  if (!birthTime) {
    warnings.push('출생시간 미입력')
    reliability = '확인필요'
  }
  
  // 십성 계산
  const tenGods = calculateAllTenGods({
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar
  })
  
  // 신살 계산 - 시주가 없는 경우 처리
  const shinsalPillars: { stem: string; branch: string }[] = []
  
  if (yearPillar) shinsalPillars.push(yearPillar)
  if (monthPillar) shinsalPillars.push(monthPillar)
  shinsalPillars.push(dayPillar) // 일주는 항상 존재
  if (hourPillar && hourPillar.stem && hourPillar.branch) {
    shinsalPillars.push(hourPillar)
  }
  
  const shinsal = shinsalPillars.length >= 3 ? calculateShinsal(shinsalPillars) : undefined
  
  return {
    name,
    birthDate,
    birthTime: birthTime || null,
    isBirthTimeUnknown: !birthTime,
    isLunar: false,
    gender,
    memo: memo || null,
    saju: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    },
    tenGods,
    shinsal: shinsal ? JSON.parse(JSON.stringify(shinsal)) : null,
    fortuneStartAge,
    fortunes,
    reliability,
    warnings: warnings.length > 0 ? warnings : []
  }
}

// Export for backward compatibility
export { HEAVENLY_STEMS, EARTHLY_BRANCHES }
