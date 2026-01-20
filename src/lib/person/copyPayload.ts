import type { PersonWithSaju } from '@/types/saju'
import { calculateYearlyFortunesWithAge } from '@/lib/saju/yearly-fortune'
import { getAge } from '@/lib/date/age'

export function buildCopyPayload(person: PersonWithSaju) {
  const birthDate = typeof person.birthDate === 'string' ? new Date(person.birthDate) : person.birthDate
  const age = getAge(birthDate)

  const currentYear = new Date().getFullYear()
  const yearlyFortunes = calculateYearlyFortunesWithAge(birthDate, currentYear)

  const currentFortune = person.fortunes?.find(f => age >= f.startAge && age <= f.endAge)
  const currentYearlyFortune = yearlyFortunes.find(y => y.isCurrent)

  return {
    name: person.name,
    birthDate: birthDate.toISOString(),
    birthTime: person.birthTime,
    gender: person.gender,
    age,
    saju: {
      year: person.saju.year,
      month: person.saju.month,
      day: person.saju.day,
      hour: person.saju.hour
    },
    tenGods: person.tenGods || null,
    shinsal: person.shinsal || null,
    currentFortune: currentFortune
      ? { stem: currentFortune.stem, branch: currentFortune.branch, age: `${currentFortune.startAge}-${currentFortune.endAge}` }
      : null,
    currentYearlyFortune: currentYearlyFortune
      ? { year: currentYearlyFortune.year, stem: currentYearlyFortune.stem, branch: currentYearlyFortune.branch }
      : null,
    memo: person.memo
  }
}

