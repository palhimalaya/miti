export const MIN_BS_YEAR = 2000
export const MAX_BS_YEAR = 2099

/** Bikram Sambat civil date. Month 1 = Baishakh … 12 = Chaitra. */
export type BsDate = {
  year: number
  month: number
  day: number
}

/** Gregorian civil date. Month 1 = January … 12 = December. */
export type AdDate = {
  year: number
  month: number
  day: number
}

/** Weekday index: 0 = Sunday … 6 = Saturday (locked product rule). */
export type Weekday = {
  index: number
  nameEn: string
  nameNp: string
  shortEn: string
  shortNp: string
}

export type CalendarDay = {
  bs: BsDate & {
    monthNameEn: string
    monthNameNp: string
  }
  ad: AdDate & {
    monthNameEn: string
  }
  weekday: Weekday
}

export type CalendarMonth = {
  bsYear: number
  bsMonth: number
  monthNameEn: string
  monthNameNp: string
  daysInMonth: number
  days: CalendarDay[]
}

export type CalendarErrorCode =
  | 'BS_OUT_OF_RANGE'
  | 'AD_OUT_OF_RANGE'
  | 'INVALID_BS_DATE'
  | 'INVALID_AD_DATE'

export type CalendarError = {
  code: CalendarErrorCode
  message: string
}

export type Ok<T> = { ok: true; value: T }
export type Err = { ok: false; error: CalendarError }
export type Result<T> = Ok<T> | Err

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

export function err(code: CalendarErrorCode, message: string): Err {
  return { ok: false, error: { code, message } }
}

export const BS_MONTH_NAMES_EN = [
  'Baishakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
] as const

export const BS_MONTH_NAMES_NP = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कात्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
] as const

export const AD_MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const WEEKDAYS: readonly Weekday[] = [
  { index: 0, nameEn: 'Sunday', nameNp: 'आइतबार', shortEn: 'Sun', shortNp: 'आइत' },
  { index: 1, nameEn: 'Monday', nameNp: 'सोमबार', shortEn: 'Mon', shortNp: 'सोम' },
  { index: 2, nameEn: 'Tuesday', nameNp: 'मंगलबार', shortEn: 'Tue', shortNp: 'मंगल' },
  { index: 3, nameEn: 'Wednesday', nameNp: 'बुधबार', shortEn: 'Wed', shortNp: 'बुध' },
  { index: 4, nameEn: 'Thursday', nameNp: 'बिहिबार', shortEn: 'Thu', shortNp: 'बिहि' },
  { index: 5, nameEn: 'Friday', nameNp: 'शुक्रबार', shortEn: 'Fri', shortNp: 'शुक्र' },
  { index: 6, nameEn: 'Saturday', nameNp: 'शनिबार', shortEn: 'Sat', shortNp: 'शनि' },
] as const
