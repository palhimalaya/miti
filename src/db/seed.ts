import seed from '@/src/data/festivals/seed.json'
import { db } from './client'
import { festivalDefinitions, festivalOccurrences, settings, widgetState } from './schema'
import { eq } from 'drizzle-orm'
import { getKathmanduAdToday } from '@/src/services/kathmanduToday'
import { adToBs, getToday } from '@/src/domain/calendar'

const SEED_VERSION = 'festivals-v2-hamropatro-2082-2083'

function nowIso() {
  return new Date().toISOString()
}

export async function seedDatabase() {
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'seed_version'))
    .limit(1)

  const current = existing[0]?.valueJson
  if (current === JSON.stringify(SEED_VERSION)) {
    await ensureWidgetState()
    return { seeded: false }
  }

  const stamp = nowIso()

  // Replace prior seed rows so obsolete occurrences (different ids/dates) do not linger.
  await db.delete(festivalOccurrences)
  await db.delete(festivalDefinitions)

  for (const def of seed.definitions) {
    await db
      .insert(festivalDefinitions)
      .values({
        id: def.id,
        titleEn: def.title_en,
        titleNp: def.title_np,
        descriptionEn: def.description_en ?? null,
        descriptionNp: def.description_np ?? null,
        type: def.type,
        importance: def.importance,
        metadataJson: null,
        createdAt: stamp,
        updatedAt: stamp,
      })
      .onConflictDoUpdate({
        target: festivalDefinitions.id,
        set: {
          titleEn: def.title_en,
          titleNp: def.title_np,
          descriptionEn: def.description_en ?? null,
          descriptionNp: def.description_np ?? null,
          type: def.type,
          importance: def.importance,
          updatedAt: stamp,
        },
      })
  }

  for (const occ of seed.occurrences) {
    await db
      .insert(festivalOccurrences)
      .values({
        id: occ.id,
        definitionId: occ.definition_id,
        bsYear: occ.bs_year,
        bsMonth: occ.bs_month,
        bsDay: occ.bs_day,
        adYear: occ.ad_year,
        adMonth: occ.ad_month,
        adDay: occ.ad_day,
        titleEn: occ.title_en,
        titleNp: occ.title_np,
        type: occ.type,
        importance: occ.importance,
        allDay: 1,
        source: occ.source,
        metadataJson: null,
        createdAt: stamp,
        updatedAt: stamp,
      })
      .onConflictDoUpdate({
        target: festivalOccurrences.id,
        set: {
          definitionId: occ.definition_id,
          bsYear: occ.bs_year,
          bsMonth: occ.bs_month,
          bsDay: occ.bs_day,
          adYear: occ.ad_year,
          adMonth: occ.ad_month,
          adDay: occ.ad_day,
          titleEn: occ.title_en,
          titleNp: occ.title_np,
          type: occ.type,
          importance: occ.importance,
          source: occ.source,
          updatedAt: stamp,
        },
      })
  }

  await upsertSetting('seed_version', SEED_VERSION)
  await upsertSetting('numeral_system', 'devanagari')
  await upsertSetting('theme', 'system')
  await upsertSetting('ui_language', 'bilingual')
  await upsertSetting('week_starts_on', 0)
  await upsertSetting('widget_show_personal', false)
  await upsertSetting('timezone_policy', 'asia_kathmandu')

  await ensureWidgetState()
  return { seeded: true }
}

async function upsertSetting(key: string, value: unknown) {
  const stamp = nowIso()
  await db
    .insert(settings)
    .values({
      key,
      valueJson: JSON.stringify(value),
      updatedAt: stamp,
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        valueJson: JSON.stringify(value),
        updatedAt: stamp,
      },
    })
}

async function ensureWidgetState() {
  const rows = await db.select().from(widgetState).where(eq(widgetState.id, 'default')).limit(1)
  if (rows[0]) return

  const ad = getKathmanduAdToday()
  const today = getToday(ad)
  if (!today.ok) {
    const fallbackBs = adToBs(ad)
    const bs = fallbackBs.ok ? fallbackBs.value : { year: 2083, month: 1, day: 1 }
    await db.insert(widgetState).values({
      id: 'default',
      visibleBsYear: bs.year,
      visibleBsMonth: bs.month,
      selectedBsYear: bs.year,
      selectedBsMonth: bs.month,
      selectedBsDay: bs.day,
      updatedAt: nowIso(),
    })
    return
  }

  await db.insert(widgetState).values({
    id: 'default',
    visibleBsYear: today.value.bs.year,
    visibleBsMonth: today.value.bs.month,
    selectedBsYear: today.value.bs.year,
    selectedBsMonth: today.value.bs.month,
    selectedBsDay: today.value.bs.day,
    updatedAt: nowIso(),
  })
}
