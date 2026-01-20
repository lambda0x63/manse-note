// 천간 합충(合沖) - 천간간의 합과 충
// 출처: 《淵海子平》권3 천간작용편, 《三命通會》권1 천간상극론

// 천간오합 (天干五合) - 천간간의 합
export const CHEONGAN_HAP: Array<[string, string, string]> = [
  ['甲', '己', '土'], // 갑기 합토
  ['乙', '庚', '金'], // 을경 합금
  ['丙', '辛', '水'], // 병신 합수
  ['丁', '壬', '木'], // 정임 합목
  ['戊', '癸', '火']  // 무계 합화
]

// 천간충 (天干沖) - 천간간의 충
// 戊己土는 중앙이므로 충 없음
export const CHEONGAN_CHUNG: Array<[string, string]> = [
  ['甲', '庚'], // 갑경충 (양목-양금)
  ['乙', '辛'], // 을신충 (음목-음금)
  ['丙', '壬'], // 병임충 (양화-양수)
  ['丁', '癸']  // 정계충 (음화-음수)
]

// 천간 합 체크 함수
export function checkCheonganHap(stem1: string, stem2: string): string | null {
  for (const [s1, s2, element] of CHEONGAN_HAP) {
    if ((stem1 === s1 && stem2 === s2) || 
        (stem1 === s2 && stem2 === s1)) {
      return `${s1}${s2}합${element}`
    }
  }
  return null
}

// 천간 충 체크 함수
export function checkCheonganChung(stem1: string, stem2: string): boolean {
  for (const [s1, s2] of CHEONGAN_CHUNG) {
    if ((stem1 === s1 && stem2 === s2) || 
        (stem1 === s2 && stem2 === s1)) {
      return true
    }
  }
  return false
}

// 원국 내 모든 천간 합충 찾기
export function findCheonganHapchungInSaju(stems: string[]): {
  hap: string[]
  chung: string[]
} {
  const hap: string[] = []
  const chung: string[] = []
  
  // 모든 천간 쌍 체크
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const hapResult = checkCheonganHap(stems[i], stems[j])
      if (hapResult) {
        hap.push(hapResult)
      }
      
      if (checkCheonganChung(stems[i], stems[j])) {
        chung.push(`${stems[i]}${stems[j]}충`)
      }
    }
  }
  
  return { hap, chung }
}