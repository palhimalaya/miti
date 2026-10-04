import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../client'
import { events } from '../schema'
import { createId } from '@/src/utils/id'
import type { AdDate, BsDate } from '@/src/domain/calendar'
import { adToBs, bsToAd } from '@/src/domain/calendar'

export type EventType =
  | 'personal'
  | 'reminder'
  | 'birthday'
  | 'anniversary'
  | 'appointment'
  | 'custom'

export type PersonalEvent = {
  id: string
  title: string
  notes: string | null
  type: string
  calendarBasis: string
  bsYear: number | null
  bsMonth: number
  bsDay: number
  adYear: number
  adMonth: number
  adDay: number
  importance: number
  recurrenceJson: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

function nowIso() {
  return new Date().toISOString()
}

export async function getEventsForBsDay(
  bsYear: number,
  bsMonth: number,
  bsDay: number,
): Promise<PersonalEvent[]> {
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.bsYear, bsYear),
        eq(events.bsMonth, bsMonth),
        eq(events.bsDay, bsDay),
        isNull(events.deletedAt),
      ),
    )
}

export async function listActiveEvents(): Promise<PersonalEvent[]> {
  return db.select().from(events).where(isNull(events.deletedAt))
}

export async function createEvent(input: {
  title: string
  notes?: string
  type: EventType
  calendarBasis: 'bs' | 'ad'
  bs?: BsDate
  ad?: AdDate
}): Promise<PersonalEvent> {
  let bs = input.bs
  let ad = input.ad

  if (input.calendarBasis === 'bs') {
    if (!bs) throw new Error('BS date required')
    const converted = bsToAd(bs)
    if (!converted.ok) throw new Error(converted.error.message)
    ad = converted.value
  } else {
    if (!ad) throw new Error('AD date required')
    const converted = adToBs(ad)
    if (!converted.ok) throw new Error(converted.error.message)
    bs = converted.value
  }

  const stamp = nowIso()
  const row = {
    id: createId(),
    title: input.title.trim(),
    notes: input.notes?.trim() || null,
    type: input.type,
    calendarBasis: input.calendarBasis,
    bsYear: bs!.year,
    bsMonth: bs!.month,
    bsDay: bs!.day,
    adYear: ad!.year,
    adMonth: ad!.month,
    adDay: ad!.day,
    importance: 3,
    recurrenceJson: null,
    metadataJson: null,
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
    ownerId: null,
  }

  await db.insert(events).values(row)
  return row
}

export async function softDeleteEvent(id: string) {
  await db
    .update(events)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(eq(events.id, id))
}
