import { BAISAKH_1_AD_ISO, BS_MONTH_LENGTHS } from './data'
import {
  type AdDate,
  type BsDate,
  type Result,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  err,
  ok,
} from './types'
import { adToUtcMs, isGregorianValid, parseIsoToAd, utcMsToAd } from './civil'

export function getSupportedBsRange(): { minYear: number; maxYear: number } {
  return { minYear: MIN_BS_YEAR, maxYear: MAX_BS_YEAR }
}

/** Inclusive AD civil range covered by BS 2000–2099. */
export function getSupportedAdRange(): { min: AdDate; max: AdDate } {
  const minIso = BAISAKH_1_AD_ISO[MIN_BS_YEAR]
  const nextIso = BAISAKH_1_AD_ISO[MAX_BS_YEAR + 1]
  if (!minIso || !nextIso) {
    throw new Error('Missing Baishakh 1 anchors for supported AD range')
  }
  const min = parseIsoToAd(minIso)
  const maxMs = adToUtcMs(parseIsoToAd(nextIso)) - 86_400_000
  return { min, max: utcMsToAd(maxMs) }
}

export function daysInBsMonth(year: number, month: number): Result<number> {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
    return err('BS_OUT_OF_RANGE', `BS year ${year} outside ${MIN_BS_YEAR}–${MAX_BS_YEAR}`)
  }
  if (month < 1 || month > 12) {
    return err('INVALID_BS_DATE', `BS month must be 1–12, got ${month}`)
  }
  const lengths = BS_MONTH_LENGTHS[year]
  if (!lengths) {
    return err('BS_OUT_OF_RANGE', `No month-length data for BS year ${year}`)
  }
  const days = lengths[month - 1]
  if (days === undefined) {
    return err('INVALID_BS_DATE', `Missing month length for BS ${year}-${month}`)
  }
  return ok(days)
}

export function isValidBsDate(year: number, month: number, day: number): boolean {
  const length = daysInBsMonth(year, month)
  if (!length.ok) return false
  return Number.isInteger(day) && day >= 1 && day <= length.value
}

export function isValidAdDate(year: number, month: number, day: number): boolean {
  return isGregorianValid(year, month, day)
}

export function validateBsDate(bs: BsDate): Result<BsDate> {
  if (!Number.isInteger(bs.year) || !Number.isInteger(bs.month) || !Number.isInteger(bs.day)) {
    return err('INVALID_BS_DATE', 'BS year/month/day must be integers')
  }
  if (bs.year < MIN_BS_YEAR || bs.year > MAX_BS_YEAR) {
    return err('BS_OUT_OF_RANGE', `BS year ${bs.year} outside ${MIN_BS_YEAR}–${MAX_BS_YEAR}`)
  }
  if (!isValidBsDate(bs.year, bs.month, bs.day)) {
    return err(
      'INVALID_BS_DATE',
      `Invalid BS date ${bs.year}-${bs.month}-${bs.day}`,
    )
  }
  return ok(bs)
}

export function validateAdDate(ad: AdDate): Result<AdDate> {
  if (!Number.isInteger(ad.year) || !Number.isInteger(ad.month) || !Number.isInteger(ad.day)) {
    return err('INVALID_AD_DATE', 'AD year/month/day must be integers')
  }
  if (!isValidAdDate(ad.year, ad.month, ad.day)) {
    return err('INVALID_AD_DATE', `Invalid Gregorian date ${ad.year}-${ad.month}-${ad.day}`)
  }
  const range = getSupportedAdRange()
  const ms = adToUtcMs(ad)
  if (ms < adToUtcMs(range.min) || ms > adToUtcMs(range.max)) {
    return err(
      'AD_OUT_OF_RANGE',
      `AD date ${ad.year}-${ad.month}-${ad.day} outside supported range ` +
        `${range.min.year}-${range.min.month}-${range.min.day} … ` +
        `${range.max.year}-${range.max.month}-${range.max.day}`,
    )
  }
  return ok(ad)
}
