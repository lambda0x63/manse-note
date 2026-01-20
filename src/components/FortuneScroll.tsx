'use client'

import { useRef, useEffect } from 'react'
import { getWuxingInfo } from '@/lib/saju/wuxing'
import { TenGodChip } from '@/components/ui/TenGodChip'

interface FortuneItem {
  stem: string
  branch: string
  startAge?: number
  endAge?: number
  year?: number
  age?: number
  isCurrent: boolean
  tenGodStem?: string
  tenGodBranch?: string
}

interface FortuneScrollProps {
  items: FortuneItem[]
  currentAge?: number
  color: 'blue' | 'purple'
  size?: 'small' | 'large'
}

export function FortuneScroll({ items, currentAge, color, size = 'large' }: FortuneScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const currentIndex = items.findIndex(item => item.isCurrent)
      if (currentIndex !== -1) {
        // reverse된 배열에서의 인덱스 계산
        const reversedIndex = items.length - 1 - currentIndex
        const currentElement = scrollRef.current.children[0]?.children[reversedIndex] as HTMLElement
        if (currentElement) {
          const containerWidth = scrollRef.current.offsetWidth
          const elementLeft = currentElement.offsetLeft
          const elementWidth = currentElement.offsetWidth
          const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2)
          
          scrollRef.current.scrollLeft = scrollPosition
        }
      }
    }
  }, [items])

  const ringColor = color === 'blue' ? 'ring-blue-500' : 'ring-purple-500'
  const textColor = color === 'blue' ? 'text-blue-600' : 'text-purple-600'
  const cardSize = size === 'small' ? 'w-24 h-24' : 'w-28 h-28'
  const fontSize = size === 'small' ? 'text-4xl' : 'text-5xl'

  // TenGodChip handles consistent color mapping

  return (
    <div ref={scrollRef} className="overflow-x-auto touch-pan-x">
      <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
        {[...items].reverse().map((item, index) => {
          const stemInfo = getWuxingInfo(item.stem)
          const branchInfo = getWuxingInfo(item.branch)
          
          // 투명도 설정
          let opacity = ''
          if (item.startAge !== undefined && item.endAge !== undefined && currentAge !== undefined) {
            // 대운
            opacity = item.isCurrent ? '' : currentAge > item.endAge ? 'opacity-50' : 'opacity-70'
          } else if (item.year !== undefined) {
            // 세운
            const currentYear = new Date().getFullYear()
            const isPast = item.year < currentYear
            opacity = item.isCurrent ? '' : isPast ? 'opacity-50' : 'opacity-70'
          }
          
          return (
            <div 
              key={index}
              className={`flex-shrink-0 space-y-2 ${opacity}`}
            >
              {/* 라벨 */}
              <div className={`text-center text-sm font-semibold ${
                item.isCurrent ? textColor : 'text-gray-500'
              }`}>
                {item.startAge !== undefined && item.endAge !== undefined ? (
                  `${item.startAge}~${item.endAge}세`
                ) : item.year ? (
                  item.year
                ) : null}
              </div>
              
              {/* 천간 */}
              <div 
                className={`${cardSize} rounded-xl flex items-center justify-center shadow-md ${
                  item.isCurrent ? `ring-2 ${ringColor}` : ''
                }`}
                style={{ 
                  backgroundColor: stemInfo?.element === '木' ? '#1B5E20' :  // 청색
                                  stemInfo?.element === '火' ? '#B71C1C' :  // 적색
                                  stemInfo?.element === '土' ? '#F57F17' :  // 황색
                                  stemInfo?.element === '金' ? '#757575' :  // 백색
                                  stemInfo?.element === '水' ? '#212121' :  // 흑색
                                  '#424242'
                }}
              >
                <span 
                  className={`${fontSize} font-black text-white`}
                  style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}
                >
                  {item.stem}
                </span>
              </div>
              
              {/* 지지 */}
              <div 
                className={`${cardSize} rounded-xl flex items-center justify-center shadow-md ${
                  item.isCurrent ? `ring-2 ${ringColor}` : ''
                }`}
                style={{ 
                  backgroundColor: branchInfo?.element === '木' ? '#1B5E20' :  // 청색
                                  branchInfo?.element === '火' ? '#B71C1C' :  // 적색
                                  branchInfo?.element === '土' ? '#F57F17' :  // 황색
                                  branchInfo?.element === '金' ? '#757575' :  // 백색
                                  branchInfo?.element === '水' ? '#212121' :  // 흑색
                                  '#424242'
                }}
              >
                <span 
                  className={`${fontSize} font-black text-white`}
                  style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}
                >
                  {item.branch}
                </span>
              </div>

              {/* 십신 표시 (간/지) */}
              <div className="flex items-center justify-center gap-1">
                <TenGodChip name={item.tenGodStem} size="xs" variant="category" />
                <TenGodChip name={item.tenGodBranch} size="xs" variant="category" />
              </div>
              
              {/* 나이 (세운용) */}
              {item.age !== undefined && (
                <div className="text-center text-sm text-gray-500">
                  {item.age}세
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
