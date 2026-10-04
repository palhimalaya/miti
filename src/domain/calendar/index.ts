/**
 * Miti calendar domain — pure BS ↔ AD engine.
 *
 * No React, React Native, Expo, SQLite, Zustand, festivals, or widgets.
 */

export {
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NP,
  AD_MONTH_NAMES_EN,
  WEEKDAYS,
  ok,
  err,
} from './types'

export type {
  AdDate,
  BsDate,
  CalendarDay,
  CalendarMonth,
  CalendarError,
  CalendarErrorCode,
  Result,
  Weekday,
} from './types'

export { DATASET_META } from './data'

export {
  bsToAd,
  adToBs,
  formatBsKey,
  compareBs,
  addBsDays,
} from './conversion'

export {
  daysInBsMonth,
  getSupportedBsRange,
  getSupportedAdRange,
  isValidBsDate,
  isValidAdDate,
  validateBsDate,
  validateAdDate,
} from './validation'

export { getWeekday } from './weekday'

export { getDay, getMonth, getMonthGrid, getToday } from './month'
