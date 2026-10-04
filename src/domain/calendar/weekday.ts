import { adToUtcMs } from './civil'
import {
  type AdDate,
  type Result,
  type Weekday,
  WEEKDAYS,
  err,
  ok,
} from './types'
import { isValidAdDate } from './validation'

/**
 * Gregorian weekday for a civil AD date.
 * Index 0 = Sunday … 6 = Saturday.
 */
export function getWeekday(ad: AdDate): Result<Weekday> {
  if (!isValidAdDate(ad.year, ad.month, ad.day)) {
    return err('INVALID_AD_DATE', `Invalid Gregorian date ${ad.year}-${ad.month}-${ad.day}`)
  }
  const index = new Date(adToUtcMs(ad)).getUTCDay()
  const weekday = WEEKDAYS[index]
  if (!weekday) {
    return err('INVALID_AD_DATE', `Unable to resolve weekday for ${ad.year}-${ad.month}-${ad.day}`)
  }
  return ok(weekday)
}
