'use client'

import { useState, useEffect } from 'react'
import type { PersonWithSaju } from '@/types/saju'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { apiRequestWithLoading } from '@/lib/api'
import { parseYYMMDDToISO, parseHHMMToTime } from '@/lib/date/parse'

interface EditPersonFormProps {
  person: PersonWithSaju
  onClose: () => void
  onUpdate: () => void
}

export default function EditPersonForm({ person, onClose, onUpdate }: EditPersonFormProps) {
  const [formData, setFormData] = useState({
    name: person.name,
    birthDate: person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : '',
    birthTime: person.birthTime || '',
    isBirthTimeUnknown: person.isBirthTimeUnknown,
    isLunar: person.isLunar
  })
  
  // 생년월일을 6자리 형식으로 변환
  const formatDateToSixDigits = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return year + month + day
  }
  
  // 시간을 4자리 형식으로 변환
  const formatTimeToFourDigits = (timeStr: string) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    if (parts.length !== 2) return ''
    const [hour, minute] = parts
    return hour + minute
  }
  
  const [birthDateInput, setBirthDateInput] = useState(
    formatDateToSixDigits(person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : '')
  )
  const [birthTimeInput, setBirthTimeInput] = useState(
    formatTimeToFourDigits(person.birthTime || '')
  )

  useEffect(() => {
    const dateStr = person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : ''
    setFormData({
      name: person.name,
      birthDate: dateStr,
      birthTime: person.birthTime || '',
      isBirthTimeUnknown: person.isBirthTimeUnknown,
      isLunar: person.isLunar
    })
    setBirthDateInput(formatDateToSixDigits(dateStr))
    setBirthTimeInput(formatTimeToFourDigits(person.birthTime || ''))
  }, [person])
  
  const formatBirthDate = (value: string) => parseYYMMDDToISO(value)
  const formatBirthTime = (value: string) => parseHHMMToTime(value)

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length <= 6) {
      setBirthDateInput(cleaned)
      
      if (cleaned.length === 6) {
        const formatted = formatBirthDate(cleaned)
        if (formatted) {
          setFormData({ ...formData, birthDate: formatted })
        }
      } else {
        setFormData({ ...formData, birthDate: '' })
      }
    }
  }

  const handleBirthTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length <= 4) {
      setBirthTimeInput(cleaned)
      
      if (cleaned.length === 4) {
        const formatted = formatBirthTime(cleaned)
        if (formatted) {
          setFormData({ ...formData, birthTime: formatted })
        }
      } else {
        setFormData({ ...formData, birthTime: '' })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (birthDateInput && birthDateInput.length !== 6) {
      alert('생년월일은 6자리로 입력해주세요. (예: 901225)')
      return
    }

    if (!formData.isBirthTimeUnknown && birthTimeInput && birthTimeInput.length !== 4) {
      alert('출생시간은 4자리로 입력해주세요. (예: 1430)')
      return
    }

    try {
      const response = await apiRequestWithLoading(`/api/persons/${person.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
          birthTime: formData.isBirthTimeUnknown ? null : formData.birthTime,
          isBirthTimeUnknown: formData.isBirthTimeUnknown,
          isLunar: formData.isLunar
        })
      })

      if (response.ok) {
        await onUpdate() // onUpdate가 비동기일 수 있으므로 await
        onClose()
      } else {
        throw new Error('Failed to update person')
      }
    } catch (error) {
      console.error('Error updating person:', error)
      alert('수정 중 오류가 발생했습니다.')
    }
  }

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-background"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="h-full overflow-y-auto">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 pt-safe pb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-accent"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
              <h1 className="text-lg font-semibold">정보 수정</h1>
            </div>
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-sm"
            >
              저장
            </Button>
          </div>
        </header>
        
        <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6">
          {/* 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              이름
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
              required
            />
          </div>

          {/* 생년월일 입력 */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-medium">
              생년월일 (6자리)
            </Label>
            <div className="space-y-1">
              <Input
                id="birthDate"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={birthDateInput}
                onChange={handleBirthDateChange}
                placeholder="901225 (YYMMDD)"
                className="w-full font-mono"
              />
              {birthDateInput.length === 6 && formData.birthDate && (
                <p className="text-xs text-gray-500">→ {formData.birthDate}</p>
              )}
            </div>
          </div>

          {/* 음력 체크박스 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isLunar"
              checked={formData.isLunar}
              onChange={(e) => setFormData({ ...formData, isLunar: e.target.checked })}
              className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-ring"
            />
            <Label htmlFor="isLunar" className="text-sm font-medium">
              음력
            </Label>
          </div>

          {/* 시간 모름 체크박스 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isBirthTimeUnknown"
              checked={formData.isBirthTimeUnknown}
              onChange={(e) => setFormData({ ...formData, isBirthTimeUnknown: e.target.checked })}
              className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-ring"
            />
            <Label htmlFor="isBirthTimeUnknown" className="text-sm font-medium">
              출생 시간 모름
            </Label>
          </div>

          {/* 출생 시간 입력 (시간 모름이 체크되지 않았을 때만) */}
          {!formData.isBirthTimeUnknown && (
            <div className="space-y-2">
              <Label htmlFor="birthTime" className="text-sm font-medium">
                출생 시간 (24시 기준, 4자리)
              </Label>
              <div className="space-y-1">
                <Input
                  id="birthTime"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={birthTimeInput}
                  onChange={handleBirthTimeChange}
                  placeholder="1430 (HHMM)"
                  className="w-full font-mono"
                />
                {birthTimeInput.length === 4 && formData.birthTime && (
                  <p className="text-xs text-gray-500">→ {formData.birthTime}</p>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  )
}
