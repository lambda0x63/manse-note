/**
 * 신살(神殺) 계산 모듈 - 10대 핵심 신살
 */

export interface Shinsal {
  name: string;           // 신살명
  nameHanja: string;      // 한자명
  position: string[];     // 위치 (어느 柱에 있는지)
  description: string;    // 설명
  category: string;       // 분류
  count?: number;         // 개수
}

export interface ShinsalResult {
  // 10대 핵심 신살
  yangin?: Shinsal;          // 양인살 - 극단적 성격
  dohwa?: Shinsal;           // 도화살 - 이성운, 매력
  yeokma?: Shinsal;          // 역마살 - 이동, 변화
  hwagae?: Shinsal;          // 화개살 - 예술, 종교, 학문
  gwimoon?: Shinsal;         // 귀문관살 - 어려움, 장애
  baekho?: Shinsal;          // 백호대살 - 사고, 수술
  gwaegang?: Shinsal;        // 괴강살 - 독립적, 카리스마
  hongnyeom?: Shinsal;       // 홍염살 - 열정, 화려함
  geupgak?: Shinsal;         // 급각살 - 급진적 변화
  wonjin?: Shinsal;          // 원진살 - 갈등, 불화
  
  // 전체 목록
  all: Shinsal[];
}

// 1. 역마살 (驛馬殺) - 이동, 변화
const YEOKMA_TABLE: Record<string, string> = {
  '寅': '申', '午': '申', '戌': '申',  // 인오술 → 신
  '申': '寅', '子': '寅', '辰': '寅',  // 신자진 → 인
  '巳': '亥', '酉': '亥', '丑': '亥',  // 사유축 → 해
  '亥': '巳', '卯': '巳', '未': '巳'   // 해묘미 → 사
};

// 2. 도화살 (桃花殺) - 이성, 매력
const DOHWA_TABLE: Record<string, string> = {
  '寅': '卯', '午': '卯', '戌': '卯',  // 인오술 → 묘
  '申': '酉', '子': '酉', '辰': '酉',  // 신자진 → 유
  '巳': '午', '酉': '午', '丑': '午',  // 사유축 → 오
  '亥': '子', '卯': '子', '未': '子'   // 해묘미 → 자
};

// 3. 화개살 (華蓋殺) - 예술, 종교, 학문
const HWAGAE_TABLE: Record<string, string> = {
  '寅': '戌', '午': '戌', '戌': '戌',  // 인오술 → 술
  '申': '辰', '子': '辰', '辰': '辰',  // 신자진 → 진
  '巳': '丑', '酉': '丑', '丑': '丑',  // 사유축 → 축
  '亥': '未', '卯': '未', '未': '未'   // 해묘미 → 미
};

// 4. 괴강살 (魁罡殺) - 독립적, 카리스마 (일주 기준)
const GWAEGANG_TABLE: string[] = ['庚辰', '庚戌', '壬辰', '壬戌', '戊戌'];

// 4. 귀문관살 (鬼門關殺) - 일주 기준
const GWIMOON_TABLE: Record<string, string> = {
  '甲': '戌', '乙': '戌', '丙': '丑', '丁': '丑', '戊': '丑',
  '己': '丑', '庚': '辰', '辛': '辰', '壬': '未', '癸': '未'
};

// 5. 양인살 (羊刃殺) - 강함, 극단
const YANGIN_TABLE: Record<string, string> = {
  '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午',
  '己': '巳', '庚': '酉', '辛': '申', '壬': '子', '癸': '亥'
};

// 6. 백호대살 (白虎大殺) - 일주 기준
const BAEKHO_TABLE: Record<string, string> = {
  '甲子': '戌', '乙丑': '辰', '丙寅': '午', '丁卯': '未',
  '戊辰': '寅', '己巳': '酉', '庚午': '戌', '辛未': '卯',
  '壬申': '午', '癸酉': '未', '甲戌': '申', '乙亥': '巳',
  '丙子': '午', '丁丑': '未', '戊寅': '子', '己卯': '酉',
  '庚辰': '戌', '辛巳': '卯', '壬午': '子', '癸未': '酉',
  '甲申': '午', '乙酉': '未', '丙戌': '寅', '丁亥': '巳',
  '戊子': '午', '己丑': '未', '庚寅': '申', '辛卯': '巳',
  '壬辰': '子', '癸巳': '酉', '甲午': '戌', '乙未': '卯',
  '丙申': '午', '丁酉': '未', '戊戌': '寅', '己亥': '酉',
  '庚子': '戌', '辛丑': '卯', '壬寅': '申', '癸卯': '巳',
  '甲辰': '子', '乙巳': '酉', '丙午': '戌', '丁未': '卯',
  '戊申': '午', '己酉': '未', '庚戌': '申', '辛亥': '巳',
  '壬子': '午', '癸丑': '未', '甲寅': '申', '乙卯': '巳',
  '丙辰': '子', '丁巳': '酉', '戊午': '戌', '己未': '卯',
  '庚申': '午', '辛酉': '未', '壬戌': '寅', '癸亥': '酉'
};

// 7. 홍염살 (紅艶殺) - 열정, 화려함
const HONGNYEOM_TABLE: Record<string, string> = {
  '甲': '午', '乙': '申', '丙': '寅', '丁': '未', '戊': '辰',
  '己': '辰', '庚': '戌', '辛': '酉', '壬': '子', '癸': '申'
};

// 8. 급각살 (急脚殺) - 급진적 변화 (일주 기준)
const GEUPGAK_TABLE: string[] = ['甲子', '甲午', '戊辰', '戊戌', '庚辰', '庚戌'];

// 9. 원진살 (元嗔殺) - 서로 미워함
const WONJIN_TABLE: Record<string, string> = {
  '子': '酉', '酉': '子',
  '丑': '戌', '戌': '丑',
  '寅': '亥', '亥': '寅',
  '卯': '申', '申': '卯',
  '辰': '巳', '巳': '辰',
  '午': '未', '未': '午'
};

/**
 * 지지 기반 신살 계산 (역마, 도화, 화개)
 * 년지와 일지 모두를 기준으로 체크
 */
function calculateBranchBasedShinsal(
  fourPillars: { stem: string; branch: string }[]
): Partial<ShinsalResult> {
  const result: Partial<ShinsalResult> = {};
  const yearBranch = fourPillars[0].branch;
  const dayBranch = fourPillars[2].branch;
  const branches = fourPillars.map(p => p.branch);
  
  // 역마살 체크 (년지 또는 일지 기준)
  const yeokmaPositions: string[] = [];
  branches.forEach((branch, idx) => {
    // 년지 기준 체크
    if (YEOKMA_TABLE[yearBranch] === branch) {
      yeokmaPositions.push(['년', '월', '일', '시'][idx]);
    }
    // 일지 기준 체크
    if (YEOKMA_TABLE[dayBranch] === branch && !yeokmaPositions.includes(['년', '월', '일', '시'][idx])) {
      yeokmaPositions.push(['년', '월', '일', '시'][idx]);
    }
  });
  
  if (yeokmaPositions.length > 0) {
    result.yeokma = {
      name: '역마살',
      nameHanja: '驛馬殺',
      position: yeokmaPositions,
      description: '이동, 변화, 출장이 많음',
      category: '이동'
    };
  }
  
  // 도화살 체크 (년지 또는 일지 기준)
  const dohwaPositions: string[] = [];
  branches.forEach((branch, idx) => {
    // 년지 기준 체크
    if (DOHWA_TABLE[yearBranch] === branch) {
      dohwaPositions.push(['년', '월', '일', '시'][idx]);
    }
    // 일지 기준 체크
    if (DOHWA_TABLE[dayBranch] === branch && !dohwaPositions.includes(['년', '월', '일', '시'][idx])) {
      dohwaPositions.push(['년', '월', '일', '시'][idx]);
    }
  });
  
  if (dohwaPositions.length > 0) {
    result.dohwa = {
      name: '도화살',
      nameHanja: '桃花殺',
      position: dohwaPositions,
      description: '매력, 인기, 이성운',
      category: '인연'
    };
  }
  
  // 화개살 체크 (년지 또는 일지 기준)
  const hwagaePositions: string[] = [];
  branches.forEach((branch, idx) => {
    // 년지 기준 체크
    if (HWAGAE_TABLE[yearBranch] === branch) {
      hwagaePositions.push(['년', '월', '일', '시'][idx]);
    }
    // 일지 기준 체크
    if (HWAGAE_TABLE[dayBranch] === branch && !hwagaePositions.includes(['년', '월', '일', '시'][idx])) {
      hwagaePositions.push(['년', '월', '일', '시'][idx]);
    }
  });
  
  if (hwagaePositions.length > 0) {
    result.hwagae = {
      name: '화개살',
      nameHanja: '華蓋殺',
      position: hwagaePositions,
      description: '예술, 종교, 학문적 재능',
      category: '재능'
    };
  }
  
  return result;
}

/**
 * 일주 기반 신살 계산
 */
function calculateDayPillarBasedShinsal(
  fourPillars: { stem: string; branch: string }[]
): Partial<ShinsalResult> {
  const result: Partial<ShinsalResult> = {};
  const dayPillar = fourPillars[2];
  const dayStem = dayPillar.stem;
  const dayPillarStr = dayStem + dayPillar.branch;
  const branches = fourPillars.map(p => p.branch);
  
  // 괴강살 체크 (일주만)
  if (GWAEGANG_TABLE.includes(dayPillarStr)) {
    result.gwaegang = {
      name: '괴강살',
      nameHanja: '魁罡殺',
      position: ['일주'],
      description: '독립적, 카리스마, 리더십',
      category: '성격'
    };
  }
  
  // 급각살 체크 (일주만)
  if (GEUPGAK_TABLE.includes(dayPillarStr)) {
    result.geupgak = {
      name: '급각살',
      nameHanja: '急脚殺',
      position: ['일주'],
      description: '급진적 변화, 빠른 전개',
      category: '변화'
    };
  }
  
  // 귀문관살 체크
  const gwimoonBranch = GWIMOON_TABLE[dayStem];
  const gwimoonPositions: string[] = [];
  branches.forEach((branch, idx) => {
    if (branch === gwimoonBranch) {
      gwimoonPositions.push(['년', '월', '일', '시'][idx]);
    }
  });
  
  if (gwimoonPositions.length > 0) {
    result.gwimoon = {
      name: '귀문관살',
      nameHanja: '鬼門關殺',
      position: gwimoonPositions,
      description: '어려움, 장애, 고난',
      category: '장애'
    };
  }
  
  // 백호대살 체크
  const baekhoBranch = BAEKHO_TABLE[dayPillarStr];
  if (baekhoBranch) {
    const baekhoPositions: string[] = [];
    branches.forEach((branch, idx) => {
      if (branch === baekhoBranch) {
        baekhoPositions.push(['년', '월', '일', '시'][idx]);
      }
    });
    
    if (baekhoPositions.length > 0) {
      result.baekho = {
        name: '백호대살',
        nameHanja: '白虎大殺',
        position: baekhoPositions,
        description: '사고, 수술, 급변',
        category: '사고'
      };
    }
  }
  
  return result;
}

/**
 * 천간 기반 신살 계산 (양인살, 홍염살)
 */
function calculateStemBasedShinsal(
  fourPillars: { stem: string; branch: string }[]
): Partial<ShinsalResult> {
  const result: Partial<ShinsalResult> = {};
  const dayStem = fourPillars[2].stem;
  const branches = fourPillars.map(p => p.branch);
  
  // 양인살 체크
  const yanginBranch = YANGIN_TABLE[dayStem];
  const yanginPositions: string[] = [];
  branches.forEach((branch, idx) => {
    if (branch === yanginBranch) {
      yanginPositions.push(['년', '월', '일', '시'][idx]);
    }
  });
  
  if (yanginPositions.length > 0) {
    result.yangin = {
      name: '양인살',
      nameHanja: '羊刃殺',
      position: yanginPositions,
      description: '극단적, 강인함, 승부욕',
      category: '성격'
    };
  }
  
  // 홍염살 체크
  const hongnyeomBranch = HONGNYEOM_TABLE[dayStem];
  const hongnyeomPositions: string[] = [];
  branches.forEach((branch, idx) => {
    if (branch === hongnyeomBranch) {
      hongnyeomPositions.push(['년', '월', '일', '시'][idx]);
    }
  });
  
  if (hongnyeomPositions.length > 0) {
    result.hongnyeom = {
      name: '홍염살',
      nameHanja: '紅艶殺',
      position: hongnyeomPositions,
      description: '열정, 화려함, 이성적 매력',
      category: '매력'
    };
  }
  
  return result;
}


/**
 * 원진살 계산 (지지 간 관계)
 */
function calculateWonjinShinsal(
  fourPillars: { stem: string; branch: string }[]
): Partial<ShinsalResult> {
  const result: Partial<ShinsalResult> = {};
  const branches = fourPillars.map(p => p.branch);
  const wonjinPairs: string[] = [];
  
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (WONJIN_TABLE[branches[i]] === branches[j]) {
        const pos1 = ['년', '월', '일', '시'][i];
        const pos2 = ['년', '월', '일', '시'][j];
        wonjinPairs.push(`${pos1}-${pos2}`);
      }
    }
  }
  
  if (wonjinPairs.length > 0) {
    result.wonjin = {
      name: '원진살',
      nameHanja: '元嗔殺',
      position: wonjinPairs,
      description: '갈등, 불화, 대립',
      category: '관계'
    };
  }
  
  return result;
}

/**
 * 사주에서 10대 신살 계산
 */
export function calculateShinsal(
  fourPillars: { stem: string; branch: string }[]
): ShinsalResult {
  // 각 기준별 신살 계산
  const branchShinsal = calculateBranchBasedShinsal(fourPillars);
  const dayPillarShinsal = calculateDayPillarBasedShinsal(fourPillars);
  const stemShinsal = calculateStemBasedShinsal(fourPillars);
  const wonjinShinsal = calculateWonjinShinsal(fourPillars);
  
  // 결과 통합
  const result: ShinsalResult = {
    ...branchShinsal,
    ...dayPillarShinsal,
    ...stemShinsal,
    ...wonjinShinsal,
    all: []
  };
  
  // 모든 신살 수집 (순서: 양인, 도화, 역마, 화개, 귀문관살, 백호대살, 괴강살, 홍염살, 급각살, 원진살)
  const tempShinsal: Shinsal[] = [];
  
  if (result.yangin) tempShinsal.push(result.yangin);
  if (result.dohwa) tempShinsal.push(result.dohwa);
  if (result.yeokma) tempShinsal.push(result.yeokma);
  if (result.hwagae) tempShinsal.push(result.hwagae);
  if (result.gwimoon) tempShinsal.push(result.gwimoon);
  if (result.baekho) tempShinsal.push(result.baekho);
  if (result.gwaegang) tempShinsal.push(result.gwaegang);
  if (result.hongnyeom) tempShinsal.push(result.hongnyeom);
  if (result.geupgak) tempShinsal.push(result.geupgak);
  if (result.wonjin) tempShinsal.push(result.wonjin);
  
  // count 설정
  tempShinsal.forEach(s => {
    s.count = s.position.length;
  });
  
  result.all = tempShinsal;
  
  return result;
}