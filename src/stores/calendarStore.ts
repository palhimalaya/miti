import { create } from 'zustand'
import {
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  type BsDate,
  type CalendarDay,
  getMonth,
  getToday,
} from '@/src/domain/calendar'
import { getKathmanduAdToday } from '@/src/services/kathmanduToday'
import {
  getFestivalsForBsDay,
  getFestivalsForBsMonth,
  type FestivalOccurrence,
} from '@/src/db/repositories/festivals'
import { getEventsForBsDay, type PersonalEvent } from '@/src/db/repositories/events'
import { saveWidgetState } from '@/src/db/repositories/widgetState'

type CalendarState = {
  visibleYear: number
  visibleMonth: number
  selected: CalendarDay | null
  today: CalendarDay | null
  monthDays: CalendarDay[]
  festivalMarkers: Set<string>
  dayFestivals: FestivalOccurrence[]
  dayEvents: PersonalEvent[]
  loading: boolean
  error: string | null
  init: () => Promise<void>
  goToToday: () => Promise<void>
  nextMonth: () => Promise<void>
  prevMonth: () => Promise<void>
  setVisibleMonth: (year: number, month: number) => Promise<void>
  selectDay: (day: CalendarDay) => Promise<void>
  refreshDayDetails: () => Promise<void>
}

function clampMonth(year: number, month: number) {
  let y = year
  let m = month
  if (m > 12) {
    y += 1
    m = 1
  }
  if (m < 1) {
    y -= 1
    m = 12
  }
  if (y < MIN_BS_YEAR) return { year: MIN_BS_YEAR, month: 1 }
  if (y > MAX_BS_YEAR) return { year: MAX_BS_YEAR, month: 12 }
  return { year: y, month: m }
}

async function loadMonth(year: number, month: number) {
  const result = getMonth(year, month)
  if (!result.ok) throw new Error(result.error.message)
  const festivals = await getFestivalsForBsMonth(year, month)
  const markers = new Set(
    festivals.map(
      (f) =>
        `${f.bsYear}-${String(f.bsMonth).padStart(2, '0')}-${String(f.bsDay).padStart(2, '0')}`,
    ),
  )
  return { days: result.value.days, markers, festivals }
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  visibleYear: 2083,
  visibleMonth: 1,
  selected: null,
  today: null,
  monthDays: [],
  festivalMarkers: new Set(),
  dayFestivals: [],
  dayEvents: [],
  loading: true,
  error: null,

  init: async () => {
    set({ loading: true, error: null })
    try {
      const todayResult = getToday(getKathmanduAdToday())
      if (!todayResult.ok) throw new Error(todayResult.error.message)
      const today = todayResult.value
      const { days, markers } = await loadMonth(today.bs.year, today.bs.month)
      const dayFestivals = await getFestivalsForBsDay(
        today.bs.year,
        today.bs.month,
        today.bs.day,
      )
      const dayEvents = await getEventsForBsDay(today.bs.year, today.bs.month, today.bs.day)
      set({
        today,
        selected: today,
        visibleYear: today.bs.year,
        visibleMonth: today.bs.month,
        monthDays: days,
        festivalMarkers: markers,
        dayFestivals,
        dayEvents,
        loading: false,
      })
      await saveWidgetState({
        visibleBsYear: today.bs.year,
        visibleBsMonth: today.bs.month,
        selected: today.bs,
      })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load calendar',
      })
    }
  },

  goToToday: async () => {
    const todayResult = getToday(getKathmanduAdToday())
    if (!todayResult.ok) return
    const today = todayResult.value
    const { days, markers } = await loadMonth(today.bs.year, today.bs.month)
    const dayFestivals = await getFestivalsForBsDay(
      today.bs.year,
      today.bs.month,
      today.bs.day,
    )
    const dayEvents = await getEventsForBsDay(today.bs.year, today.bs.month, today.bs.day)
    set({
      today,
      selected: today,
      visibleYear: today.bs.year,
      visibleMonth: today.bs.month,
      monthDays: days,
      festivalMarkers: markers,
      dayFestivals,
      dayEvents,
    })
    await saveWidgetState({
      visibleBsYear: today.bs.year,
      visibleBsMonth: today.bs.month,
      selected: today.bs,
    })
  },

  nextMonth: async () => {
    const { visibleYear, visibleMonth, selected } = get()
    const next = clampMonth(visibleYear, visibleMonth + 1)
    const { days, markers } = await loadMonth(next.year, next.month)
    set({
      visibleYear: next.year,
      visibleMonth: next.month,
      monthDays: days,
      festivalMarkers: markers,
    })
    await saveWidgetState({
      visibleBsYear: next.year,
      visibleBsMonth: next.month,
      selected: selected?.bs ?? null,
    })
  },

  prevMonth: async () => {
    const { visibleYear, visibleMonth, selected } = get()
    const prev = clampMonth(visibleYear, visibleMonth - 1)
    const { days, markers } = await loadMonth(prev.year, prev.month)
    set({
      visibleYear: prev.year,
      visibleMonth: prev.month,
      monthDays: days,
      festivalMarkers: markers,
    })
    await saveWidgetState({
      visibleBsYear: prev.year,
      visibleBsMonth: prev.month,
      selected: selected?.bs ?? null,
    })
  },

  setVisibleMonth: async (year, month) => {
    const next = clampMonth(year, month)
    const { visibleYear, visibleMonth, selected } = get()
    if (next.year === visibleYear && next.month === visibleMonth) return
    const { days, markers } = await loadMonth(next.year, next.month)
    set({
      visibleYear: next.year,
      visibleMonth: next.month,
      monthDays: days,
      festivalMarkers: markers,
    })
    await saveWidgetState({
      visibleBsYear: next.year,
      visibleBsMonth: next.month,
      selected: selected?.bs ?? null,
    })
  },

  selectDay: async (day) => {
    const dayFestivals = await getFestivalsForBsDay(day.bs.year, day.bs.month, day.bs.day)
    const dayEvents = await getEventsForBsDay(day.bs.year, day.bs.month, day.bs.day)
    set({ selected: day, dayFestivals, dayEvents })
    const { visibleYear, visibleMonth } = get()
    await saveWidgetState({
      visibleBsYear: visibleYear,
      visibleBsMonth: visibleMonth,
      selected: day.bs,
    })
  },

  refreshDayDetails: async () => {
    const selected = get().selected
    if (!selected) return
    const dayFestivals = await getFestivalsForBsDay(
      selected.bs.year,
      selected.bs.month,
      selected.bs.day,
    )
    const dayEvents = await getEventsForBsDay(
      selected.bs.year,
      selected.bs.month,
      selected.bs.day,
    )
    set({ dayFestivals, dayEvents })
  },
}))

export function bsKey(bs: BsDate): string {
  return `${bs.year}-${String(bs.month).padStart(2, '0')}-${String(bs.day).padStart(2, '0')}`
}
