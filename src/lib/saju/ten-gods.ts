// 십성(十星) 계산 로직

// 오행 매핑
const STEM_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

// 음양 매핑
const STEM_TO_YINYANG: Record<string, string> = {
  '甲': '양', '乙': '음',
  '丙': '양', '丁': '음',
  '戊': '양', '己': '음',
  '庚': '양', '辛': '음',
  '壬': '양', '癸': '음'
}

// 오행 상생상극 관계
const ELEMENT_RELATIONS: Record<string, Record<string, string>> = {
  '木': { '木': '비겁', '火': '식상', '土': '재성', '金': '관성', '水': '인성' },
  '火': { '火': '비겁', '土': '식상', '金': '재성', '水': '관성', '木': '인성' },
  '土': { '土': '비겁', '金': '식상', '水': '재성', '木': '관성', '火': '인성' },
  '金': { '金': '비겁', '水': '식상', '木': '재성', '火': '관성', '土': '인성' },
  '水': { '水': '비겁', '木': '식상', '火': '재성', '土': '관성', '金': '인성' }
}

// 십성 계산 함수
export function calculateTenGod(dayStem: string, targetStem: string): string {
  const dayElement = STEM_TO_ELEMENT[dayStem]
  const targetElement = STEM_TO_ELEMENT[targetStem]
  const dayYinYang = STEM_TO_YINYANG[dayStem]
  const targetYinYang = STEM_TO_YINYANG[targetStem]
  
  const relation = ELEMENT_RELATIONS[dayElement][targetElement]
  const isSameYinYang = dayYinYang === targetYinYang
  
  // 십성 결정
  switch (relation) {
    case '비겁':
      return isSameYinYang ? '비견' : '겁재'
    case '식상':
      return isSameYinYang ? '식신' : '상관'
    case '재성':
      return isSameYinYang ? '편재' : '정재'
    case '관성':
      return isSameYinYang ? '편관' : '정관'
    case '인성':
      return isSameYinYang ? '편인' : '정인'
    default:
      return ''
  }
}

// 사주의 모든 천간과 지지에 대한 십성 계산
export function calculateAllTenGods(saju: {
  year?: { stem: string; branch: string }
  month?: { stem: string; branch: string }
  day: { stem: string; branch: string }
  hour?: { stem: string; branch: string }
}): {
  yearStem?: string
  yearBranch?: string
  monthStem?: string
  monthBranch?: string
  dayBranch: string
  hourStem?: string
  hourBranch?: string
} {
  const dayStem = saju.day.stem
  const result: {
    yearStem?: string
    yearBranch?: string
    monthStem?: string
    monthBranch?: string
    dayBranch: string
    hourStem?: string
    hourBranch?: string
  } = {
    dayBranch: calculateBranchTenGod(dayStem, saju.day.branch)
  }
  
  if (saju.year) {
    result.yearStem = calculateTenGod(dayStem, saju.year.stem)
    result.yearBranch = calculateBranchTenGod(dayStem, saju.year.branch)
  }
  if (saju.month) {
    result.monthStem = calculateTenGod(dayStem, saju.month.stem)
    result.monthBranch = calculateBranchTenGod(dayStem, saju.month.branch)
  }
  if (saju.hour) {
    result.hourStem = calculateTenGod(dayStem, saju.hour.stem)
    result.hourBranch = calculateBranchTenGod(dayStem, saju.hour.branch)
  }
  
  return result
}

// 지지 장간의 십성 계산 - 정간(본기)만 사용
const BRANCH_MAIN_STEMS: Record<string, string> = {
  '子': '癸',  // 계수
  '丑': '己',  // 기토
  '寅': '甲',  // 갑목
  '卯': '乙',  // 을목
  '辰': '戊',  // 무토
  '巳': '丙',  // 병화
  '午': '丁',  // 정화
  '未': '己',  // 기토
  '申': '庚',  // 경금
  '酉': '辛',  // 신금
  '戌': '戊',  // 무토
  '亥': '壬'   // 임수
}

// 지지의 정간 십성 계산
export function calculateBranchTenGod(dayStem: string, branch: string): string {
  const mainStem = BRANCH_MAIN_STEMS[branch]
  if (!mainStem) return ''
  return calculateTenGod(dayStem, mainStem)
}

// 십성별 특성 설명
export const TEN_GOD_DESCRIPTIONS: Record<string, string> = {
  '비견': '동료, 경쟁자, 형제',
  '겁재': '욕심, 투쟁, 야망',
  '식신': '재능, 표현, 자식',
  '상관': '반항, 창의, 개성',
  '정재': '안정적 재물, 월급',
  '편재': '투자, 사업, 큰 재물',
  '정관': '명예, 직장, 규칙',
  '편관': '권력, 도전, 변화',
  '정인': '학문, 어머니, 전통',
  '편인': '예술, 종교, 특수재능'
}