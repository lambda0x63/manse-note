// 오행(五行) 관련 데이터 및 유틸리티

// 천간의 오행과 음양
export const STEM_WUXING = {
  '甲': { element: '木', yinyang: '양' },
  '乙': { element: '木', yinyang: '음' },
  '丙': { element: '火', yinyang: '양' },
  '丁': { element: '火', yinyang: '음' },
  '戊': { element: '土', yinyang: '양' },
  '己': { element: '土', yinyang: '음' },
  '庚': { element: '金', yinyang: '양' },
  '辛': { element: '金', yinyang: '음' },
  '壬': { element: '水', yinyang: '양' },
  '癸': { element: '水', yinyang: '음' }
} as const

// 지지의 오행과 음양
export const BRANCH_WUXING = {
  '子': { element: '水', yinyang: '양' },
  '丑': { element: '土', yinyang: '음' },
  '寅': { element: '木', yinyang: '양' },
  '卯': { element: '木', yinyang: '음' },
  '辰': { element: '土', yinyang: '양' },
  '巳': { element: '火', yinyang: '음' },
  '午': { element: '火', yinyang: '양' },
  '未': { element: '土', yinyang: '음' },
  '申': { element: '金', yinyang: '양' },
  '酉': { element: '金', yinyang: '음' },
  '戌': { element: '土', yinyang: '양' },
  '亥': { element: '水', yinyang: '음' }
} as const

// 오행별 색상 (Tailwind CSS 클래스)
export const WUXING_COLORS = {
  '木': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    rgb: 'rgb(34, 197, 94)' // green-500
  },
  '火': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    rgb: 'rgb(239, 68, 68)' // red-500
  },
  '土': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    rgb: 'rgb(234, 179, 8)' // yellow-500
  },
  '金': {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    rgb: 'rgb(107, 114, 128)' // gray-500
  },
  '水': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    rgb: 'rgb(59, 130, 246)' // blue-500
  }
} as const

// 음양별 스타일
export const YINYANG_STYLES = {
  '양': {
    fontWeight: 'font-bold',
    opacity: 'opacity-100'
  },
  '음': {
    fontWeight: 'font-medium',
    opacity: 'opacity-85'
  }
} as const

// 천간 또는 지지의 오행 정보 가져오기
export function getWuxingInfo(char: string): {
  element: '木' | '火' | '土' | '金' | '水'
  yinyang: '양' | '음'
  color: typeof WUXING_COLORS[keyof typeof WUXING_COLORS]
  style: typeof YINYANG_STYLES[keyof typeof YINYANG_STYLES]
} | null {
  const stemInfo = STEM_WUXING[char as keyof typeof STEM_WUXING]
  const branchInfo = BRANCH_WUXING[char as keyof typeof BRANCH_WUXING]
  
  const info = stemInfo || branchInfo
  
  if (!info) return null
  
  return {
    element: info.element,
    yinyang: info.yinyang,
    color: WUXING_COLORS[info.element],
    style: YINYANG_STYLES[info.yinyang]
  }
}

// 오행 한글 이름
export const WUXING_KOREAN = {
  '木': '목',
  '火': '화',
  '土': '토',
  '金': '금',
  '水': '수'
} as const

// 오행 이모지
export const WUXING_EMOJI = {
  '木': '🌳',
  '火': '🔥',
  '土': '⛰️',
  '金': '⚔️',
  '水': '💧'
} as const