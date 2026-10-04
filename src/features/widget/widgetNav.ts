import { MAX_BS_YEAR, MIN_BS_YEAR, daysInBsMonth, type BsDate } from '@/src/domain/calendar'

export function clampMonth(year: number, month: number) {
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

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  return clampMonth(year, month + delta)
}

export function clampSelectedToVisibleMonth(
  selected: BsDate,
  year: number,
  month: number,
): BsDate {
  const length = daysInBsMonth(year, month)
  const maxDay = length.ok ? length.value : 30
  return { year, month, day: Math.min(Math.max(1, selected.day), maxDay) }
}
