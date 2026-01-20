'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageCircle, Send, Loader2, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSseChat } from '@/lib/chat/useSseChat'
import type { PersonWithSaju, SajuData, Fortune } from '@/types/saju'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialPersons: any[]
}

export default function ConsultClientPage({ initialPersons }: Props) {
  const persons: PersonWithSaju[] = useMemo(() => initialPersons.map((p) => ({
    ...p,
    birthDate: new Date(p.birthDate),
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  })), [initialPersons])

  const searchParams = useSearchParams()
  const initialId = searchParams.get('id')

  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(initialId)

  const filtered = persons.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
  const selected = persons.find(p => p.id === selectedId) || persons[0]

  type TenGods = NonNullable<PersonWithSaju['tenGods']>
  type ShinsalT = PersonWithSaju['shinsal']
  type ChatContext = { name: string; birthDate: string; birthTime: string | null; gender: string; saju: SajuData; tenGods?: TenGods; shinsal?: ShinsalT; fortunes?: Fortune[] }
  const { messages, setMessages, input, setInput, isLoading, send, onKeyDown } = useSseChat<ChatContext>({
    initialAssistantMessage: selected ? `${selected.name}님의 사주를 분석할 준비가 되었습니다. 궁금한 점을 자유롭게 물어보세요.` : '분석할 대상을 선택하세요.',
    buildContext: () => selected ? ({
      name: selected.name,
      birthDate: selected.birthDate.toISOString(),
      birthTime: selected.birthTime,
      gender: selected.gender,
      saju: selected.saju,
      tenGods: selected.tenGods,
      shinsal: selected.shinsal,
      fortunes: selected.fortunes,
    }) : ({ name: '', birthDate: '', birthTime: null, gender: '', saju: { day: { stem: '', branch: '' } } as unknown as SajuData }),
  })

  useEffect(() => {
    if (selected) {
      // 선택 변경 시 대화 초기화
      setMessages([{ id: '1', role: 'assistant', content: `${selected.name}님의 사주를 분석할 준비가 되었습니다. 궁금한 점을 자유롭게 물어보세요.`, timestamp: new Date() }])
      setInput('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 md:grid-cols-[300px_1fr_340px] gap-4">
        {/* Sidebar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 h-[80vh] md:sticky md:top-6">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름 검색"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="overflow-y-auto h-[calc(80vh-48px)] pr-1 space-y-1">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  selected?.id === p.id ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.saju?.day?.stem}{p.saju?.day?.branch}</div>
                </div>
                <div className="text-xs text-gray-500">{new Date(p.birthDate).toLocaleDateString('ko-KR')}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-6">검색 결과가 없습니다</div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div>
          <Card>
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <div className="font-semibold">AI 상담</div>
                </div>
                {selected && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    대상: <span className="font-semibold">{selected.name}</span>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="mt-0.5">
                        {message.role === 'assistant' ? (
                          <Image src="/yinyang.png" alt="AI" width={28} height={28} className="rounded-full bg-white p-1 shadow-sm" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white">나</div>
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

              {/* Input */}
              <div className="border-t p-4 space-y-3">
                <div className="flex gap-2">
                  <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="질문을 입력하세요..." className="flex-1 min-h-[50px] max-h-[120px] resize-none" disabled={isLoading || !selected} />
                  <Button onClick={() => void send()} disabled={!input.trim() || isLoading || !selected} className="self-end">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setInput('이 사람의 전체적인 특징을 분석해주세요')}>전체 분석</Button>
                  <Button variant="outline" size="sm" onClick={() => setInput('오행과 십성의 균형을 간단히 요약해주세요')}>오행/십성</Button>
                  <Button variant="outline" size="sm" onClick={() => setInput('현재 대운과 올해 세운이 미치는 영향을 알려주세요')}>대운/세운</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Saju Summary (right column) */}
        <div className="hidden md:block">
          {selected && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">분석 대상</div>
                  <div className="font-semibold">{selected.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-center">
                    <div className="text-xs text-gray-500">년</div>
                    <div className="text-base font-bold">{selected.saju.year?.stem}{selected.saju.year?.branch}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-center">
                    <div className="text-xs text-gray-500">월</div>
                    <div className="text-base font-bold">{selected.saju.month?.stem}{selected.saju.month?.branch}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-center">
                    <div className="text-xs text-gray-500">일</div>
                    <div className="text-base font-bold">{selected.saju.day.stem}{selected.saju.day.branch}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-center">
                    <div className="text-xs text-gray-500">시</div>
                    <div className="text-base font-bold">{selected.saju.hour?.stem}{selected.saju.hour?.branch}</div>
                  </div>
                </div>
                {selected.shinsal?.all && selected.shinsal.all.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">신살(상위)</div>
                    <div className="flex flex-wrap gap-1">
                      {selected.shinsal.all.slice(0,3).map((s, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">{s.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
