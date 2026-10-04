import type { AdDate } from '@/src/domain/calendar'

const KATHMANDU_OFFSET_MS = (5 * 60 + 45) * 60 * 1000

/**
 * Resolve the civil Gregorian date in Asia/Kathmandu from a system clock instant.
 * Kept outside the pure calendar engine.
 */
export function getKathmanduAdToday(now: Date = new Date()): AdDate {
  const shifted = new Date(now.getTime() + KATHMANDU_OFFSET_MS)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

export function formatIsoDate(ad: AdDate): string {
  const mm = String(ad.month).padStart(2, '0')
  const dd = String(ad.day).padStart(2, '0')
  return `${ad.year}-${mm}-${dd}`
}
