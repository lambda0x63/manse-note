import { useCallback, useMemo, useRef, useState } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UseSseChatOptions<TContext> {
  initialAssistantMessage: string
  buildContext: () => TContext
}

export function useSseChat<TContext>({ initialAssistantMessage, buildContext }: UseSseChatOptions<TContext>) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    role: 'assistant',
    content: initialAssistantMessage,
    timestamp: new Date(),
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const tempAssistantIdRef = useRef<string | null>(null)

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const tempId = (Date.now() + 1).toString()
    tempAssistantIdRef.current = tempId
    setMessages(prev => [...prev, { id: tempId, role: 'assistant', content: '', timestamp: new Date() }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
      })
      if (!response.ok || !response.body) throw new Error('Failed to get response')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          while (true) {
            const lineEnd = buffer.indexOf('\n')
            if (lineEnd === -1) break
            const line = buffer.slice(0, lineEnd).trim()
            buffer = buffer.slice(lineEnd + 1)
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulated += parsed.content
                const id = tempAssistantIdRef.current
                if (id) {
                  setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: accumulated } : msg))
                }
              }
            } catch {
              // ignore partial lines
            }
          }
        }
      } finally {
        reader.cancel().catch(() => {})
      }
    } catch {
      const id = tempAssistantIdRef.current
      if (id) {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' } : msg))
      }
    } finally {
      setIsLoading(false)
    }
  }, [buildContext, input, isLoading, messages])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }, [send])

  const api = useMemo(() => ({ messages, setMessages, input, setInput, isLoading, send, onKeyDown }), [messages, input, isLoading, send, onKeyDown])
  return api
}
