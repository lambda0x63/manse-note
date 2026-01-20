'use client'

import { useState } from 'react'
import { Clock, AlertCircle, Trash2, Calendar, Edit, Copy, X, StickyNote, MessageCircle, User, Send, Loader2, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { PersonWithSaju } from '@/types/saju'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SajuTable } from '@/components/SajuTable'
import { FortuneScroll } from '@/components/FortuneScroll'
import { calculateYearlyFortunesWithAge } from '@/lib/saju/yearly-fortune'
import { calculateTenGod, calculateBranchTenGod } from '@/lib/saju/ten-gods'
import EditPersonModal from '@/components/EditPersonModal'
import { motion, AnimatePresence } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'
import { getAge } from '@/lib/date/age'
import { buildCopyPayload } from '@/lib/person/copyPayload'
import { useSseChat } from '@/lib/chat/useSseChat'

interface PersonDetailProps {
  person: PersonWithSaju
  onClose: () => void
  onDelete?: (id: string) => Promise<void>
  onUpdate?: () => void
}

export function PersonDetail({ person, onClose, onDelete, onUpdate }: PersonDetailProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showMemo, setShowMemo] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [globalMemo, setGlobalMemo] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('saju-study-memo') || ''
    return ''
  })

  // Chat state via shared hook
  const { messages, input, setInput, isLoading, send, onKeyDown } = useSseChat({
    initialAssistantMessage: `${person.name}님의 사주를 분석할 준비가 되었습니다. 궁금한 점을 자유롭게 물어보세요.`,
    buildContext: () => ({
      name: person.name,
      birthDate: person.birthDate,
      birthTime: person.birthTime,
      gender: person.gender,
      saju: person.saju,
      tenGods: person.tenGods,
      shinsal: person.shinsal,
      fortunes: person.fortunes
    })
  })

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      if (onDelete) {
        await onDelete(person.id)
        onClose()
      }
    }
  }

  const birthDate = typeof person.birthDate === 'string' ? new Date(person.birthDate) : person.birthDate
  const age = getAge(birthDate)

  const currentYear = new Date().getFullYear()
  const yearlyFortunes = calculateYearlyFortunesWithAge(birthDate, currentYear)
  const currentFortune = person.fortunes?.find(f => age >= f.startAge && age <= f.endAge)

  const handleCopyInfo = () => {
    const payload = buildCopyPayload(person)
    const copyText = JSON.stringify(payload, null, 2)
    navigator.clipboard.writeText(copyText).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  const handleMemoSave = () => {
    if (typeof window !== 'undefined') localStorage.setItem('saju-study-memo', globalMemo)
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Wrapper: full screen content */}
        <div className="h-full overflow-y-auto">
          {/* Desktop/tablet shell: full screen */}
          <div className="hidden md:block h-full">
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="h-full"
            >
              <Card className="h-full bg-card rounded-none">
                <CardHeader className="sticky top-0 z-10 bg-card border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                      </Button>
                      <div>
                        <div className="flex items-center gap-3">
                          <h1 className="text-2xl font-bold">{person.name}</h1>
                          <Badge variant="secondary">{age}세</Badge>
                          <Badge variant="outline">{person.gender}</Badge>
                          {person.isLunar && <Badge variant="outline">음력</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{birthDate.toLocaleDateString('ko-KR')}</span>
                          {person.birthTime && <span>{person.birthTime}</span>}
                          <span className="text-primary font-medium">일주: {person.saju.day.stem}{person.saju.day.branch}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => setShowChat(!showChat)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" /> 
                        {showChat ? 'AI 상담 닫기' : 'AI 상담'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> 수정
                      </Button>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowMoreMenu(!showMoreMenu)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {showMoreMenu && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                            <button
                              onClick={() => { setShowMemo(!showMemo); setShowMoreMenu(false); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <StickyNote className="h-4 w-4" /> 메모장
                            </button>
                            <button
                              onClick={() => { handleCopyInfo(); setShowMoreMenu(false); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Copy className="h-4 w-4" /> {copySuccess ? '복사됨!' : '정보 복사'}
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button
                              onClick={() => { handleDelete(); setShowMoreMenu(false); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" /> 삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
                  <div className={`grid grid-cols-1 xl:grid-cols-2 gap-8`}>
                    {/* Left column */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>사주팔자</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SajuTable saju={person.saju} tenGods={person.tenGods} shinsal={person.shinsal} />
                        </CardContent>
                      </Card>

                      {person.isBirthTimeUnknown && (
                        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800 dark:text-orange-200">
                            출생 시간이 입력되지 않아 시주(時柱)가 표시되지 않습니다.
                          </AlertDescription>
                        </Alert>
                      )}

                      
                    </div>

                    {/* Right column: fortunes or chat */}
                    <div className="space-y-6">
                      {!showChat ? (
                        <>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="h-4 w-4" /> 대운
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <FortuneScroll
                                items={person.fortunes?.map(f => ({
                                  stem: f.stem,
                                  branch: f.branch,
                                  startAge: f.startAge,
                                  endAge: f.endAge,
                                  isCurrent: currentFortune?.startAge === f.startAge,
                                  tenGodStem: calculateTenGod(person.saju.day.stem, f.stem),
                                  tenGodBranch: calculateBranchTenGod(person.saju.day.stem, f.branch)
                                })) || []}
                                currentAge={age}
                                color="blue"
                              />
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4" /> 세운
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <FortuneScroll
                                items={yearlyFortunes.map(y => ({
                                  stem: y.stem,
                                  branch: y.branch,
                                  year: y.year,
                                  age: y.age,
                                  isCurrent: y.isCurrent,
                                  tenGodStem: calculateTenGod(person.saju.day.stem, y.stem),
                                  tenGodBranch: calculateBranchTenGod(person.saju.day.stem, y.branch)
                                }))}
                                color="purple"
                              />
                            </CardContent>
                          </Card>
                        </>
                      ) : (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" /> AI 상담
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="h-[520px] overflow-y-auto pr-1">
                                <div className="space-y-4">
                                  {messages.map((message) => (
                                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className="flex gap-2 max-w-[85%]">
                                        <div className="mt-0.5">
                                          {message.role === 'assistant' ? (
                                            <Image src="/yinyang.png" alt="AI" width={28} height={28} className="rounded-full bg-white p-1 shadow-sm" loading="lazy" />
                                          ) : (
                                            <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
                                              <User className="h-4 w-4 text-white" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className={`rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                                            {message.role === 'assistant' ? (
                                              <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                  {message.content || (isLoading ? '생각 중...' : '')}
                                                </ReactMarkdown>
                                              </div>
                                            ) : (
                                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="border-t pt-3">
                                <div className="flex gap-2">
                                  <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="이 사주에 대해 물어보세요..."
                                    className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                                    disabled={isLoading}
                                  />
                                  <Button onClick={() => void send()} disabled={!input.trim() || isLoading} className="self-end">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <Button variant="outline" size="sm" onClick={() => setInput('이 사주의 전체적인 특징을 분석해주세요')}>전체 분석</Button>
                                  <Button variant="outline" size="sm" onClick={() => setInput('오행의 균형은 어떤가요?')}>오행 균형</Button>
                                  <Button variant="outline" size="sm" onClick={() => setInput('현재 대운은 어떤 영향을 주나요?')}>대운 영향</Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Mobile full-screen chat overlay */}
          {showChat && (
            <motion.div 
              className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
            >
              <div className="h-full flex flex-col">
                <header className="flex items-center justify-between px-4 pt-safe pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold">AI 상담</span>
                  </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex gap-2 max-w-[90%]">
                        <div className="mt-0.5">
                          {message.role === 'assistant' ? (
                            <Image src="/yinyang.png" alt="AI" width={28} height={28} className="rounded-full bg-white p-1 shadow-sm" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                            {message.role === 'assistant' ? (
                              <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content || (isLoading ? '생각 중...' : '')}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-4 space-y-3">
                  <div className="flex gap-2">
                    <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="이 사주에 대해 물어보세요..." className="flex-1 min-h-[50px] max-h-[120px] resize-none text-sm" disabled={isLoading} />
                    <Button onClick={() => void send()} disabled={!input.trim() || isLoading} size="icon">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {/* Mobile full-screen variant */}
          <div className="md:hidden">
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-4 pt-safe pb-3 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-bold">{person.name}</h1>
                      <Badge variant="secondary" className="text-xs">{age}세</Badge>
                      <Badge variant="outline" className="text-xs">{person.gender}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {birthDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })} 
                      {person.birthTime && ` ${person.birthTime}`}
                      {person.isLunar && ' (음력)'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant={showChat ? "default" : "ghost"} 
                    size="icon" 
                    onClick={() => setShowChat(!showChat)} 
                    className={showChat ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </header>

            <div className="px-5 py-6 space-y-6 max-w-5xl mx-auto">

              <SajuTable saju={person.saju} tenGods={person.tenGods} shinsal={person.shinsal} />

              {person.isBirthTimeUnknown && (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">출생 시간이 입력되지 않아 시주(時柱)가 표시되지 않습니다.</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold mb-2"><Clock className="h-4 w-4" /> 대운</div>
                  <FortuneScroll
                    items={person.fortunes?.map(f => ({ stem: f.stem, branch: f.branch, startAge: f.startAge, endAge: f.endAge, isCurrent: currentFortune?.startAge === f.startAge, tenGodStem: calculateTenGod(person.saju.day.stem, f.stem), tenGodBranch: calculateBranchTenGod(person.saju.day.stem, f.branch) })) || []}
                    currentAge={age}
                    color="blue"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold mb-2"><Calendar className="h-4 w-4" /> 세운</div>
                  <FortuneScroll
                    items={yearlyFortunes.map(y => ({ stem: y.stem, branch: y.branch, year: y.year, age: y.age, isCurrent: y.isCurrent, tenGodStem: calculateTenGod(person.saju.day.stem, y.stem), tenGodBranch: calculateBranchTenGod(person.saju.day.stem, y.branch) }))}
                    color="purple"
                  />
                </div>
              </div>

              {/* Chat Panel */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Image src="/yinyang.png" alt="AI" width={24} height={24} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">AI 상담</span>
                </div>
                <div className="space-y-4">
                  <div className="max-h-[50vh] overflow-y-auto pr-1">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className="flex gap-2 max-w-[90%]">
                            <div className="mt-0.5">
                              {message.role === 'assistant' ? (
                                <Image src="/yinyang.png" alt="AI" width={28} height={28} className="rounded-full bg-white p-1 shadow-sm" loading="lazy" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                                {message.role === 'assistant' ? (
                                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {message.content || (isLoading ? '생각 중...' : '')}
                                    </ReactMarkdown>
                                  </div>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="이 사주에 대해 물어보세요..."
                        className="flex-1 min-h-[50px] max-h-[100px] resize-none text-sm"
                        disabled={isLoading}
                      />
                      <Button onClick={() => void send()} disabled={!input.trim() || isLoading} size="icon">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="text-xs min-h-[44px] px-3" onClick={() => setInput('이 사주의 전체적인 특징을 분석해주세요')}>전체 분석</Button>
                      <Button variant="outline" size="sm" className="text-xs min-h-[44px] px-3" onClick={() => setInput('오행의 균형은 어떤가요?')}>오행 균형</Button>
                      <Button variant="outline" size="sm" className="text-xs min-h-[44px] px-3" onClick={() => setInput('현재 대운은 어떤 영향을 주나요?')}>대운 영향</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit modal */}
        {isEditModalOpen && (
          <EditPersonModal
            person={person}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={() => {
              setIsEditModalOpen(false)
              if (onUpdate) onUpdate()
            }}
          />
        )}

        {/* Floating memo (desktop only, when chat hidden) */}
        {!showChat && showMemo && (
          <div className="hidden md:block">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-4 right-4 w-96 z-50">
              <Card className="shadow-xl border-yellow-400 bg-yellow-50 dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><StickyNote className="h-4 w-4" /> 공부 메모장</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowMemo(false)}><X className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={globalMemo} onChange={(e) => setGlobalMemo(e.target.value)} onBlur={handleMemoSave} placeholder="사주 공부 내용을 메모하세요..." className="min-h-[200px] bg-white dark:bg-gray-900" />
                  <p className="text-xs text-gray-500 mt-2">* 자동 저장됩니다</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
