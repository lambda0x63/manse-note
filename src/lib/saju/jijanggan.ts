// 지장간(藏干) - 지지 속에 숨어있는 천간
// 출처: 《淵海子平》, 《三命通會》 고전 명리학

// 지장간 데이터 (본기-중기-여기 순서)
export const JIJANGGAN: Record<string, string[]> = {
  '子': ['癸'],           // 자: 계수 100%
  '丑': ['己', '癸', '辛'], // 축: 기토 60%, 계수 30%, 신금 10%
  '寅': ['甲', '丙', '戊'], // 인: 갑목 60%, 병화 30%, 무토 10%
  '卯': ['乙'],           // 묘: 을목 100%
  '辰': ['戊', '乙', '癸'], // 진: 무토 60%, 을목 30%, 계수 10%
  '巳': ['丙', '庚', '戊'], // 사: 병화 60%, 경금 30%, 무토 10%
  '午': ['丁', '己'],      // 오: 정화 70%, 기토 30%
  '未': ['己', '丁', '乙'], // 미: 기토 60%, 정화 30%, 을목 10%
  '申': ['庚', '壬', '戊'], // 신: 경금 60%, 임수 30%, 무토 10%
  '酉': ['辛'],           // 유: 신금 100%
  '戌': ['戊', '辛', '丁'], // 술: 무토 60%, 신금 30%, 정화 10%
  '亥': ['壬', '甲']       // 해: 임수 70%, 갑목 30%
}

// 지지에서 지장간 가져오기
export function getJijanggan(branch: string): string[] {
  return JIJANGGAN[branch] || []
}

// 지장간 분류 (본기/중기/여기)
export function classifyJijanggan(branch: string): {
  본기?: string
  중기?: string
  여기?: string
} {
  const jijanggan = getJijanggan(branch)
  
  return {
    본기: jijanggan[0],
    중기: jijanggan[1],
    여기: jijanggan[2]
  }
}

// 지장간의 십신 계산
export function calculateJijangganTenGods(
  dayStem: string,
  branch: string,
  calculateTenGod: (dayStem: string, targetStem: string) => string
): string[] {
  const jijanggan = getJijanggan(branch)
  return jijanggan.map(stem => calculateTenGod(dayStem, stem))
}