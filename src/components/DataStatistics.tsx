'use client'

import { useState } from 'react'
import { PersonWithSaju } from '@/types/saju'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, Users, Calendar, TrendingUp, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAge } from '@/lib/date/age'

interface DataStatisticsProps {
  persons: PersonWithSaju[]
  onFilterChange?: (filter: FilterOptions) => void
}

interface FilterOptions {
  gender?: '남' | '여' | null
  ageRange?: { min: number; max: number } | null
  zodiac?: string | null
}

export function DataStatistics({ persons, onFilterChange }: DataStatisticsProps) {
  const [showStats, setShowStats] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterOptions>({})

  // 통계 계산
  const stats = {
    total: persons.length,
    male: persons.filter(p => p.gender === '남').length,
    female: persons.filter(p => p.gender === '여').length,
    withBirthTime: persons.filter(p => !p.isBirthTimeUnknown).length,
    lunar: persons.filter(p => p.isLunar).length,
  }

  // 연령대별 분포
  const getAgeDistribution = () => {
    const distribution: Record<string, number> = {
      '0-19': 0,
      '20-29': 0,
      '30-39': 0,
      '40-49': 0,
      '50-59': 0,
      '60+': 0,
    }

    persons.forEach(person => {
      const age = getAge(person.birthDate)
      if (age < 20) distribution['0-19']++
      else if (age < 30) distribution['20-29']++
      else if (age < 40) distribution['30-39']++
      else if (age < 50) distribution['40-49']++
      else if (age < 60) distribution['50-59']++
      else distribution['60+']++
    })

    return distribution
  }

  // 띠별 분포
  const getZodiacDistribution = () => {
    const distribution: Record<string, number> = {}
    
    persons.forEach(person => {
      if (person.saju?.year?.branch) {
        const zodiac = person.saju.year.branch
        distribution[zodiac] = (distribution[zodiac] || 0) + 1
      }
    })

    return distribution
  }

  // age util 사용으로 중복 제거

  const ageDistribution = getAgeDistribution()
  const zodiacDistribution = getZodiacDistribution()

  const applyFilter = (type: string, value: '남' | '여' | string | { min: number; max: number }) => {
    const newFilter = { ...activeFilter }
    
    switch (type) {
      case 'gender':
        newFilter.gender = activeFilter.gender === value ? null : value as '남' | '여'
        break
      case 'zodiac':
        newFilter.zodiac = activeFilter.zodiac === value ? null : value as string
        break
      case 'ageRange':
        const ageValue = value as { min: number; max: number }
        newFilter.ageRange = activeFilter.ageRange?.min === ageValue.min ? null : ageValue
        break
    }
    
    setActiveFilter(newFilter)
    if (onFilterChange) {
      onFilterChange(newFilter)
    }
  }

  const clearFilters = () => {
    setActiveFilter({})
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  const hasActiveFilters = activeFilter.gender || activeFilter.ageRange || activeFilter.zodiac

  return (
    <>
      {/* 통계 토글 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          {showStats ? '통계 숨기기' : '통계 보기'}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            필터 초기화
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mb-6"
          >
            {/* 기본 통계 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  기본 통계
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div 
                    className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                    onClick={() => clearFilters()}
                  >
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-gray-500">전체</div>
                  </div>
                  <div 
                    className={`text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 p-2 rounded ${
                      activeFilter.gender === '남' ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                    onClick={() => applyFilter('gender', '남')}
                  >
                    <div className="text-2xl font-bold text-blue-600">{stats.male}</div>
                    <div className="text-xs text-gray-500">남성</div>
                  </div>
                  <div 
                    className={`text-center cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950 p-2 rounded ${
                      activeFilter.gender === '여' ? 'bg-pink-100 dark:bg-pink-900' : ''
                    }`}
                    onClick={() => applyFilter('gender', '여')}
                  >
                    <div className="text-2xl font-bold text-pink-600">{stats.female}</div>
                    <div className="text-xs text-gray-500">여성</div>
                  </div>
                  <div className="text-center p-2">
                    <div className="text-2xl font-bold text-green-600">{stats.withBirthTime}</div>
                    <div className="text-xs text-gray-500">시간정보</div>
                  </div>
                  <div className="text-center p-2">
                    <div className="text-2xl font-bold text-purple-600">{stats.lunar}</div>
                    <div className="text-xs text-gray-500">음력</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 연령대 분포 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  연령대 분포
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(ageDistribution).map(([range, count]) => {
                    const [min, max] = range === '60+' 
                      ? [60, 100] 
                      : range.split('-').map(Number)
                    const isActive = activeFilter.ageRange?.min === min
                    
                    return (
                      <div 
                        key={range}
                        className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded ${
                          isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                        onClick={() => applyFilter('ageRange', { min, max })}
                      >
                        <span className="text-sm">{range}세</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / persons.length) * 100}%` }}
                            />
                          </div>
                          <Badge variant="secondary" className="min-w-[2rem]">{count}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 띠별 분포 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  띠별 분포
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'].map(zodiac => {
                    const count = zodiacDistribution[zodiac] || 0
                    const isActive = activeFilter.zodiac === zodiac
                    
                    return (
                      <div 
                        key={zodiac}
                        className={`text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded ${
                          isActive ? 'bg-gray-100 dark:bg-gray-800 ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => applyFilter('zodiac', zodiac)}
                      >
                        <div className="font-bold text-lg">{zodiac}</div>
                        <div className="text-xs text-gray-500">{count}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
