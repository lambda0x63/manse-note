import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateSaju } from '@/lib/saju'
import { checkApiAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// GET: 인물 목록 조회
export async function GET(request: NextRequest) {
  // 인증 체크
  if (!checkApiAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const persons = await prisma.person.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(persons || [])
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch persons' },
      { status: 500 }
    )
  }
}

// POST: 새 인물 등록
export async function POST(request: NextRequest) {
  // 인증 체크
  if (!checkApiAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const Schema = z.object({
      name: z.string().min(1),
      birthDate: z.string().min(8),
      birthTime: z.string().nullable().optional(),
      gender: z.enum(['남', '여']),
      memo: z.string().optional().default(''),
      isBirthTimeUnknown: z.boolean().optional().default(false),
      isLunar: z.boolean().optional().default(false)
    })
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { name, birthDate, birthTime, gender, memo, isBirthTimeUnknown, isLunar } = parsed.data
    
    // 만세력 계산
    const personData = calculateSaju(
      name,
      new Date(birthDate),
      isBirthTimeUnknown ? undefined : (birthTime ?? undefined),
      gender,
      memo
    )
    
    const person = await prisma.person.create({
      data: {
        name: personData.name,
        birthDate: personData.birthDate,
        birthTime: personData.birthTime,
        gender: personData.gender,
        memo: personData.memo,
        saju: personData.saju as Prisma.InputJsonValue,
        tenGods: personData.tenGods as Prisma.InputJsonValue,
        shinsal: personData.shinsal as Prisma.InputJsonValue,
        fortuneStartAge: personData.fortuneStartAge,
        fortunes: personData.fortunes as Prisma.InputJsonValue,
        reliability: personData.reliability,
        warnings: personData.warnings,
        isBirthTimeUnknown: personData.isBirthTimeUnknown || false,
        isLunar: isLunar || false
      }
    })
    
    return NextResponse.json(person, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    )
  }
}
