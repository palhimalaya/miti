import { eq } from 'drizzle-orm'
import { db } from '../client'
import { settings } from '../schema'
import type { NumeralSystem } from '@/src/utils/numerals'
import type { ThemeMode } from '@/src/theme'

export type AppSettings = {
  numeralSystem: NumeralSystem
  theme: ThemeMode | 'system'
  uiLanguage: 'bilingual' | 'np' | 'en'
  weekStartsOn: 0
  widgetShowPersonal: boolean
  timezonePolicy: 'asia_kathmandu'
}

const DEFAULTS: AppSettings = {
  numeralSystem: 'devanagari',
  theme: 'system',
  uiLanguage: 'bilingual',
  weekStartsOn: 0,
  widgetShowPersonal: false,
  timezonePolicy: 'asia_kathmandu',
}

function nowIso() {
  return new Date().toISOString()
}

async function getJson<T>(key: string, fallback: T): Promise<T> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
  const raw = rows[0]?.valueJson
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function loadSettings(): Promise<AppSettings> {
  return {
    numeralSystem: await getJson('numeral_system', DEFAULTS.numeralSystem),
    theme: await getJson('theme', DEFAULTS.theme),
    uiLanguage: await getJson('ui_language', DEFAULTS.uiLanguage),
    weekStartsOn: await getJson('week_starts_on', DEFAULTS.weekStartsOn),
    widgetShowPersonal: await getJson('widget_show_personal', DEFAULTS.widgetShowPersonal),
    timezonePolicy: await getJson('timezone_policy', DEFAULTS.timezonePolicy),
  }
}

export async function saveSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
) {
  const map: Record<keyof AppSettings, string> = {
    numeralSystem: 'numeral_system',
    theme: 'theme',
    uiLanguage: 'ui_language',
    weekStartsOn: 'week_starts_on',
    widgetShowPersonal: 'widget_show_personal',
    timezonePolicy: 'timezone_policy',
  }
  await db
    .insert(settings)
    .values({
      key: map[key],
      valueJson: JSON.stringify(value),
      updatedAt: nowIso(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        valueJson: JSON.stringify(value),
        updatedAt: nowIso(),
      },
    })
}
