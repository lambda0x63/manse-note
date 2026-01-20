import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkApiAuth } from '@/lib/auth'
import { calculateSaju } from '@/lib/saju'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// GET: 특정 인물 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 인증 체크
  if (!checkApiAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { id } = await params
    
    const person = await prisma.person.findUnique({
      where: { id }
    })
    
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }
    
    return NextResponse.json(person)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch person' },
      { status: 500 }
    )
  }
}

// PUT: 인물 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 인증 체크
  if (!checkApiAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { id } = await params
    const body = await request.json()
    const Schema = z.object({
      name: z.string().min(1).optional(),
      birthDate: z.union([z.string(), z.date()]).optional(),
      birthTime: z.string().nullable().optional(),
      gender: z.enum(['남', '여']).optional(),
      memo: z.string().optional(),
      isBirthTimeUnknown: z.boolean().optional(),
      isLunar: z.boolean().optional()
    })
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data
    
    // 기존 person 정보 가져오기
    const existingPerson = await prisma.person.findUnique({
      where: { id }
    })
    
    if (!existingPerson) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }
    
    // 생년월일이나 출생시간이 변경된 경우 사주 재계산
    if (data.birthDate || data.birthTime !== undefined || data.isBirthTimeUnknown !== undefined) {
      const nextBirthDate: Date = data.birthDate
        ? (typeof data.birthDate === 'string' ? new Date(data.birthDate) : data.birthDate)
        : existingPerson.birthDate

      const nextBirthTime: string | undefined = data.isBirthTimeUnknown
        ? undefined
        : (data.birthTime ?? existingPerson.birthTime ?? undefined)

      const personData = calculateSaju(
        data.name || existingPerson.name,
        nextBirthDate,
        nextBirthTime,
        (data.gender as '남' | '여') || (existingPerson.gender as '남' | '여'),
        data.memo ?? existingPerson.memo ?? undefined
      )
      
      const person = await prisma.person.update({
        where: { id },
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
          isBirthTimeUnknown: data.isBirthTimeUnknown ?? existingPerson.isBirthTimeUnknown,
          isLunar: data.isLunar ?? existingPerson.isLunar
        }
      })
      
      return NextResponse.json(person)
    } else {
      // 사주 재계산이 필요없는 경우 단순 업데이트
      const person = await prisma.person.update({
        where: { id },
        data
      })
      
      return NextResponse.json(person)
    }
  } catch (error) {
    console.error('Error updating person:', error)
    return NextResponse.json(
      { error: 'Failed to update person' },
      { status: 500 }
    )
  }
}

// DELETE: 인물 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 인증 체크
  if (!checkApiAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { id } = await params
    
    await prisma.person.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete person' },
      { status: 500 }
    )
  }
}
