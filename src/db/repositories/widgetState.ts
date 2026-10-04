import { eq } from 'drizzle-orm'
import { db } from '../client'
import { widgetState } from '../schema'
import type { BsDate } from '@/src/domain/calendar'

function nowIso() {
  return new Date().toISOString()
}

export type WidgetStateRow = {
  id: string
  visibleBsYear: number
  visibleBsMonth: number
  selectedBsYear: number | null
  selectedBsMonth: number | null
  selectedBsDay: number | null
  updatedAt: string
}

export async function getWidgetState(): Promise<WidgetStateRow | null> {
  const rows = await db.select().from(widgetState).where(eq(widgetState.id, 'default')).limit(1)
  return rows[0] ?? null
}

export async function saveWidgetState(input: {
  visibleBsYear: number
  visibleBsMonth: number
  selected?: BsDate | null
}) {
  await db
    .insert(widgetState)
    .values({
      id: 'default',
      visibleBsYear: input.visibleBsYear,
      visibleBsMonth: input.visibleBsMonth,
      selectedBsYear: input.selected?.year ?? null,
      selectedBsMonth: input.selected?.month ?? null,
      selectedBsDay: input.selected?.day ?? null,
      updatedAt: nowIso(),
    })
    .onConflictDoUpdate({
      target: widgetState.id,
      set: {
        visibleBsYear: input.visibleBsYear,
        visibleBsMonth: input.visibleBsMonth,
        selectedBsYear: input.selected?.year ?? null,
        selectedBsMonth: input.selected?.month ?? null,
        selectedBsDay: input.selected?.day ?? null,
        updatedAt: nowIso(),
      },
    })
}
