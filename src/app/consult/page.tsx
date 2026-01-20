import { prisma } from '@/lib/db'
import { isServerAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ConsultClientPage from './consult-client'

export default async function ConsultPage() {
  const isAuth = await isServerAuthenticated()
  if (!isAuth) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let persons: any[] = []
  try {
    const dbPersons = await prisma.person.findMany({ orderBy: { createdAt: 'desc' } })
    persons = dbPersons.map((p) => ({
      ...p,
      birthDate: p.birthDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  } catch (e) {
    console.error('Failed to fetch persons for consult:', e)
  }

  return <ConsultClientPage initialPersons={persons} />
}

