// Recalculate Shinsal for all Person rows and persist to DB
// - Loads env from .env
// - Uses Prisma to fetch/update `persons.shinsal`
// - Recomputes from `persons.saju` (year/month/day[/hour]) pillars

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// Lightweight .env loader (no external deps)
function loadDotenv(envPath = '.env') {
  try {
    const full = path.resolve(envPath)
    if (!fs.existsSync(full)) return
    const raw = fs.readFileSync(full, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      if (!line || line.trim().startsWith('#')) return
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
      if (!m) return
      let [, key, val] = m
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = process.env[key] ?? val
    })
  } catch (err) {
    console.warn('[env] Failed to load .env:', err)
  }
}

loadDotenv('.env')
// Fallback to example if needed
if (!process.env.DATABASE_URL) loadDotenv('.env.example')

// Lazy import Prisma (CJS default)
let PrismaClient
try {
  // eslint-disable-next-line n/no-missing-import
  ;({ PrismaClient } = await import('@prisma/client'))
} catch (err) {
  console.error('Failed to load @prisma/client. Ensure `prisma generate` has run.')
  process.exit(1)
}

// ---- Shinsal calculation (ported to JS) ----
const YEOKMA_TABLE = { '寅': '申', '午': '申', '戌': '申', '申': '寅', '子': '寅', '辰': '寅', '巳': '亥', '酉': '亥', '丑': '亥', '亥': '巳', '卯': '巳', '未': '巳' }
const DOHWA_TABLE = { '寅': '卯', '午': '卯', '戌': '卯', '申': '酉', '子': '酉', '辰': '酉', '巳': '午', '酉': '午', '丑': '午', '亥': '子', '卯': '子', '未': '子' }
const HWAGAE_TABLE = { '寅': '戌', '午': '戌', '戌': '戌', '申': '辰', '子': '辰', '辰': '辰', '巳': '丑', '酉': '丑', '丑': '丑', '亥': '未', '卯': '未', '未': '未' }
const GWAEGANG_TABLE = ['庚辰', '庚戌', '壬辰', '壬戌', '戊戌']
const GWIMOON_TABLE = { '甲': '戌', '乙': '戌', '丙': '丑', '丁': '丑', '戊': '丑', '己': '丑', '庚': '辰', '辛': '辰', '壬': '未', '癸': '未' }
const YANGIN_TABLE = { '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午', '己': '巳', '庚': '酉', '辛': '申', '壬': '子', '癸': '亥' }
const BAEKHO_TABLE = {
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
}
const HONGNYEOM_TABLE = { '甲': '午', '乙': '申', '丙': '寅', '丁': '未', '戊': '辰', '己': '辰', '庚': '戌', '辛': '酉', '壬': '子', '癸': '申' }
const WONJIN_TABLE = { '子': '酉', '酉': '子', '丑': '戌', '戌': '丑', '寅': '亥', '亥': '寅', '卯': '申', '申': '卯', '辰': '巳', '巳': '辰', '午': '未', '未': '午' }

function calculateBranchBasedShinsal(fourPillars) {
  const result = {}
  const yearBranch = fourPillars[0].branch
  const dayBranch = fourPillars[2].branch
  const branches = fourPillars.map(p => p.branch)

  // Yeokma
  const yeokmaPositions = []
  branches.forEach((branch, idx) => {
    if (YEOKMA_TABLE[yearBranch] === branch) yeokmaPositions.push(['년', '월', '일', '시'][idx])
    if (YEOKMA_TABLE[dayBranch] === branch && !yeokmaPositions.includes(['년', '월', '일', '시'][idx]))
      yeokmaPositions.push(['년', '월', '일', '시'][idx])
  })
  if (yeokmaPositions.length > 0) {
    result.yeokma = { name: '역마살', nameHanja: '驛馬殺', position: yeokmaPositions, description: '이동, 변화, 출장이 많음', category: '이동' }
  }

  // Dohwa
  const dohwaPositions = []
  branches.forEach((branch, idx) => {
    if (DOHWA_TABLE[yearBranch] === branch) dohwaPositions.push(['년', '월', '일', '시'][idx])
    if (DOHWA_TABLE[dayBranch] === branch && !dohwaPositions.includes(['년', '월', '일', '시'][idx]))
      dohwaPositions.push(['년', '월', '일', '시'][idx])
  })
  if (dohwaPositions.length > 0) {
    result.dohwa = { name: '도화살', nameHanja: '桃花殺', position: dohwaPositions, description: '매력, 인기, 이성운', category: '인연' }
  }

  // Hwagae
  const hwagaePositions = []
  branches.forEach((branch, idx) => {
    if (HWAGAE_TABLE[yearBranch] === branch) hwagaePositions.push(['년', '월', '일', '시'][idx])
    if (HWAGAE_TABLE[dayBranch] === branch && !hwagaePositions.includes(['년', '월', '일', '시'][idx]))
      hwagaePositions.push(['년', '월', '일', '시'][idx])
  })
  if (hwagaePositions.length > 0) {
    result.hwagae = { name: '화개살', nameHanja: '華蓋殺', position: hwagaePositions, description: '예술, 종교, 학문적 재능', category: '재능' }
  }
  return result
}

function calculateDayPillarBasedShinsal(fourPillars) {
  const result = {}
  const dayPillar = fourPillars[2]
  const dayStem = dayPillar.stem
  const dayPillarStr = dayStem + dayPillar.branch
  const branches = fourPillars.map(p => p.branch)

  if (GWAEGANG_TABLE.includes(dayPillarStr)) {
    result.gwaegang = { name: '괴강살', nameHanja: '魁罡殺', position: ['일주'], description: '독립적, 카리스마, 리더십', category: '성격' }
  }
  if (['甲子', '甲午', '戊辰', '戊戌', '庚辰', '庚戌'].includes(dayPillarStr)) {
    result.geupgak = { name: '급각살', nameHanja: '急脚殺', position: ['일주'], description: '급진적 변화, 빠른 전개', category: '변화' }
  }
  const gwimoonBranch = GWIMOON_TABLE[dayStem]
  const gwimoonPositions = []
  branches.forEach((branch, idx) => { if (branch === gwimoonBranch) gwimoonPositions.push(['년', '월', '일', '시'][idx]) })
  if (gwimoonPositions.length > 0) {
    result.gwimoon = { name: '귀문관살', nameHanja: '鬼門關殺', position: gwimoonPositions, description: '어려움, 장애, 고난', category: '장애' }
  }
  const baekhoBranch = BAEKHO_TABLE[dayPillarStr]
  if (baekhoBranch) {
    const baekhoPositions = []
    branches.forEach((branch, idx) => { if (branch === baekhoBranch) baekhoPositions.push(['년', '월', '일', '시'][idx]) })
    if (baekhoPositions.length > 0) {
      result.baekho = { name: '백호대살', nameHanja: '白虎大殺', position: baekhoPositions, description: '사고, 수술, 급변', category: '사고' }
    }
  }
  return result
}

function calculateStemBasedShinsal(fourPillars) {
  const result = {}
  const dayStem = fourPillars[2].stem
  const branches = fourPillars.map(p => p.branch)
  const yanginBranch = YANGIN_TABLE[dayStem]
  const yanginPositions = []
  branches.forEach((branch, idx) => { if (branch === yanginBranch) yanginPositions.push(['년', '월', '일', '시'][idx]) })
  if (yanginPositions.length > 0) {
    result.yangin = { name: '양인살', nameHanja: '羊刃殺', position: yanginPositions, description: '극단적, 강인함, 승부욕', category: '성격' }
  }
  const hongnyeomBranch = HONGNYEOM_TABLE[dayStem]
  const hongnyeomPositions = []
  branches.forEach((branch, idx) => { if (branch === hongnyeomBranch) hongnyeomPositions.push(['년', '월', '일', '시'][idx]) })
  if (hongnyeomPositions.length > 0) {
    result.hongnyeom = { name: '홍염살', nameHanja: '紅艶殺', position: hongnyeomPositions, description: '열정, 화려함, 이성적 매력', category: '매력' }
  }
  return result
}

function calculateWonjinShinsal(fourPillars) {
  const result = {}
  const branches = fourPillars.map(p => p.branch)
  const wonjinPairs = []
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (WONJIN_TABLE[branches[i]] === branches[j]) {
        const pos1 = ['년', '월', '일', '시'][i]
        const pos2 = ['년', '월', '일', '시'][j]
        wonjinPairs.push(`${pos1}-${pos2}`)
      }
    }
  }
  if (wonjinPairs.length > 0) {
    result.wonjin = { name: '원진살', nameHanja: '元嗔殺', position: wonjinPairs, description: '갈등, 불화, 대립', category: '관계' }
  }
  return result
}

function calculateShinsal(fourPillars) {
  const branchShinsal = calculateBranchBasedShinsal(fourPillars)
  const dayPillarShinsal = calculateDayPillarBasedShinsal(fourPillars)
  const stemShinsal = calculateStemBasedShinsal(fourPillars)
  const wonjinShinsal = calculateWonjinShinsal(fourPillars)
  const result = { ...branchShinsal, ...dayPillarShinsal, ...stemShinsal, ...wonjinShinsal, all: [] }
  const temp = []
  if (result.yangin) temp.push(result.yangin)
  if (result.dohwa) temp.push(result.dohwa)
  if (result.yeokma) temp.push(result.yeokma)
  if (result.hwagae) temp.push(result.hwagae)
  if (result.gwimoon) temp.push(result.gwimoon)
  if (result.baekho) temp.push(result.baekho)
  if (result.gwaegang) temp.push(result.gwaegang)
  if (result.hongnyeom) temp.push(result.hongnyeom)
  if (result.geupgak) temp.push(result.geupgak)
  if (result.wonjin) temp.push(result.wonjin)
  temp.forEach((s) => { s.count = s.position.length })
  result.all = temp
  return result
}

function normalizePillarsFromSaju(saju) {
  if (!saju || typeof saju !== 'object') return null
  const pillars = []
  if (saju.year && saju.year.stem && saju.year.branch) pillars.push({ stem: saju.year.stem, branch: saju.year.branch })
  if (saju.month && saju.month.stem && saju.month.branch) pillars.push({ stem: saju.month.stem, branch: saju.month.branch })
  if (saju.day && saju.day.stem && saju.day.branch) pillars.push({ stem: saju.day.stem, branch: saju.day.branch })
  if (saju.hour && saju.hour.stem && saju.hour.branch) pillars.push({ stem: saju.hour.stem, branch: saju.hour.branch })
  if (pillars.length < 3) return null
  return pillars
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

async function main() {
  const args = new Set(process.argv.slice(2))
  const dryRun = args.has('--dry-run')
  const limitArg = Array.from(args).find((a) => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined
  const batchSize = Number.isFinite(limit) ? Math.min(limit, 200) : 200

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Ensure .env is present or pass env manually.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  let processed = 0
  let updated = 0
  let skipped = 0
  let offset = 0
  const startedAt = Date.now()

  console.log(`[recalc] Starting shinsal recomputation${dryRun ? ' (dry-run)' : ''}...`)

  try {
    while (true) {
      const take = Number.isFinite(limit) ? Math.max(Math.min((limit ?? 0) - processed, batchSize), 0) : batchSize
      if (Number.isFinite(limit) && take <= 0) break
      const persons = await prisma.person.findMany({
        select: { id: true, name: true, saju: true, shinsal: true },
        orderBy: { createdAt: 'asc' },
        skip: offset,
        take: take || batchSize,
      })
      if (persons.length === 0) break
      offset += persons.length

      for (const p of persons) {
        processed += 1
        const pillars = normalizePillarsFromSaju(p.saju)
        if (!pillars) {
          skipped += 1
          console.log(`- ${p.id} ${p.name ?? ''} skipped (insufficient pillars)`) 
          continue
        }
        const next = calculateShinsal(pillars)
        // Remove unstable ordering by sorting all by name+positions for comparison
        const normalizeResult = (r) => r ? {
          ...r,
          all: (r.all ?? []).slice().sort((a, b) => (a.name + a.position.join(',')).localeCompare(b.name + b.position.join(',')))
        } : r
        const prevNorm = normalizeResult(p.shinsal)
        const nextNorm = normalizeResult(next)

        if (!prevNorm || !deepEqual(prevNorm, nextNorm)) {
          if (dryRun) {
            updated += 1
            console.log(`~ would update ${p.id} ${p.name ?? ''}: ${prevNorm ? (prevNorm.all?.length ?? 0) : 0} -> ${nextNorm.all.length} entries`)
          } else {
            await prisma.person.update({ where: { id: p.id }, data: { shinsal: next } })
            updated += 1
            console.log(`+ updated ${p.id} ${p.name ?? ''}: ${next.all.length} entries`)
          }
        } else {
          console.log(`= unchanged ${p.id} ${p.name ?? ''}`)
        }
      }
    }
  } finally {
    await new Promise((r) => setTimeout(r, 5))
    await prisma.$disconnect()
  }

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(`[recalc] Done. processed=${processed} updated=${updated} skipped=${skipped} time=${seconds}s`)
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('[recalc] Failed:', err)
    process.exit(1)
  })
}

