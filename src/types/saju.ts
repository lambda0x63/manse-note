import type { ShinsalResult } from '@/lib/saju/shinsal'

// 사주 타입 정의
export interface SajuData {
  year: { stem: string; branch: string }
  month: { stem: string; branch: string }
  day: { stem: string; branch: string }
  hour?: { stem: string; branch: string }
}

export interface Fortune {
  startAge: number
  endAge: number
  stem: string
  branch: string
}

// Prisma Person 타입 확장
export interface PersonWithSaju {
  id: string
  name: string
  birthDate: Date
  birthTime: string | null
  isBirthTimeUnknown: boolean
  isLunar: boolean
  gender: string
  memo: string | null
  saju: SajuData
  tenGods?: {
    yearStem?: string
    yearBranch?: string
    monthStem?: string
    monthBranch?: string
    dayBranch?: string
    hourStem?: string
    hourBranch?: string
  }
  shinsal?: ShinsalResult
  fortuneStartAge: number
  fortunes: Fortune[]
  reliability: string
  warnings: string[]
  createdAt: Date
  updatedAt: Date
}