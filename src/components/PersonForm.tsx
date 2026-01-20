'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { parseYYMMDDToISO, parseHHMMToTime } from '@/lib/date/parse'

export interface PersonFormData {
  name: string
  birthDate: string
  birthTime: string
  gender: '남' | '여'
  memo: string
  isLunar: boolean
  isBirthTimeUnknown: boolean
}

interface PersonFormProps {
  onSubmit: (data: PersonFormData) => Promise<void>
  onCancel?: () => void
  submitText?: string
}

export default function PersonForm({ onSubmit, onCancel, submitText = '등록' }: PersonFormProps) {
  const [formData, setFormData] = useState<PersonFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '남',
    memo: '',
    isLunar: false,
    isBirthTimeUnknown: false
  })
  const [birthDateInput, setBirthDateInput] = useState('')
  const [birthTimeInput, setBirthTimeInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 6) {
      setBirthDateInput(cleaned)
      if (cleaned.length === 6) {
        const formatted = parseYYMMDDToISO(cleaned)
        setFormData(prev => ({ ...prev, birthDate: formatted }))
      } else {
        setFormData(prev => ({ ...prev, birthDate: '' }))
      }
    }
  }

  const handleBirthTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 4) {
      setBirthTimeInput(cleaned)
      if (cleaned.length === 4) {
        const formatted = parseHHMMToTime(cleaned)
        setFormData(prev => ({ ...prev, birthTime: formatted }))
      } else {
        setFormData(prev => ({ ...prev, birthTime: '' }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.birthDate) {
      alert('이름과 생년월일은 필수입니다.')
      return
    }
    if (!formData.isBirthTimeUnknown && birthTimeInput && birthTimeInput.length !== 4) {
      alert('출생시간은 4자리로 입력해주세요. (예: 1430)')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ ...formData, birthTime: formData.isBirthTimeUnknown ? '' : formData.birthTime })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">이름 *</Label>
        <Input id="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      </div>

      {/* 성별 */}
      <div className="space-y-2">
        <Label>성별</Label>
        <RadioGroup value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as '남' | '여' })}>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="남" id="male" />
              <Label htmlFor="male">남성</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="여" id="female" />
              <Label htmlFor="female">여성</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* 생년월일 */}
      <div className="space-y-2">
        <Label htmlFor="birthDate">생년월일 * (6자리, YYMMDD)</Label>
        <div className="space-y-1">
          <Input id="birthDate" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={birthDateInput} onChange={handleBirthDateChange} placeholder="901225 (YYMMDD)" className="font-mono" required />
          {birthDateInput.length === 6 && formData.birthDate && (
            <p className="text-xs text-gray-500">→ {formData.birthDate}</p>
          )}
        </div>
      </div>

      {/* 옵션 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="isLunar" checked={formData.isLunar} onCheckedChange={(c) => setFormData({ ...formData, isLunar: !!c })} />
          <Label htmlFor="isLunar">음력</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isBirthTimeUnknown" checked={formData.isBirthTimeUnknown} onCheckedChange={(c) => setFormData({ ...formData, isBirthTimeUnknown: !!c, birthTime: '' })} />
          <Label htmlFor="isBirthTimeUnknown">출생 시간 모름</Label>
        </div>
      </div>

      {/* 출생 시간 */}
      {!formData.isBirthTimeUnknown && (
        <div className="space-y-2">
          <Label htmlFor="birthTime">출생 시간 (4자리, HHMM)</Label>
          <div className="space-y-1">
            <Input id="birthTime" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={birthTimeInput} onChange={handleBirthTimeChange} placeholder="1430 (HHMM)" className="font-mono" />
            {birthTimeInput.length === 4 && formData.birthTime && (
              <p className="text-xs text-gray-500">→ {formData.birthTime}</p>
            )}
          </div>
        </div>
      )}

      {/* 메모 */}
      <div className="space-y-2">
        <Label htmlFor="memo">메모</Label>
        <Textarea id="memo" value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} rows={3} placeholder="추가 정보를 입력하세요" />
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">취소</Button>
        )}
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={submitting}>
          {submitting ? '처리 중...' : submitText}
        </Button>
      </div>
    </form>
  )
}

