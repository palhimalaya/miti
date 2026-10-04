import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { getFestivalsForBsMonth } from '@/src/db/repositories/festivals'
import { listActiveEvents } from '@/src/db/repositories/events'
import { getKathmanduAdToday } from '@/src/services/kathmanduToday'
import { addBsDays, getToday } from '@/src/domain/calendar'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export async function ensureNotificationPermissions() {
  if (Platform.OS === 'web') return false
  const settings = await Notifications.getPermissionsAsync()
  if (settings.granted) return true
  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted
}

/** Schedule local reminders for tomorrow's festivals and personal events. */
export async function scheduleLocalReminders() {
  if (Platform.OS === 'web') return

  const granted = await ensureNotificationPermissions()
  if (!granted) return

  await Notifications.cancelAllScheduledNotificationsAsync()

  const today = getToday(getKathmanduAdToday())
  if (!today.ok) return
  const tomorrow = addBsDays(today.value.bs, 1)
  if (!tomorrow.ok) return

  const festivals = await getFestivalsForBsMonth(tomorrow.value.year, tomorrow.value.month)
  const dayFestivals = festivals.filter((f) => f.bsDay === tomorrow.value.day)
  const events = await listActiveEvents()
  const dayEvents = events.filter(
    (e) =>
      e.bsYear === tomorrow.value.year &&
      e.bsMonth === tomorrow.value.month &&
      e.bsDay === tomorrow.value.day,
  )

  const titles = [
    ...dayFestivals.map((f) => f.titleNp || f.titleEn || 'Festival'),
    ...dayEvents.map((e) => e.title),
  ]

  if (titles.length === 0) return

  // Fire roughly next Kathmandu morning (09:00) — best-effort local schedule.
  const triggerDate = new Date()
  triggerDate.setHours(triggerDate.getHours() + 12)

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Miti — Tomorrow',
      body: titles.slice(0, 3).join(' · '),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  })
}
