'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion'
import { Plus, Search, Calendar, ChevronRight, LogOut } from 'lucide-react'
import Image from 'next/image'
import PersonForm, { type PersonFormData } from '@/components/PersonForm'
import { PersonDetail } from '@/components/PersonDetail'
import PersonFormModal from '@/components/PersonFormModal'
import { SajuGrouping, GroupedData, GroupType } from '@/components/SajuGrouping'
import { apiRequestWithLoading } from '@/lib/api'
import { LoadingHook } from '@/components/ui/LoadingHook'
import type { PersonWithSaju, SajuData } from '@/types/saju'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getWuxingInfo } from '@/lib/saju/wuxing'
import { getAge } from '@/lib/date/age'
import { PersonCardSkeleton } from '@/components/PersonCardSkeleton'

// moved to components/PersonForm

interface ClientPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialPersons: any[]
}

export function ClientPage({ initialPersons }: ClientPageProps) {
  const formControls = useAnimation()
  
  const handleFormOpen = () => {
    setShowForm(true)
  }
  
  const [isLoading, setIsLoading] = useState(true)
  const [persons, setPersons] = useState<PersonWithSaju[]>(() => {
    return initialPersons.map(person => ({
      ...person,
      birthDate: new Date(person.birthDate),
      createdAt: new Date(person.createdAt),
      updatedAt: new Date(person.updatedAt)
    }))
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<PersonWithSaju | null>(null)
  const [currentGroupType, setCurrentGroupType] = useState<GroupType>('none')
  
  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredPersons = persons.filter(person => {
    // 이름 검색
    return person.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // 그룹핑 로직을 부모 컴포넌트에서 처리
  const groupedData = useMemo<GroupedData>(() => {
    const groups = new Map<string, PersonWithSaju[]>()
    
    if (currentGroupType === 'none') {
      groups.set('전체', filteredPersons)
      return { type: currentGroupType, groups }
    }

    // 임시 Map (정렬 전)
    const tempGroups = new Map<string, PersonWithSaju[]>()

    filteredPersons.forEach(person => {
      let key = '기타'
      
      switch (currentGroupType) {
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
            } else {
              key = `기타(${branch})`
            }
          }
          break
          
        case 'hasSiju':
          // 출생시간을 모르거나 null인 경우 시주 안세운 사람으로 분류
          key = (person.birthTime && !person.isBirthTimeUnknown) ? '시주 세운 사람' : '시주 안세운 사람'
          break
      }
      
      if (!tempGroups.has(key)) {
        tempGroups.set(key, [])
      }
      tempGroups.get(key)!.push(person)
    })
    
    // 그룹 타입에 따라 정렬된 순서로 재구성
    let orderedKeys: string[] = []
    
    switch (currentGroupType) {
      case 'gender':
        orderedKeys = ['남성', '여성']
        break
      case 'dayStem':
        orderedKeys = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
                       '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
        break
      case 'dayWuxing':
        orderedKeys = ['목', '화', '토', '금', '수',
                       '木', '火', '土', '金', '水']
        break
      case 'yearBranch':
        orderedKeys = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
                       '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
        break
      case 'monthBranch':
        orderedKeys = ['봄 (寅卯辰)', '여름 (巳午未)', '가을 (申酉戌)', '겨울 (亥子丑)']
        break
      case 'hasSiju':
        orderedKeys = ['시주 세운 사람', '시주 안세운 사람']
        break
      default:
        orderedKeys = Array.from(tempGroups.keys()).sort()
    }
    
    orderedKeys.forEach(key => {
      if (tempGroups.has(key)) {
        groups.set(key, tempGroups.get(key)!)
      }
    })
    
    tempGroups.forEach((value, key) => {
      if (!groups.has(key)) {
        groups.set(key, value)
      }
    })
    
    return { type: currentGroupType, groups }
  }, [currentGroupType, filteredPersons])

  // groupedData가 비어있으면 초기화 (삭제 - SajuGrouping에서 처리하도록)

  const handleCreatePerson = async (formData: PersonFormData) => {
    try {
      const response = await apiRequestWithLoading('/api/persons', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        // 전체 데이터를 다시 가져와서 상태를 완전히 새로고침
        await refreshData()
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error in handleCreatePerson:', error)
    }
  }

  const handleDeletePerson = async (id: string) => {
    const response = await apiRequestWithLoading(`/api/persons/${id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      setPersons(prev => prev.filter(p => p.id !== id))
      setSelectedPerson(null)
      
      // 그룹핑 데이터도 업데이트하기 위해 refreshData 호출
      // 그룹핑이 설정되어 있는 경우 SajuGrouping 컴포넌트가 자동으로 재계산
    }
  }

  const getCurrentAge = getAge

  // 데이터 새로고침 함수
  const refreshData = async () => {
    try {
      const response = await apiRequestWithLoading('/api/persons')
      if (response.ok) {
        const data = await response.json()
        const processedData = data.map((p: PersonWithSaju) => ({
          ...p,
          birthDate: new Date(p.birthDate),
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }))
        
        setPersons(processedData)
        
        // 선택된 person이 있으면 업데이트
        if (selectedPerson) {
          const updatedPerson = processedData.find((p: PersonWithSaju) => p.id === selectedPerson.id)
          if (updatedPerson) {
            setSelectedPerson(updatedPerson)
          } else {
            // 삭제된 경우 선택 해제
            setSelectedPerson(null)
          }
        }
        
        // 그룹핑 데이터는 SajuGrouping 컴포넌트가 persons 변경을 감지하여 자동 업데이트
        
        return processedData
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await apiRequestWithLoading('/api/logout', { method: 'POST' })
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <LoadingHook />
      
      {/* 헤더 */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="px-5 pt-safe pb-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image 
                  src="/yinyang.png" 
                  alt="음양" 
                  width={36} 
                  height={36} 
                  className="drop-shadow-sm"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">만세력 노트</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">사주팔자 관리 시스템</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="이름으로 사주 검색"
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="px-5 py-6 pb-24 max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto">
        {/* 사주 그룹핑 및 필터 */}
        <SajuGrouping 
          persons={filteredPersons} 
          currentGroup={currentGroupType}
          onGroupChange={setCurrentGroupType}
        />
        
        {/* 그룹별 표시 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <PersonCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          Array.from(groupedData.groups.entries()).map(([groupName, groupPersons]: [string, PersonWithSaju[]]) => (
            <div key={groupName} className="mb-8">
              {groupedData.type !== 'none' && (
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  {groupName} ({groupPersons.length}명)
                </h3>
              )}
              
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupPersons.map((person: PersonWithSaju, index: number) => {
          const age = getCurrentAge(person.birthDate)
          const saju = person.saju as SajuData
          
          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card 
                onClick={() => setSelectedPerson(person)}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 overflow-hidden group"
                role="button"
                tabIndex={0}
                aria-label={`${person.name} 상세 정보 보기`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedPerson(person)
                  }
                }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    {/* 왼쪽 컬러 액센트 */}
                    <div className={`w-1 h-full self-stretch ${
                      person.gender === '남' 
                        ? 'bg-gradient-to-b from-blue-400 to-blue-600' 
                        : 'bg-gradient-to-b from-pink-400 to-pink-600'
                    }`} />
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* 일간 표시 */}
                          {(() => {
                            const stemInfo = getWuxingInfo(saju.day.stem)
                            const stemBgStyle = 
                              stemInfo?.element === '木' ? { backgroundColor: '#1B5E20' } :  // 청색
                              stemInfo?.element === '火' ? { backgroundColor: '#B71C1C' } :  // 적색
                              stemInfo?.element === '土' ? { backgroundColor: '#F57F17' } :  // 황색
                              stemInfo?.element === '金' ? { backgroundColor: '#757575' } :  // 백색
                              stemInfo?.element === '水' ? { backgroundColor: '#212121' } :  // 흑색
                              { backgroundColor: '#424242' }
                            
                            return (
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                                style={stemBgStyle}
                              >
                                <span 
                                  className="text-2xl font-black text-white"
                                  style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
                                >
                                  {saju.day.stem}
                                </span>
                              </div>
                            )
                          })()}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {person.name}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {age}세
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(person.birthDate).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              {person.birthTime && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {person.birthTime}
                                </span>
                              )}
                            </div>
                            
                          </div>
                        </div>
                        
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
        </div>
          </div>
        ))
        )}
        
        {!isLoading && filteredPersons.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-transparent md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {searchTerm ? '검색 결과가 없습니다' : '등록된 인물이 없습니다'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {searchTerm ? '다른 이름으로 검색해보세요' : '우측 하단의 + 버튼을 눌러 추가하세요'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* FAB */}
      <Button
        onClick={handleFormOpen}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:shadow-2xl z-20"
        size="icon"
        aria-label="새 인물 등록"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* 등록 폼 - 반응형 */}
      <AnimatePresence mode="wait">
        {showForm && (
          <>
            {/* 모바일: 전체화면 */}
            <motion.div 
              key="mobile-person-form"
              className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(event, info: PanInfo) => {
                if (info.offset.y > 100) {
                  setShowForm(false)
                } else {
                  formControls.start({ y: 0, transition: { duration: 0.2 } })
                }
              }}
            >
              <div className="h-full overflow-y-auto">
                {/* 헤더 */}
                <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between px-4 pt-safe pb-3 max-w-2xl mx-auto w-full">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowForm(false)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                      <h1 className="text-lg font-semibold">인물 등록</h1>
                    </div>
                  </div>
                </header>
                
                <div className="px-5 py-6">
                  <PersonForm onSubmit={async (data) => {
                    await handleCreatePerson(data)
                    setShowForm(false)
                  }} />
                </div>
              </div>
            </motion.div>

            {/* 태블릿/PC: 모달 */}
            <div className="hidden md:block">
              <PersonFormModal
                onSubmit={async (data) => {
                  await handleCreatePerson(data)
                  setShowForm(false)
                }}
                onClose={() => setShowForm(false)}
              />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 상세보기 - 단일 반응형 컴포넌트 */}
      <AnimatePresence mode="wait">
        {selectedPerson && (
          <PersonDetail
            person={selectedPerson}
            onClose={() => setSelectedPerson(null)}
            onDelete={handleDeletePerson}
            onUpdate={refreshData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
