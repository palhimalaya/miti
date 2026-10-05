import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { hideMitiTodayBar, showMitiTodayBar } from 'miti-today-bar'
import { getFestivalsForBsMonth, getFestivalsForBsDay } from '@/src/db/repositories/festivals'
import { listActiveEvents } from '@/src/db/repositories/events'
import { getKathmanduAdToday } from '@/src/services/kathmanduToday'
import { addBsDays, getToday } from '@/src/domain/calendar'
import { formatNumber } from '@/src/utils/numerals'

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

/** Persistent notification-shade toolbar with today’s BS date + day-number status icon. */
export async function showTodayNotificationBar() {
  if (Platform.OS !== 'android') return

  const granted = await ensureNotificationPermissions()
  if (!granted) return

  const today = getToday(getKathmanduAdToday())
  if (!today.ok) return
  const day = today.value
  const festivals = await getFestivalsForBsDay(day.bs.year, day.bs.month, day.bs.day)
  const festivalLine = festivals
    .slice(0, 3)
    .map((f) => f.titleEn || f.titleNp)
    .filter(Boolean)
    .join(' / ')
  const festivalNp = festivals
    .slice(0, 2)
    .map((f) => f.titleNp)
    .filter(Boolean)
    .join(' · ')

  // Hamro Patro–style: BS date title, festivals, Nepali line, AD date.
  const title = `${day.bs.monthNameEn} ${day.bs.day}, ${day.bs.year}`
  const body = [
    festivalLine || '—',
    festivalNp || `${day.bs.monthNameNp} ${formatNumber(day.bs.day, 'devanagari')}`,
    `${day.ad.monthNameEn.slice(0, 3)} ${day.ad.day}, ${day.ad.year}`,
  ].join('\n')

  await showMitiTodayBar(day.bs.day, title, body)
}

export async function hideTodayNotificationBar() {
  if (Platform.OS !== 'android') return
  await hideMitiTodayBar()
  // Clear any older expo-notifications sticky bar from previous builds.
  await Notifications.dismissNotificationAsync('miti-today-bar').catch(() => undefined)
  await Notifications.cancelScheduledNotificationAsync('miti-today-bar').catch(() => undefined)
}

export async function syncTodayNotificationBar(enabled: boolean) {
  if (enabled) {
    await showTodayNotificationBar()
  } else {
    await hideTodayNotificationBar()
  }
}

/** Schedule local reminders for tomorrow's festivals and personal events. */
export async function scheduleLocalReminders() {
  if (Platform.OS === 'web') return

  const granted = await ensureNotificationPermissions()
  if (!granted) return

  await Notifications.cancelScheduledNotificationAsync('miti-tomorrow-reminder').catch(
    () => undefined,
  )

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

  const triggerDate = new Date()
  triggerDate.setHours(triggerDate.getHours() + 12)

  await Notifications.scheduleNotificationAsync({
    identifier: 'miti-tomorrow-reminder',
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
