'use client'

import React, { useMemo, useState } from 'react'
import { getWuxingInfo, WUXING_KOREAN } from '@/lib/saju/wuxing'
import { getJijanggan, calculateJijangganTenGods } from '@/lib/saju/jijanggan'
import { findHapchungInSaju, checkSamhap } from '@/lib/saju/hapchung'
import { findCheonganHapchungInSaju } from '@/lib/saju/cheongan-hapchung'
import { calculateTenGod } from '@/lib/saju/ten-gods'
import { TenGodTile } from '@/components/ui/TenGodChip'
import type { SajuData } from '@/types/saju'
import type { ShinsalResult } from '@/lib/saju/shinsal'
import { ShinsalDisplay } from '@/components/ShinsalDisplay'

const EARTH_STORAGE_BRANCHES = new Set(['辰', '戌', '丑', '未'])
const JIJANGGAN_LABELS: Array<{ key: '본기' | '중기' | '여기'; index: 0 | 1 | 2 }> = [
  { key: '여기', index: 2 },
  { key: '중기', index: 1 },
  { key: '본기', index: 0 }
]


const formatCharWithElement = (char: string) => {
  const info = getWuxingInfo(char)
  if (!info) return char
  return `${char}(${WUXING_KOREAN[info.element]})`
}

const describeHap = (label: string) => {
  const match = label.match(/^(.)(.)합(.)(.*)$/)
  if (!match) return ''
  const [, char1, char2, elementChar] = match
  const resultKo = WUXING_KOREAN[elementChar as keyof typeof WUXING_KOREAN]
  const part1 = formatCharWithElement(char1)
  const part2 = formatCharWithElement(char2)
  if (resultKo) {
    return `${part1}와 ${part2}가 결속되어 ${resultKo} 기운이 강화됩니다.`
  }
  return `${part1}와 ${part2}가 결속되어 해당 오행 기운이 강조됩니다.`
}

const describeCheonganHap = describeHap

const describeChung = (label: string) => {
  const match = label.match(/^(.)(.)충$/)
  if (!match) return ''
  const [, char1, char2] = match
  const info1 = getWuxingInfo(char1)
  const info2 = getWuxingInfo(char2)
  const elementKo1 = info1 ? WUXING_KOREAN[info1.element] : ''
  const elementKo2 = info2 ? WUXING_KOREAN[info2.element] : ''
  const part1 = formatCharWithElement(char1)
  const part2 = formatCharWithElement(char2)
  let desc = `${part1}와 ${part2}가 충돌하여 ${elementKo1 || '해당'}·${elementKo2 || '해당'} 기운이 요동합니다.`
  if (EARTH_STORAGE_BRANCHES.has(char1) && EARTH_STORAGE_BRANCHES.has(char2)) {
    desc += ' 토 창고가 열리거나 흔들릴 수 있으니 주의합니다.'
  }
  return desc
}

const describeCheonganChung = (label: string) => {
  const match = label.match(/^(.)(.)충$/)
  if (!match) return ''
  const [, char1, char2] = match
  const part1 = formatCharWithElement(char1)
  const part2 = formatCharWithElement(char2)
  return `${part1}와 ${part2}가 맞부딪혀 두 오행이 서로 제어합니다.`
}

const describeSamhap = (label: string) => {
  const match = label.match(/^(.)(.)(.)\s(.).*$/)
  if (!match) return ''
  const [, char1, char2, char3, elementChar] = match
  const resultKo = WUXING_KOREAN[elementChar as keyof typeof WUXING_KOREAN]
  const parts = [char1, char2, char3].map(formatCharWithElement)
  if (resultKo) {
    return `${parts.join(', ')}이 모여 ${resultKo} 기운의 국이 완성됩니다.`
  }
  return `${parts.join(', ')}이 모여 삼합이 형성됩니다.`
}

interface SajuTableProps {
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
}

export function SajuTable({ saju, tenGods, shinsal }: SajuTableProps) {
  const [showJijanggan, setShowJijanggan] = useState(false)

  const SAJU_CARD_SIZE = 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'
  const SAJU_FONT_SIZE = 'text-3xl sm:text-4xl md:text-5xl'

  const renderCell = (
    char: string | undefined,
    isDayStem?: boolean,
    isBranch?: boolean
  ) => {
    if (!char) {
      return (
        <div className="flex flex-col items-center">
          <div className={`rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${SAJU_CARD_SIZE}`}>
            <span className="text-2xl text-gray-400">−</span>
          </div>
        </div>
      )
    }

    const info = getWuxingInfo(char)
    const bgStyle =
      info?.element === '木' ? { backgroundColor: '#1B5E20' } :
      info?.element === '火' ? { backgroundColor: '#B71C1C' } :
      info?.element === '土' ? { backgroundColor: '#F57F17' } :
      info?.element === '金' ? { backgroundColor: '#757575' } :
      info?.element === '水' ? { backgroundColor: '#212121' } :
      { backgroundColor: '#424242' }

    return (
      <div className="flex flex-col items-center">
        <div
          className={`rounded-xl flex items-center justify-center relative shadow-md ${SAJU_CARD_SIZE} ${isDayStem ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
          style={bgStyle}
        >
          <span
            className={`${SAJU_FONT_SIZE} font-black text-white`}
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}
          >
            {char}
          </span>
        </div>
        {isBranch && showJijanggan && (
          <div className="mt-2 w-full space-y-1">
            {JIJANGGAN_LABELS.map(({ index, key }) => {
              const jg = getJijanggan(char)[index]
              if (!jg) return null
              const jgInfo = getWuxingInfo(jg)
              const jgBgStyle =
                jgInfo?.element === '木' ? { backgroundColor: 'rgba(27, 94, 32, 0.92)' } :
                jgInfo?.element === '火' ? { backgroundColor: 'rgba(183, 28, 28, 0.92)' } :
                jgInfo?.element === '土' ? { backgroundColor: 'rgba(245, 127, 23, 0.92)' } :
                jgInfo?.element === '金' ? { backgroundColor: 'rgba(117, 117, 117, 0.92)' } :
                jgInfo?.element === '水' ? { backgroundColor: 'rgba(33, 33, 33, 0.92)' } :
                { backgroundColor: 'rgba(66, 66, 66, 0.92)' }
              return (
                <div
                  key={`jg-${index}`}
                  className="h-8 rounded-lg px-2 shadow-sm flex items-center justify-between text-white text-xs"
                  style={jgBgStyle}
                >
                  <span className="font-semibold opacity-80">{key}</span>
                  <span className="text-sm font-bold flex-1 text-center" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{jg}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  
  // 합충 계산 준비
  const displayBranches = useMemo<(string | undefined)[]>(
    () => [saju.hour?.branch, saju.day.branch, saju.month?.branch, saju.year?.branch],
    [saju.hour?.branch, saju.day.branch, saju.month?.branch, saju.year?.branch]
  )

  const branches = useMemo(
    () => [saju.year?.branch, saju.month?.branch, saju.day.branch, saju.hour?.branch].filter(Boolean) as string[],
    [saju.year?.branch, saju.month?.branch, saju.day.branch, saju.hour?.branch]
  )

  const stems = useMemo(
    () => [saju.year?.stem, saju.month?.stem, saju.day.stem, saju.hour?.stem].filter(Boolean) as string[],
    [saju.year?.stem, saju.month?.stem, saju.day.stem, saju.hour?.stem]
  )

  const hapchungResult = useMemo(() => findHapchungInSaju(branches), [branches])
  const samhapResult = useMemo(() => checkSamhap(branches), [branches])
  const cheonganHapchung = useMemo(() => findCheonganHapchungInSaju(stems), [stems])

  const jijangganRowMeta = useMemo(() => {
    const rows = [2, 1, 0] as const
    return rows
      .filter(index => displayBranches.some(branch => branch && getJijanggan(branch)[index]))
      .map(index => ({ index }))
  }, [displayBranches])

  // TenGodChip로 컬러 일관화
  
  return (
    <>
      <div className="w-full space-y-4 select-none">
      {/* 스위치 토글 */}
      <div className="flex justify-between items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">사주 원국</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-600 dark:text-gray-400">지장간</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={showJijanggan}
                onChange={() => setShowJijanggan(!showJijanggan)}
                className="sr-only"
              />
              <div className={`w-9 h-5 rounded-full transition-colors ${
                showJijanggan ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  showJijanggan ? 'translate-x-4' : ''
                }`} />
              </div>
            </div>
          </label>
        </div>
      </div>
      
      {/* 주기 헤더 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">시주</div>
        <div className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">일주</div>
        <div className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">월주</div>
        <div className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">년주</div>
      </div>
      
      {/* 사주 원국 */}
      <div className="space-y-4">
        {/* 천간 행 */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 justify-items-center px-1 sm:px-0">
          <div className="relative">
            {renderCell(saju.hour?.stem)}
          </div>
          <div className="relative">
            {renderCell(saju.day.stem, true)}
          </div>
          <div className="relative">
            {renderCell(saju.month?.stem)}
          </div>
          <div className="relative">
            {renderCell(saju.year?.stem)}
          </div>
        </div>
        
        {/* 지지 행 */}
          <div className="relative" style={{ marginBottom: showJijanggan ? '8.5rem' : '0' }}>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 justify-items-center px-1 sm:px-0">
              <div className="relative">{renderCell(saju.hour?.branch, false, true)}</div>
              <div className="relative">{renderCell(saju.day.branch, false, true)}</div>
              <div className="relative">{renderCell(saju.month?.branch, false, true)}</div>
              <div className="relative">{renderCell(saju.year?.branch, false, true)}</div>
            </div>
          </div>
      </div>

      {/* 십신 테이블 */}
      {tenGods && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 mt-8">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-3">십신 배치</h4>
          <div className="space-y-3">
            {/* 천간 십신 */}
            <div className="grid grid-cols-4 gap-3">
              <TenGodTile name={tenGods.hourStem} variant="soft" />
              <TenGodTile name={'일간'} variant="neutral" />
              <TenGodTile name={tenGods.monthStem} variant="soft" />
              <TenGodTile name={tenGods.yearStem} variant="soft" />
            </div>
            
            {/* 지지 십신 */}
            <div className="grid grid-cols-4 gap-3">
              <TenGodTile name={tenGods.hourBranch} variant="soft" />
              <TenGodTile name={tenGods.dayBranch} variant="soft" />
              <TenGodTile name={tenGods.monthBranch} variant="soft" />
              <TenGodTile name={tenGods.yearBranch} variant="soft" />
            </div>
            
            {/* 지장간 십신 */}
            {showJijanggan && (
              <div className="space-y-3 mt-3 pt-3 border-t">
                <div className="text-xs font-medium text-gray-500">지장간</div>
                {jijangganRowMeta.map(({ index: rowIdx }) => {
                  const cells = [
                    saju.hour?.branch ? calculateJijangganTenGods(saju.day.stem, saju.hour.branch, calculateTenGod)[rowIdx] : undefined,
                    getJijanggan(saju.day.branch)[rowIdx] ? calculateJijangganTenGods(saju.day.stem, saju.day.branch, calculateTenGod)[rowIdx] : undefined,
                    saju.month?.branch ? (getJijanggan(saju.month.branch)[rowIdx] ? calculateJijangganTenGods(saju.day.stem, saju.month.branch, calculateTenGod)[rowIdx] : undefined) : undefined,
                    saju.year?.branch ? (getJijanggan(saju.year.branch)[rowIdx] ? calculateJijangganTenGods(saju.day.stem, saju.year.branch, calculateTenGod)[rowIdx] : undefined) : undefined,
                  ]
                  return (
                    <div
                      key={`jijanggan-row-${rowIdx}`}
                      className="grid grid-cols-4 gap-2 sm:gap-3"
                    >
                      {cells.map((name, i) => (
                        <TenGodTile key={`${rowIdx}-${i}`} name={name} size="xs" variant="soft" />
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 신살 정보 - 십신 바로 아래 배치 */}
      {shinsal && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-8">
          <ShinsalDisplay shinsal={shinsal} />
        </div>
      )}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 space-y-4 mt-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            합충 관계 분석
          </h4>
          
          {/* 천간 섹션 */}
          {(cheonganHapchung.hap.length > 0 || cheonganHapchung.chung.length > 0) && (
            <div className="border-b pb-3 mb-3">
              <div className="text-xs font-medium text-gray-600 mb-2">천간</div>
              
              {/* 천간합 */}
              {cheonganHapchung.hap.length > 0 && (
                <div className="space-y-2 mb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 천간합
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cheonganHapchung.hap.map((hap, idx) => {
                      const match = hap.match(/^(.)(.)합(.)(.*)$/)
                      const char1 = match?.[1] ?? ''
                      const char2 = match?.[2] ?? ''
                      const resultElement = match?.[3]
                      const info1 = getWuxingInfo(char1)
                      const info2 = getWuxingInfo(char2)
                      const resultInfo = resultElement ? getWuxingInfo(resultElement) : null
                      return (
                        <div key={idx} className="w-full sm:w-auto max-w-xs flex-1 min-w-[210px] px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-100">
                            <span className="font-bold" style={{ color: info1?.color?.rgb || '#4B5563' }}>{char1}</span>
                            <span className="text-[11px] text-gray-500">({info1 ? WUXING_KOREAN[info1.element] : '-'})</span>
                            <span className="text-xs text-green-600 dark:text-green-400 font-bold">+</span>
                            <span className="font-bold" style={{ color: info2?.color?.rgb || '#4B5563' }}>{char2}</span>
                            <span className="text-[11px] text-gray-500">({info2 ? WUXING_KOREAN[info2.element] : '-'})</span>
                            {resultElement && (
                              <span className="text-xs text-green-600 dark:text-green-400 ml-1">
                                → {resultElement}({resultInfo ? WUXING_KOREAN[resultInfo.element] : '-'})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{describeCheonganHap(hap)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* 천간충 */}
              {cheonganHapchung.chung.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 천간충
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cheonganHapchung.chung.map((chung, idx) => {
                      const match = chung.match(/^(.)(.)충$/)
                      const char1 = match?.[1] ?? ''
                      const char2 = match?.[2] ?? ''
                      const info1 = getWuxingInfo(char1)
                      const info2 = getWuxingInfo(char2)
                      return (
                        <div key={idx} className="w-full sm:w-auto max-w-xs flex-1 min-w-[210px] px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-100">
                            <span className="font-bold" style={{ color: info1?.color?.rgb || '#4B5563' }}>{char1}</span>
                            <span className="text-[11px] text-gray-500">({info1 ? WUXING_KOREAN[info1.element] : '-'})</span>
                            <span className="text-xs text-red-600 dark:text-red-400 font-bold">×</span>
                            <span className="font-bold" style={{ color: info2?.color?.rgb || '#4B5563' }}>{char2}</span>
                            <span className="text-[11px] text-gray-500">({info2 ? WUXING_KOREAN[info2.element] : '-'})</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{describeCheonganChung(chung)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 지지 섹션 */}
          {(hapchungResult.hap.length > 0 || hapchungResult.chung.length > 0 || samhapResult.length > 0) && (
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">지지</div>
              
              {/* 육합 */}
              {hapchungResult.hap.length > 0 && (
                <div className="space-y-2 mb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 육합
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {hapchungResult.hap.map((hap, idx) => {
                      const match = hap.match(/^(.)(.)합(.)(.*)$/)
                      const char1 = match?.[1] ?? ''
                      const char2 = match?.[2] ?? ''
                      const resultElement = match?.[3]
                      const info1 = getWuxingInfo(char1)
                      const info2 = getWuxingInfo(char2)
                      const resultInfo = resultElement ? getWuxingInfo(resultElement) : null
                      return (
                        <div key={idx} className="w-full sm:w-auto max-w-xs flex-1 min-w-[210px] px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-100">
                            <span className="font-bold" style={{ color: info1?.color?.rgb || '#4B5563' }}>{char1}</span>
                            <span className="text-[11px] text-gray-500">({info1 ? WUXING_KOREAN[info1.element] : '-'})</span>
                            <span className="text-xs text-green-600 dark:text-green-400 font-bold">+</span>
                            <span className="font-bold" style={{ color: info2?.color?.rgb || '#4B5563' }}>{char2}</span>
                            <span className="text-[11px] text-gray-500">({info2 ? WUXING_KOREAN[info2.element] : '-'})</span>
                            {resultElement && (
                              <span className="text-xs text-green-600 dark:text-green-400 ml-1">
                                → {resultElement}({resultInfo ? WUXING_KOREAN[resultInfo.element] : '-'})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{describeHap(hap)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* 삼합(방합) */}
              {samhapResult.length > 0 && (
                <div className="space-y-2 mb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 삼합(방합)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {samhapResult.map((samhap, idx) => {
                      const match = samhap.match(/^(.)(.)(.)\s(.).*$/)
                      const chars = match ? [match[1], match[2], match[3]] : []
                      const resultElement = match?.[4]
                      return (
                        <div key={idx} className="w-full sm:w-auto max-w-xs flex-1 min-w-[210px] px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-100">
                            {chars.map((char, i) => {
                              const info = getWuxingInfo(char)
                              return (
                                <span key={`${char}-${i}`} className="flex items-center gap-1">
                                  <span className="font-bold" style={{ color: info?.color?.rgb || '#4B5563' }}>{char}</span>
                                  <span className="text-[11px] text-gray-500">({info ? WUXING_KOREAN[info.element] : '-'})</span>
                                  {i < chars.length - 1 && <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">+</span>}
                                </span>
                              )
                            })}
                            {resultElement && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">
                                → {resultElement}({WUXING_KOREAN[resultElement as keyof typeof WUXING_KOREAN] || '-'})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{describeSamhap(samhap)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* 육충 */}
              {hapchungResult.chung.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 육충
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {hapchungResult.chung.map((chung, idx) => {
                      const match = chung.match(/^(.)(.)충$/)
                      const char1 = match?.[1] ?? ''
                      const char2 = match?.[2] ?? ''
                      const info1 = getWuxingInfo(char1)
                      const info2 = getWuxingInfo(char2)
                      return (
                        <div key={idx} className="w-full sm:w-auto max-w-xs flex-1 min-w-[210px] px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-100">
                            <span className="font-bold" style={{ color: info1?.color?.rgb || '#4B5563' }}>{char1}</span>
                            <span className="text-[11px] text-gray-500">({info1 ? WUXING_KOREAN[info1.element] : '-'})</span>
                            <span className="text-xs text-red-600 dark:text-red-400 font-bold">×</span>
                            <span className="font-bold" style={{ color: info2?.color?.rgb || '#4B5563' }}>{char2}</span>
                            <span className="text-[11px] text-gray-500">({info2 ? WUXING_KOREAN[info2.element] : '-'})</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{describeChung(chung)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 합충 정보가 없을 때 메시지 표시 */}
          {!(hapchungResult.hap.length > 0 || hapchungResult.chung.length > 0 || samhapResult.length > 0 || 
             cheonganHapchung.hap.length > 0 || cheonganHapchung.chung.length > 0) && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              합충 관계가 없습니다
            </div>
          )}
        </div>
      </div>
    </>
  );
}
