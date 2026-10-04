import { migrateDatabase } from '@/src/db/migrate'
import { seedDatabase } from '@/src/db/seed'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { useCalendarStore } from '@/src/stores/calendarStore'
import { refreshWidgets } from '@/src/features/widget/refreshWidgets'
import { ensureNotificationPermissions } from '@/src/services/notifications'

export async function bootstrapApp() {
  migrateDatabase()
  await seedDatabase()
  await useSettingsStore.getState().hydrate()
  await useCalendarStore.getState().init()
  try {
    await ensureNotificationPermissions()
  } catch (error) {
    console.warn('[miti] notification permission skipped:', error)
  }
  // Widgets require a native dev build; never fail app startup in Expo Go.
  await refreshWidgets()
}
