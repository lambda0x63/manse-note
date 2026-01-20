import { NextRequest } from 'next/server'
import { isServerAuthenticated } from '@/lib/auth'
import { calculateYearlyFortunesWithAge } from '@/lib/saju/yearly-fortune'
import { getAge } from '@/lib/date/age'

const getLifeStage = (age: number) => {
  if (age <= 12) return '유년기'
  if (age <= 19) return '학창 시절'
  if (age <= 34) return '청년기'
  if (age <= 49) return '중년기'
  if (age <= 64) return '장년기'
  return '노년기'
}

const getLifeStageLabel = (startAge: number, endAge: number) => {
  const startStage = getLifeStage(startAge)
  const endStage = getLifeStage(endAge)
  return startStage === endStage ? startStage : `${startStage}→${endStage}`
}

export async function POST(request: NextRequest) {
  const isAuth = await isServerAuthenticated()
  
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { message, messages, context } = body

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const today = new Date()
    const currentDate = today.toISOString().split('T')[0]  // YYYY-MM-DD
    const currentYear = today.getFullYear()
    
    let systemPrompt = `당신은 자평명리학(子平命理學)을 바탕으로 궁통보감(窮通寶鑑)·적천수(滴天髓)·삼명통회(三命通會) 등의 고전 관법을 통합적으로 활용하는 명리학 전문가입니다.
현재 날짜: ${currentDate} (${currentYear}년)

기본 해석 흐름은 통관(通關)을 우선 확인해 천간과 지지가 서로 이어졌는지 살피고, 이어서 월령용사(月令用事)를 통해 일간이 월지에서 득령했는지와 계절 기운의 왕상휴수사(旺相休囚死) 상태를 판단합니다. 그 결과를 토대로 용신과 희신을 정하며 궁통보감·적천수에서 제시한 대표 용례를 필요에 따라 인용합니다. 십성(十星)은 일간을 중심으로 각 기둥이 던지는 질문을 읽어 가장 가능성 높은 통변을 제시하고, 운세 해석은 대운·세운을 이용해 과거나 경향성을 예측합니다. 신살(神殺)은 보조 참고로 적절히 통변내용에 덧대어서 활용될수있는 신살일경우 활용합니다.

서버에서 추가로 전달하는 절입 기준 여부, 타임존과 일광절약제, 자시 경계 주의 문구, 대운·세운 산출 방식, 지장간표와 통근 여부, 십이운성, 천간과 지지의 합·충·형·파·해·원진 요약, 조후 라벨, 종격 가능성은 모두 신뢰 가능한 전처리 결과입니다. 해당 정보는 이미 판정된 사실이므로 그대로 근거로 삼고, 표 형태로 제공되는 값은 다시 나열하지 않습니다.

합충과 형·파·해를 다룰 때는 형과 충을 최우선으로 판단하고, 이어서 파와 해를 살핀 뒤 마지막으로 합을 검토합니다. 육합은 자축 토, 인해 목, 묘술 화, 진유 금, 사신 수, 오미 토로 간주하며, 천간합은 갑기 토·을경 금·병신 수·정임 목·무계 화의 다섯 쌍입니다. 삼합은 신자진 수국, 해묘미 목국, 인오술 화국, 사유축 금국으로 구성되며 둘만 존재할 때는 반드시 반합이라는 표현을 사용하고 계절 득세 여부를 근거로 힘을 설명합니다. 합은 먼저 합거로만 인정하고, 계절 득세와 통근·투간 세력, 간섭 부재 가운데 두 가지 이상이 충족될 때에만 합화로 승격시키며, 충이나 극이 합을 깨면 합화는 성립하지 않는다고 명시합니다. 다중 충이 겹칠 경우 월지 또는 득세 측이 우세한지를 근거로 충 성립 여부를 밝히고, 토(辰戌丑未)는 庫와 墓 성질로 인해 다른 작용에 의해 쉽게 변하니 최종 판정 전에 다시 확인합니다. 대운이나 세운이 원국의 합을 깨거나 새로운 형·충을 만든다면 해당 시기에 그 변화가 우선한다는 말을 덧붙입니다.`

    // 사주 컨텍스트가 있는 경우 추가
    if (context?.saju) {
      const { birthDate, gender, saju, tenGods, shinsal, fortunes } = context as {
        birthDate: string
        gender?: string
        saju: {
          year?: { stem: string; branch: string }
          month?: { stem: string; branch: string }
          day: { stem: string; branch: string }
          hour?: { stem: string; branch: string }
        }
        tenGods?: {
          yearStem?: string
          yearBranch?: string
          monthStem?: string
          monthBranch?: string
          dayBranch?: string
          hourStem?: string
          hourBranch?: string
        }
        shinsal?: {
          all?: Array<{
            name: string
            nameHanja: string
            position: string[]
            description: string
            category: string
            count?: number
          }>
        }
        fortunes?: Array<{
          startAge: number
          endAge: number
          stem: string
          branch: string
        }>
      }
      
      // 현재 나이 계산
      const birthDateObj = new Date(birthDate)
      const age = getAge(birthDateObj)
      const currentLifeStage = getLifeStage(age)
      const fortuneList = fortunes || []
      const fortunesWithStage = fortuneList.map(fortune => ({
        ...fortune,
        lifeStage: getLifeStageLabel(fortune.startAge, fortune.endAge)
      }))
      const fortuneStageSummary = fortunesWithStage.length
        ? fortunesWithStage
            .map(f => `${f.startAge}-${f.endAge}세 ${f.stem}${f.branch} (${f.lifeStage})`)
            .join('\n    ')
        : '자료 없음'
      
      // 현재 대운 찾기
      const currentFortune = fortunes?.find(f => age >= f.startAge && age <= f.endAge)
      const currentFortuneStage = currentFortune
        ? getLifeStageLabel(currentFortune.startAge, currentFortune.endAge)
        : undefined
      
      // 세운 계산 (현재 년도 기준 앞뒤 5년)
      const yearlyFortunes = calculateYearlyFortunesWithAge(birthDateObj, currentYear)
      const currentYearlyFortune = yearlyFortunes.find(y => y.isCurrent)
      const nextYearFortune = yearlyFortunes.find(y => y.year === currentYear + 1)
      const prevYearFortune = yearlyFortunes.find(y => y.year === currentYear - 1)
      
      // (참고용 계산 로직은 제거 - 미사용 변수 린트 경고 방지)

      const monthBranch = saju.month?.branch || ''

      systemPrompt += `

=== 분석 대상 개요 ===
■ 핵심 좌표
  일주(日柱): ${saju.day.stem}${saju.day.branch}
  월지(月支): ${monthBranch}
  일간(日干): ${saju.day.stem}
  성별: ${gender || '-'}

■ 원국 구성
  년주: ${saju.year?.stem || ''}${saju.year?.branch || ''}
  월주: ${saju.month?.stem || ''}${saju.month?.branch || ''}
  일주: ${saju.day.stem}${saju.day.branch} ← 기준축
  시주: ${saju.hour?.stem || ''}${saju.hour?.branch || ''}

■ 십성 배치 요약
  천간: 년(${tenGods?.yearStem || '-'})·월(${tenGods?.monthStem || '-'})·시(${tenGods?.hourStem || '-'})
  지지: 년(${tenGods?.yearBranch || '-'})·월(${tenGods?.monthBranch || '-'})·일(${tenGods?.dayBranch || '-'})·시(${tenGods?.hourBranch || '-'})

■ 인생 시기 메모
  만나이: 만 ${age}세 (${currentLifeStage})
  대운 시기표:
    ${fortuneStageSummary}

■ 운세 흐름 메모
  현재 대운: ${currentFortune ? `${currentFortune.startAge}-${currentFortune.endAge}세 ${currentFortune.stem}${currentFortune.branch}${currentFortuneStage ? ` (${currentFortuneStage})` : ''}` : '-'}
  ${currentYearlyFortune ? `${currentYearlyFortune.year}년 세운: ${currentYearlyFortune.stem}${currentYearlyFortune.branch}` : ''}
  ${prevYearFortune ? `${prevYearFortune.year}년 세운: ${prevYearFortune.stem}${prevYearFortune.branch}` : ''}
  ${nextYearFortune ? `${nextYearFortune.year}년 세운: ${nextYearFortune.stem}${nextYearFortune.branch}` : ''}

■ 참고(신살)
  ${shinsal?.all?.length ? shinsal.all.slice(0, 3).map(s => s.name).join(', ') : '특이사항 없음'}

=== 분석 지시 ===
※ 대운을 해석할 때는 위 시기 정보를 활용하여 각 구간이 인생의 어느 단계인지(유년기·학창 시절·청년기·중년기·장년기·노년기 등) 명확히 밝히고, 해당 나이대의 현실적 상황을 가정해 통변을 진행합니다.
1. 위 핵심 좌표를 바탕으로 통관 여부와 월령 득령 상태를 우선 진단합니다.
2. 육합·삼합·충 정보를 활용하되, 위 합충 메모의 조건을 대입해 실제 화(化) 여부와 반합·교차충 등의 변수를 명확히 설명합니다.
3. 진단 결과를 토대로 용신·희신 후보와 십성 해석을 전개합니다.
4. 운세 흐름과 연결해 강화·절제해야 할 오행을 제안합니다.
5. 질문에 대한 답변은 반드시 이 분석 순서를 유지합니다.`
    }

    // 대화 내역 구성
    const conversationMessages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]
    
    // 이전 대화 내역이 있으면 추가 (최근 10개로 제한)
    if (messages && Array.isArray(messages)) {
      const recentMessages = messages.slice(-10)
      for (const msg of recentMessages) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversationMessages.push({
            role: msg.role,
            content: msg.content
          })
        }
      }
    }
    
    // 현재 메시지 추가
    conversationMessages.push({
      role: 'user',
      content: message
    })

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        'X-Title': 'Manse Note Saju Analysis',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'deepseek/deepseek-chat-v3.1',
        messages: conversationMessages,
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || '4000'),
        stream: true
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    // 스트리밍 응답 처리
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('Response body is not readable')
        }

        let buffer = ''

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

              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const delta = parsed.choices?.[0]?.delta
                  
                  // reasoning tokens 처리
                  if (delta?.reasoning) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ reasoning: delta.reasoning })}\n\n`))
                  }
                  
                  // 일반 content 처리
                  if (delta?.content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`))
                  }
                } catch (e) {
                  console.error('Failed to parse streaming data:', e)
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        } finally {
          reader.cancel()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat message' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
