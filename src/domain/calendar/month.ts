import { adToBs, bsToAd } from './conversion'
import {
  type AdDate,
  type BsDate,
  type CalendarDay,
  type CalendarMonth,
  type Result,
  AD_MONTH_NAMES_EN,
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NP,
  err,
  ok,
} from './types'
import { daysInBsMonth, validateAdDate, validateBsDate } from './validation'
import { getWeekday } from './weekday'

function monthNameEn(month: number): string {
  return BS_MONTH_NAMES_EN[month - 1] ?? `Month ${month}`
}

function monthNameNp(month: number): string {
  return BS_MONTH_NAMES_NP[month - 1] ?? `महिना ${month}`
}

function adMonthNameEn(month: number): string {
  return AD_MONTH_NAMES_EN[month - 1] ?? `Month ${month}`
}

export function getDay(bs: BsDate): Result<CalendarDay> {
  const validated = validateBsDate(bs)
  if (!validated.ok) return validated

  const ad = bsToAd(bs)
  if (!ad.ok) return ad

  const weekday = getWeekday(ad.value)
  if (!weekday.ok) return weekday

  return ok({
    bs: {
      ...bs,
      monthNameEn: monthNameEn(bs.month),
      monthNameNp: monthNameNp(bs.month),
    },
    ad: {
      ...ad.value,
      monthNameEn: adMonthNameEn(ad.value.month),
    },
    weekday: weekday.value,
  })
}

/**
 * Resolve today's CalendarDay from an injected AD civil date
 * (typically produced by an Asia/Kathmandu adapter outside this module).
 */
export function getToday(adToday: AdDate): Result<CalendarDay> {
  const validated = validateAdDate(adToday)
  if (!validated.ok) return validated

  const bs = adToBs(adToday)
  if (!bs.ok) return bs
  return getDay(bs.value)
}

export function getMonth(year: number, month: number): Result<CalendarMonth> {
  const length = daysInBsMonth(year, month)
  if (!length.ok) return length

  const days: CalendarDay[] = []
  for (let day = 1; day <= length.value; day += 1) {
    const calendarDay = getDay({ year, month, day })
    if (!calendarDay.ok) return calendarDay
    days.push(calendarDay.value)
  }

  return ok({
    bsYear: year,
    bsMonth: month,
    monthNameEn: monthNameEn(month),
    monthNameNp: monthNameNp(month),
    daysInMonth: length.value,
    days,
  })
}

/**
 * 7-column month grid, Sunday-first.
 * Leading/trailing cells outside the BS month are null.
 */
export function getMonthGrid(
  bsYear: number,
  bsMonth: number,
  options?: { weekStartsOn?: 0 },
): Result<Array<CalendarDay | null>> {
  const weekStartsOn = options?.weekStartsOn ?? 0
  if (weekStartsOn !== 0) {
    return err('INVALID_BS_DATE', 'MVP only supports weekStartsOn = 0 (Sunday)')
  }

  const month = getMonth(bsYear, bsMonth)
  if (!month.ok) return month

  const first = month.value.days[0]
  if (!first) {
    return err('INVALID_BS_DATE', `Empty month BS ${bsYear}-${bsMonth}`)
  }

  const leading = first.weekday.index // Sunday = 0
  const cells: Array<CalendarDay | null> = []
  for (let i = 0; i < leading; i += 1) cells.push(null)
  for (const day of month.value.days) cells.push(day)

  while (cells.length % 7 !== 0) cells.push(null)
  return ok(cells)
}
