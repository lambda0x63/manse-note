'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  isOpen: boolean
  onClose: () => void
}

export function DatePicker({ value, onChange, isOpen, onClose }: DatePickerProps) {
  const currentYear = new Date().getFullYear()
  
  // 초기값 설정
  const initialDate = value ? new Date(value) : new Date(currentYear - 30, 0, 1)
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate())
  
  // 스크롤 컨테이너 ref
  const yearRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)
  const dayRef = useRef<HTMLDivElement>(null)
  
  // 스크롤 중인지 추적
  const [isYearScrolling, setIsYearScrolling] = useState(false)
  const [isMonthScrolling, setIsMonthScrolling] = useState(false)
  const [isDayScrolling, setIsDayScrolling] = useState(false)
  
  // 타이머 ref
  const yearTimer = useRef<NodeJS.Timeout | null>(null)
  const monthTimer = useRef<NodeJS.Timeout | null>(null)
  const dayTimer = useRef<NodeJS.Timeout | null>(null)

  // 데이터 생성
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => currentYear - i), [currentYear])
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }
  
  const days = useMemo(() => 
    Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1),
    [selectedYear, selectedMonth]
  )

  // 스크롤 위치 설정 함수
  const scrollToValue = (ref: React.RefObject<HTMLDivElement | null>, value: number, values: number[]) => {
    if (!ref.current) return
    const index = values.indexOf(value)
    if (index !== -1) {
      ref.current.scrollTop = index * 44
    }
  }

  // 팝업이 열릴 때 스크롤 위치 설정
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToValue(yearRef, selectedYear, years)
        scrollToValue(monthRef, selectedMonth, months)
        scrollToValue(dayRef, selectedDay, days)
      }, 100)
    }
  }, [isOpen, selectedYear, selectedMonth, selectedDay, years, months, days])

  // 월이 변경되면 일자 조정
  useEffect(() => {
    const maxDay = getDaysInMonth(selectedYear, selectedMonth)
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay)
    }
  }, [selectedYear, selectedMonth, selectedDay])

  const handleConfirm = () => {
    const date = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    onChange(date)
    onClose()
  }

  // 스크롤 핸들러
  const handleScroll = (
    type: 'year' | 'month' | 'day',
    ref: React.RefObject<HTMLDivElement | null>,
    setter: (value: number) => void,
    values: number[],
    setScrolling: (value: boolean) => void,
    timer: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (!ref.current) return
    
    setScrolling(true)
    
    // 기존 타이머 클리어
    if (timer.current) {
      clearTimeout(timer.current)
    }
    
    // 새로운 타이머 설정
    timer.current = setTimeout(() => {
      if (!ref.current) return
      
      const scrollTop = ref.current.scrollTop
      const index = Math.round(scrollTop / 44)
      const newValue = values[index]
      
      if (newValue !== undefined) {
        setter(newValue)
        // 정확한 위치로 스냅
        ref.current.scrollTop = index * 44
      }
      
      setScrolling(false)
    }, 150)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 p-5"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            <div className="flex justify-between items-center mb-5">
              <button onClick={onClose} className="text-gray-500">취소</button>
              <h3 className="font-semibold">생년월일 선택</h3>
              <button onClick={handleConfirm} className="text-primary font-semibold">확인</button>
            </div>

            <div className="flex gap-2">
              {/* 년도 선택 */}
              <div className="flex-1 h-[220px] relative">
                <div className="absolute inset-0">
                  <div
                    ref={yearRef}
                    className="h-full overflow-y-scroll scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                    onScroll={() => handleScroll('year', yearRef, setSelectedYear, years, setIsYearScrolling, yearTimer)}
                  >
                    <div className="h-[88px]" />
                    {years.map((year) => (
                      <div
                        key={year}
                        className={`h-[44px] flex items-center justify-center transition-all ${
                          year === selectedYear && !isYearScrolling
                            ? 'text-lg font-semibold opacity-100'
                            : 'text-gray-400 opacity-60'
                        }`}
                      >
                        {year}년
                      </div>
                    ))}
                    <div className="h-[88px]" />
                  </div>
                </div>
              </div>

              {/* 월 선택 */}
              <div className="w-20 h-[220px] relative">
                <div className="absolute inset-0">
                  <div
                    ref={monthRef}
                    className="h-full overflow-y-scroll scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                    onScroll={() => handleScroll('month', monthRef, setSelectedMonth, months, setIsMonthScrolling, monthTimer)}
                  >
                    <div className="h-[88px]" />
                    {months.map((month) => (
                      <div
                        key={month}
                        className={`h-[44px] flex items-center justify-center transition-all ${
                          month === selectedMonth && !isMonthScrolling
                            ? 'text-lg font-semibold opacity-100'
                            : 'text-gray-400 opacity-60'
                        }`}
                      >
                        {month}월
                      </div>
                    ))}
                    <div className="h-[88px]" />
                  </div>
                </div>
              </div>

              {/* 일 선택 */}
              <div className="w-20 h-[220px] relative">
                <div className="absolute inset-0">
                  <div
                    ref={dayRef}
                    className="h-full overflow-y-scroll scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                    onScroll={() => handleScroll('day', dayRef, setSelectedDay, days, setIsDayScrolling, dayTimer)}
                  >
                    <div className="h-[88px]" />
                    {days.map((day) => (
                      <div
                        key={day}
                        className={`h-[44px] flex items-center justify-center transition-all ${
                          day === selectedDay && !isDayScrolling
                            ? 'text-lg font-semibold opacity-100'
                            : 'text-gray-400 opacity-60'
                        }`}
                      >
                        {day}일
                      </div>
                    ))}
                    <div className="h-[88px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 선택 영역 표시 */}
            <div className="absolute left-5 right-5 h-[44px] border-t border-b border-gray-200 dark:border-gray-700 pointer-events-none" 
                 style={{ top: '153px' }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
