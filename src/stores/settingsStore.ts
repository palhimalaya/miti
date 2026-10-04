import { create } from 'zustand'
import {
  loadSettings,
  saveSetting,
  type AppSettings,
} from '@/src/db/repositories/settings'

type SettingsState = AppSettings & {
  hydrated: boolean
  hydrate: () => Promise<void>
  setNumeralSystem: (value: AppSettings['numeralSystem']) => Promise<void>
  setTheme: (value: AppSettings['theme']) => Promise<void>
  setUiLanguage: (value: AppSettings['uiLanguage']) => Promise<void>
  setWidgetShowPersonal: (value: boolean) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  numeralSystem: 'devanagari',
  theme: 'system',
  uiLanguage: 'bilingual',
  weekStartsOn: 0,
  widgetShowPersonal: false,
  timezonePolicy: 'asia_kathmandu',
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
}))
