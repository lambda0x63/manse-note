'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  isOpen: boolean
  onClose: () => void
}

export function TimePicker({ value, onChange, isOpen, onClose }: TimePickerProps) {
  // 초기값 설정
  const [hour, minute] = value ? value.split(':').map(Number) : [0, 0]
  const [selectedHour, setSelectedHour] = useState(hour)
  const [selectedMinute, setSelectedMinute] = useState(minute)
  
  // 스크롤 컨테이너 ref
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)
  
  // 스크롤 중인지 추적
  const [isHourScrolling, setIsHourScrolling] = useState(false)
  const [isMinuteScrolling, setIsMinuteScrolling] = useState(false)
  
  // 타이머 ref
  const hourTimer = useRef<NodeJS.Timeout | null>(null)
  const minuteTimer = useRef<NodeJS.Timeout | null>(null)

  // 데이터 생성
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), [])

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
        scrollToValue(hourRef, selectedHour, hours)
        scrollToValue(minuteRef, selectedMinute, minutes)
      }, 100)
    }
  }, [isOpen, selectedHour, selectedMinute, hours, minutes])

  const handleConfirm = () => {
    const time = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
    onChange(time)
    onClose()
  }

  // 스크롤 핸들러
  const handleScroll = (
    type: 'hour' | 'minute',
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
              <h3 className="font-semibold">출생시간 선택</h3>
              <button onClick={handleConfirm} className="text-primary font-semibold">확인</button>
            </div>

            <div className="flex gap-4 justify-center">
              {/* 시간 선택 */}
              <div className="w-24 h-[220px] relative">
                <div className="absolute inset-0">
                  <div
                    ref={hourRef}
                    className="h-full overflow-y-scroll scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                    onScroll={() => handleScroll('hour', hourRef, setSelectedHour, hours, setIsHourScrolling, hourTimer)}
                  >
                    <div className="h-[88px]" />
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className={`h-[44px] flex items-center justify-center transition-all ${
                          hour === selectedHour && !isHourScrolling
                            ? 'text-lg font-semibold opacity-100'
                            : 'text-gray-400 opacity-60'
                        }`}
                      >
                        {String(hour).padStart(2, '0')}시
                      </div>
                    ))}
                    <div className="h-[88px]" />
                  </div>
                </div>
              </div>

              {/* 분 선택 */}
              <div className="w-24 h-[220px] relative">
                <div className="absolute inset-0">
                  <div
                    ref={minuteRef}
                    className="h-full overflow-y-scroll scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                    onScroll={() => handleScroll('minute', minuteRef, setSelectedMinute, minutes, setIsMinuteScrolling, minuteTimer)}
                  >
                    <div className="h-[88px]" />
                    {minutes.map((minute) => (
                      <div
                        key={minute}
                        className={`h-[44px] flex items-center justify-center transition-all ${
                          minute === selectedMinute && !isMinuteScrolling
                            ? 'text-lg font-semibold opacity-100'
                            : 'text-gray-400 opacity-60'
                        }`}
                      >
                        {String(minute).padStart(2, '0')}분
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
