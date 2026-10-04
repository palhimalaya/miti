import type { AdDate } from './types'

const MS_PER_DAY = 86_400_000

export function adToUtcMs(ad: AdDate): number {
  return Date.UTC(ad.year, ad.month - 1, ad.day)
}

export function utcMsToAd(ms: number): AdDate {
  const date = new Date(ms)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

export function parseIsoToAd(iso: string): AdDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) {
    throw new Error(`Invalid ISO civil date: ${iso}`)
  }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return { year, month, day }
}

export function addUtcDays(ad: AdDate, days: number): AdDate {
  return utcMsToAd(adToUtcMs(ad) + days * MS_PER_DAY)
}

export function isGregorianValid(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false
  }
  const ms = Date.UTC(year, month - 1, day)
  const back = new Date(ms)
  return (
    back.getUTCFullYear() === year &&
    back.getUTCMonth() === month - 1 &&
    back.getUTCDate() === day
  )
}

export { MS_PER_DAY }
