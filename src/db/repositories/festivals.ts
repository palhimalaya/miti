import { and, eq } from 'drizzle-orm'
import { db } from '../client'
import { festivalOccurrences } from '../schema'

export type FestivalOccurrence = {
  id: string
  definitionId: string | null
  bsYear: number
  bsMonth: number
  bsDay: number
  adYear: number
  adMonth: number
  adDay: number
  titleEn: string | null
  titleNp: string | null
  type: string
  importance: number
  source: string
}

export async function getFestivalsForBsMonth(
  bsYear: number,
  bsMonth: number,
): Promise<FestivalOccurrence[]> {
  return db
    .select()
    .from(festivalOccurrences)
    .where(
      and(eq(festivalOccurrences.bsYear, bsYear), eq(festivalOccurrences.bsMonth, bsMonth)),
    )
}

export async function getFestivalsForBsDay(
  bsYear: number,
  bsMonth: number,
  bsDay: number,
): Promise<FestivalOccurrence[]> {
  return db
    .select()
    .from(festivalOccurrences)
    .where(
      and(
        eq(festivalOccurrences.bsYear, bsYear),
        eq(festivalOccurrences.bsMonth, bsMonth),
        eq(festivalOccurrences.bsDay, bsDay),
      ),
    )
}

export function groupFestivalDays(occurrences: FestivalOccurrence[]): Set<string> {
  return new Set(
    occurrences.map(
      (item) =>
        `${item.bsYear}-${String(item.bsMonth).padStart(2, '0')}-${String(item.bsDay).padStart(2, '0')}`,
    ),
  )
}
