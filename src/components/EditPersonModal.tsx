'use client'

import { useState, useEffect } from 'react'
import type { PersonWithSaju } from '@/types/saju'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { apiRequestWithLoading } from '@/lib/api'
import { parseYYMMDDToISO, parseHHMMToTime } from '@/lib/date/parse'
import { X } from 'lucide-react'

interface EditPersonModalProps {
  person: PersonWithSaju
  onClose: () => void
  onUpdate: () => void
}

export default function EditPersonModal({ person, onClose, onUpdate }: EditPersonModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="bg-card">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-2 top-2 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle>정보 수정</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">생년월일 (6자리)</Label>
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
                    className="font-mono"
                  />
                  {birthDateInput.length === 6 && formData.birthDate && (
                    <p className="text-xs text-gray-500">→ {formData.birthDate}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isLunar"
                  checked={formData.isLunar}
                  onChange={(e) => setFormData({ ...formData, isLunar: e.target.checked })}
                  className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-ring"
                />
                <Label htmlFor="isLunar">음력</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBirthTimeUnknown"
                  checked={formData.isBirthTimeUnknown}
                  onChange={(e) => setFormData({ ...formData, isBirthTimeUnknown: e.target.checked })}
                  className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-ring"
                />
                <Label htmlFor="isBirthTimeUnknown">출생 시간 모름</Label>
              </div>

              {!formData.isBirthTimeUnknown && (
                <div className="space-y-2">
                  <Label htmlFor="birthTime">출생 시간 (24시 기준, 4자리)</Label>
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
                      className="font-mono"
                    />
                    {birthTimeInput.length === 4 && formData.birthTime && (
                      <p className="text-xs text-gray-500">→ {formData.birthTime}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  저장
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
