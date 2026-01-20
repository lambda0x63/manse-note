// 합충(合沖) - 지지간의 합과 충
// 출처: 《淵海子平》 고전 명리학 

// 육합 (六合) - 지지간의 합
export const YUKHAP: Array<[string, string, string]> = [
  ['子', '丑', '土'], // 자축 합토
  ['寅', '亥', '木'], // 인해 합목
  ['卯', '戌', '火'], // 묘술 합화
  ['辰', '酉', '金'], // 진유 합금
  ['巳', '申', '水'], // 사신 합수
  ['午', '未', '土']  // 오미 합토
]

// 육충 (六沖) - 지지간의 충
export const YUKCHUNG: Array<[string, string]> = [
  ['子', '午'], // 자오충 (수-화)
  ['丑', '未'], // 축미충 (토-토)
  ['寅', '申'], // 인신충 (목-금)
  ['卯', '酉'], // 묘유충 (목-금)
  ['辰', '戌'], // 진술충 (토-토)
  ['巳', '亥']  // 사해충 (화-수)
]

// 삼합 (三合) - 세 지지의 합 (방합)
export const SAMHAP: Array<[string, string, string, string]> = [
  ['申', '子', '辰', '水'], // 신자진 수국
  ['亥', '卯', '未', '木'], // 해묘미 목국
  ['寅', '午', '戌', '火'], // 인오술 화국
  ['巳', '酉', '丑', '金']  // 사유축 금국
]

// 합 체크 함수
export function checkYukhap(branch1: string, branch2: string): string | null {
  for (const [b1, b2, element] of YUKHAP) {
    if ((branch1 === b1 && branch2 === b2) || 
        (branch1 === b2 && branch2 === b1)) {
      return `${b1}${b2}합${element}`
    }
  }
  return null
}

// 충 체크 함수
export function checkYukchung(branch1: string, branch2: string): boolean {
  for (const [b1, b2] of YUKCHUNG) {
    if ((branch1 === b1 && branch2 === b2) || 
        (branch1 === b2 && branch2 === b1)) {
      return true
    }
  }
  return false
}

// 원국 내 모든 합충 찾기
export function findHapchungInSaju(branches: string[]): {
  hap: string[]
  chung: string[]
} {
  const hap: string[] = []
  const chung: string[] = []
  
  // 모든 지지 쌍 체크
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const hapResult = checkYukhap(branches[i], branches[j])
      if (hapResult) {
        hap.push(hapResult)
      }
      
      if (checkYukchung(branches[i], branches[j])) {
        chung.push(`${branches[i]}${branches[j]}충`)
      }
    }
  }
  
  return { hap, chung }
}

// 삼합 체크 (세 지지가 모두 있는지)
export function checkSamhap(branches: string[]): string[] {
  const samhapResults: string[] = []
  
  for (const [b1, b2, b3, element] of SAMHAP) {
    if (branches.includes(b1) && 
        branches.includes(b2) && 
        branches.includes(b3)) {
      samhapResults.push(`${b1}${b2}${b3} ${element}국`)
    }
  }
  
  return samhapResults
}