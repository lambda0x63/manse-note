import { prisma } from '@/lib/db'
import { isServerAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ClientPage } from './client-page'

export default async function MainPage() {
  const isAuth = await isServerAuthenticated()
  
  if (!isAuth) {
    redirect('/login')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let persons: any[] = []
  try {
    const dbPersons = await prisma.person.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    persons = dbPersons.map((person) => ({
      ...person,
      birthDate: person.birthDate.toISOString(),
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('Failed to fetch persons:', error)
  }

  return <ClientPage initialPersons={persons} />
}