import { BAISAKH_1_AD_ISO, BS_MONTH_LENGTHS } from './data'
import { MS_PER_DAY, adToUtcMs, parseIsoToAd, utcMsToAd } from './civil'
import {
  type AdDate,
  type BsDate,
  type Result,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  err,
  ok,
} from './types'
import { daysInBsMonth, validateAdDate, validateBsDate } from './validation'

type MonthStart = {
  year: number
  month: number
  adMs: number
}

function buildMonthStarts(): MonthStart[] {
  const starts: MonthStart[] = []
  for (let year = MIN_BS_YEAR; year <= MAX_BS_YEAR; year += 1) {
    const iso = BAISAKH_1_AD_ISO[year]
    const lengths = BS_MONTH_LENGTHS[year]
    if (!iso || !lengths) {
      throw new Error(`Missing calendar data for BS year ${year}`)
    }
    let cursor = adToUtcMs(parseIsoToAd(iso))
    for (let month = 1; month <= 12; month += 1) {
      starts.push({ year, month, adMs: cursor })
      const days = lengths[month - 1]
      if (days === undefined) {
        throw new Error(`Missing month length for BS ${year}-${month}`)
      }
      cursor += days * MS_PER_DAY
    }
  }
  return starts
}

const MONTH_STARTS = buildMonthStarts()

function monthStartFor(year: number, month: number): MonthStart | undefined {
  // 12 months per year; index is dense for 2000–2099.
  const index = (year - MIN_BS_YEAR) * 12 + (month - 1)
  const start = MONTH_STARTS[index]
  if (!start || start.year !== year || start.month !== month) {
    return MONTH_STARTS.find((entry) => entry.year === year && entry.month === month)
  }
  return start
}

export function bsToAd(year: number, month: number, day: number): Result<AdDate>
export function bsToAd(bs: BsDate): Result<AdDate>
export function bsToAd(
  yearOrBs: number | BsDate,
  month?: number,
  day?: number,
): Result<AdDate> {
  const bs: BsDate =
    typeof yearOrBs === 'number'
      ? { year: yearOrBs, month: month ?? 0, day: day ?? 0 }
      : yearOrBs

  const validated = validateBsDate(bs)
  if (!validated.ok) return validated

  const start = monthStartFor(bs.year, bs.month)
  if (!start) {
    return err('BS_OUT_OF_RANGE', `No month start for BS ${bs.year}-${bs.month}`)
  }

  return ok(utcMsToAd(start.adMs + (bs.day - 1) * MS_PER_DAY))
}

export function adToBs(year: number, month: number, day: number): Result<BsDate>
export function adToBs(ad: AdDate): Result<BsDate>
export function adToBs(
  yearOrAd: number | AdDate,
  month?: number,
  day?: number,
): Result<BsDate> {
  const ad: AdDate =
    typeof yearOrAd === 'number'
      ? { year: yearOrAd, month: month ?? 0, day: day ?? 0 }
      : yearOrAd

  const validated = validateAdDate(ad)
  if (!validated.ok) return validated

  const adMs = adToUtcMs(ad)

  // Binary search last month start <= adMs
  let lo = 0
  let hi = MONTH_STARTS.length - 1
  let match = MONTH_STARTS[0]
  if (!match) {
    return err('BS_OUT_OF_RANGE', 'Calendar month index is empty')
  }

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const candidate = MONTH_STARTS[mid]
    if (!candidate) break
    if (candidate.adMs <= adMs) {
      match = candidate
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  const dayOffset = Math.floor((adMs - match.adMs) / MS_PER_DAY) + 1
  const length = daysInBsMonth(match.year, match.month)
  if (!length.ok || dayOffset < 1 || dayOffset > length.value) {
    return err('AD_OUT_OF_RANGE', `AD date did not map cleanly into a BS month`)
  }

  return ok({ year: match.year, month: match.month, day: dayOffset })
}

export function formatBsKey(bs: BsDate): string {
  const mm = String(bs.month).padStart(2, '0')
  const dd = String(bs.day).padStart(2, '0')
  return `bs:${bs.year}-${mm}-${dd}`
}

export function compareBs(a: BsDate, b: BsDate): number {
  if (a.year !== b.year) return a.year - b.year
  if (a.month !== b.month) return a.month - b.month
  return a.day - b.day
}

export function addBsDays(bs: BsDate, delta: number): Result<BsDate> {
  const ad = bsToAd(bs)
  if (!ad.ok) return ad
  const nextAd = utcMsToAd(adToUtcMs(ad.value) + delta * MS_PER_DAY)
  return adToBs(nextAd)
}
