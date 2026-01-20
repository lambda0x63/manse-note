'use client'

import { useState } from 'react'
import { PersonWithSaju } from '@/types/saju'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Layers,
  Users,
  Flame,
  Droplets,
  Trees,
  Coins,
  Mountain,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getWuxingInfo } from '@/lib/saju/wuxing'

interface SajuGroupingProps {
  persons: PersonWithSaju[]
  currentGroup: GroupType
  onGroupChange: (type: GroupType) => void
}

export type GroupType = 'none' | 'gender' | 'dayStem' | 'dayWuxing' | 'yearBranch' | 'monthBranch' | 'hasSiju'

export interface GroupedData {
  type: GroupType
  groups: Map<string, PersonWithSaju[]>
}

const WUXING_ICONS = {
  '목': Trees,
  '화': Flame,
  '수': Droplets,
  '금': Coins,
  '토': Mountain
}

const WUXING_COLORS = {
  '목': 'text-green-700 bg-green-50 dark:bg-green-950',   // 청색
  '화': 'text-red-700 bg-red-50 dark:bg-red-950',        // 적색
  '수': 'text-gray-900 bg-gray-100 dark:bg-gray-800',    // 흑색
  '금': 'text-gray-700 bg-gray-50 dark:bg-gray-900',     // 백색
  '토': 'text-yellow-700 bg-yellow-50 dark:bg-yellow-950' // 황색
}

export function SajuGrouping({ persons, currentGroup, onGroupChange }: SajuGroupingProps) {
  const [showOptions, setShowOptions] = useState(false)

  const handleGroupChange = (type: GroupType) => {
    onGroupChange(type)
  }

  // 그룹 통계 계산 (부모에서 전달받은 persons와 currentGroup 사용)
  const getGroupStats = () => {
    const statsMap = new Map<string, number>()
    
    if (currentGroup === 'none') {
      return [{ key: '전체', count: persons.length, wuxing: null }]
    }

    persons.forEach(person => {
      let key = '기타'
      
      switch (currentGroup) {
        case 'gender':
          key = person.gender === '남' ? '남성' : '여성'
          break
        case 'dayStem':
          if (person.saju?.day?.stem) {
            key = person.saju.day.stem
          }
          break
        case 'dayWuxing':
          if (person.saju?.day?.stem) {
            const wuxing = getWuxingInfo(person.saju.day.stem)
            if (wuxing) {
              key = wuxing.element
            }
          }
          break
        case 'yearBranch':
          if (person.saju?.year?.branch) {
            key = person.saju.year.branch
          }
          break
        case 'monthBranch':
          if (person.saju?.month?.branch) {
            const branch = person.saju.month.branch
            if (branch.includes('寅') || branch.includes('卯') || branch.includes('辰') ||
                branch === '인' || branch === '묘' || branch === '진') {
              key = '봄 (寅卯辰)'
            } else if (branch.includes('巳') || branch.includes('午') || branch.includes('未') ||
                       branch === '사' || branch === '오' || branch === '미') {
              key = '여름 (巳午未)'
            } else if (branch.includes('申') || branch.includes('酉') || branch.includes('戌') ||
                       branch === '신' || branch === '유' || branch === '술') {
              key = '가을 (申酉戌)'
            } else if (branch.includes('亥') || branch.includes('子') || branch.includes('丑') ||
                       branch === '해' || branch === '자' || branch === '축') {
              key = '겨울 (亥子丑)'
            }
          }
          break
        case 'hasSiju':
          // 출생시간을 모르거나 null인 경우 시주 안세운 사람으로 분류
          key = (person.birthTime && !person.isBirthTimeUnknown) ? '시주 세운 사람' : '시주 안세운 사람'
          break
      }
      
      statsMap.set(key, (statsMap.get(key) || 0) + 1)
    })
    
    return Array.from(statsMap.entries()).map(([key, count]) => ({
      key,
      count,
      wuxing: currentGroup === 'dayWuxing' ? key : null
    }))
  }

  return (
    <>
      {/* 그룹핑/정렬 토글 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2"
        >
          <Layers className="h-4 w-4" />
          {showOptions ? '그룹/필터 숨기기' : '그룹/필터'}
        </Button>
        
        {currentGroup !== 'none' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleGroupChange('none')}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            그룹 해제
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mb-6"
          >
            {/* 그룹핑 옵션 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  그룹핑
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button
                    variant={currentGroup === 'gender' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGroupChange('gender')}
                    className="justify-start"
                  >
                    성별
                  </Button>
                  <Button
                    variant={currentGroup === 'dayStem' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGroupChange('dayStem')}
                    className="justify-start"
                  >
                    일간별
                  </Button>
                  <Button
                    variant={currentGroup === 'dayWuxing' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGroupChange('dayWuxing')}
                    className="justify-start"
                  >
                    일간 오행별
                  </Button>
                  <Button
                    variant={currentGroup === 'yearBranch' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGroupChange('yearBranch')}
                    className="justify-start"
                  >
                    띠별
                  </Button>
                  <Button
                    variant={currentGroup === 'monthBranch' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGroupChange('monthBranch')}
                    className="justify-start"
                  >
                    계절별
                  </Button>
                  <Button
                    variant={currentGroup === 'hasSiju' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGroupChange('hasSiju')}
                    className="justify-start"
                  >
                    시주 유무
                  </Button>
                </div>

                {/* 그룹 통계 */}
                {currentGroup !== 'none' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-xs text-gray-500 mb-2">그룹 분포</div>
                    <div className="flex flex-wrap gap-2">
                      {getGroupStats().map(stat => {
                        const Icon = stat.wuxing ? WUXING_ICONS[stat.wuxing as keyof typeof WUXING_ICONS] : null
                        const colorClass = stat.wuxing ? WUXING_COLORS[stat.wuxing as keyof typeof WUXING_COLORS] : ''
                        
                        return (
                          <Badge 
                            key={stat.key} 
                            variant="secondary"
                            className={stat.wuxing ? colorClass : ''}
                          >
                            {Icon && <Icon className="h-3 w-3 mr-1" />}
                            {stat.key}: {stat.count}명
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}