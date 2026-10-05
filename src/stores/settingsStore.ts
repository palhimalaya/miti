import { create } from 'zustand'
import {
  loadSettings,
  saveSetting,
  type AppSettings,
} from '@/src/db/repositories/settings'
import { normalizeSpecialDay, type SpecialDay } from '@/src/features/calendar/easterEgg'

type SettingsState = AppSettings & {
  hydrated: boolean
  hydrate: () => Promise<void>
  setNumeralSystem: (value: AppSettings['numeralSystem']) => Promise<void>
  setTheme: (value: AppSettings['theme']) => Promise<void>
  setUiLanguage: (value: AppSettings['uiLanguage']) => Promise<void>
  setWidgetShowPersonal: (value: boolean) => Promise<void>
  setShowTodayNotificationBar: (value: boolean) => Promise<void>
  setSpecialDay: (value: SpecialDay | null) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  numeralSystem: 'devanagari',
  theme: 'system',
  uiLanguage: 'bilingual',
  weekStartsOn: 0,
  widgetShowPersonal: false,
  showTodayNotificationBar: false,
  timezonePolicy: 'asia_kathmandu',
  specialDay: null,
  hydrated: false,
  hydrate: async () => {
    const settings = await loadSettings()
    set({ ...settings, hydrated: true })
  },
  setNumeralSystem: async (value) => {
    await saveSetting('numeralSystem', value)
    set({ numeralSystem: value })
  },
  setTheme: async (value) => {
    await saveSetting('theme', value)
    set({ theme: value })
  },
  setUiLanguage: async (value) => {
    await saveSetting('uiLanguage', value)
    set({ uiLanguage: value })
  },
  setWidgetShowPersonal: async (value) => {
    await saveSetting('widgetShowPersonal', value)
    set({ widgetShowPersonal: value })
  },
  setShowTodayNotificationBar: async (value) => {
    await saveSetting('showTodayNotificationBar', value)
    set({ showTodayNotificationBar: value })
  },
  setSpecialDay: async (value) => {
    const next = value
      ? normalizeSpecialDay({
          bsMonth: value.bsMonth,
          bsDay: value.bsDay,
          note: value.note,
        })
      : null
    await saveSetting('specialDay', next)
    set({ specialDay: next })
  },
}))
