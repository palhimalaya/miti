import { describe, expect, it } from 'vitest'
import golden from './fixtures/golden.json'
import {
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  addBsDays,
  adToBs,
  bsToAd,
  daysInBsMonth,
  formatBsKey,
  getDay,
  getMonth,
  getMonthGrid,
  getSupportedAdRange,
  getSupportedBsRange,
  getToday,
  getWeekday,
  isValidBsDate,
} from './index'
import { BS_MONTH_LENGTHS } from './data'

function expectOk<T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('expected ok')
  return result.value
}

describe('range constants', () => {
  it('exposes 2000–2099', () => {
    expect(MIN_BS_YEAR).toBe(2000)
    expect(MAX_BS_YEAR).toBe(2099)
    expect(getSupportedBsRange()).toEqual({ minYear: 2000, maxYear: 2099 })
  })

  it('derives AD bounds from Baishakh 1 anchors', () => {
    const range = getSupportedAdRange()
    expect(range.min).toEqual({ year: 1943, month: 4, day: 14 })
    expect(range.max).toEqual({ year: 2043, month: 4, day: 14 })
  })
})

describe('golden fixtures: bsToAd / adToBs', () => {
  it('converts known BS → AD anchors', () => {
    for (const fixture of golden.bsToAd) {
      expect(expectOk(bsToAd(fixture.bs))).toEqual(fixture.ad)
    }
  })

  it('converts known AD → BS anchors', () => {
    for (const fixture of golden.adToBs) {
      expect(expectOk(adToBs(fixture.ad))).toEqual(fixture.bs)
    }
  })

  it('matches weekday fixtures (Sunday = 0)', () => {
    for (const fixture of golden.weekdays) {
      const day = expectOk(getDay(fixture.bs))
      expect(day.ad).toMatchObject(fixture.ad)
      expect(day.weekday.index).toBe(fixture.weekdayIndex)
      expect(day.weekday.nameEn).toBe(fixture.nameEn)
      expect(expectOk(getWeekday(fixture.ad)).index).toBe(fixture.weekdayIndex)
    }
  })
})

describe('month lengths and boundaries', () => {
  it('matches golden month lengths', () => {
    for (const fixture of golden.monthLengths) {
      expect(expectOk(daysInBsMonth(fixture.year, fixture.month))).toBe(fixture.days)
    }
  })

  it('handles year boundary Chaitra → Baishakh', () => {
    for (const boundary of golden.boundaries) {
      if (!('from' in boundary) || !boundary.from || !boundary.next) continue
      const next = expectOk(addBsDays(boundary.from, 1))
      expect(next).toEqual(boundary.next)
    }
  })

  it('pairs Ashwin 2083 first/last with AD', () => {
    const boundary = golden.boundaries.find((item) => 'first' in item)
    expect(boundary && 'first' in boundary).toBe(true)
    if (!boundary || !('first' in boundary) || !boundary.first || !boundary.last) {
      throw new Error('missing Ashwin boundary fixture')
    }
    expect(expectOk(bsToAd(boundary.first.bs))).toEqual(boundary.first.ad)
    expect(expectOk(bsToAd(boundary.last.bs))).toEqual(boundary.last.ad)
    expect(expectOk(daysInBsMonth(2083, 6))).toBe(31)
  })

  it('rejects invalid / out-of-range BS dates', () => {
    for (const fixture of golden.invalidBs) {
      const result = bsToAd(fixture)
      expect(result.ok).toBe(false)
      if (result.ok) throw new Error('expected error')
      expect(result.error.code).toBe(fixture.code)
      expect(isValidBsDate(fixture.year, fixture.month, fixture.day)).toBe(false)
    }
  })

  it('rejects invalid / out-of-range AD dates', () => {
    for (const fixture of golden.invalidAd) {
      const result = adToBs(fixture)
      expect(result.ok).toBe(false)
      if (result.ok) throw new Error('expected error')
      expect(result.error.code).toBe(fixture.code)
    }
  })
})

describe('round-trip invariants', () => {
  it('round-trips every day in sampled years including range edges', () => {
    const years = [2000, 2001, 2050, 2082, 2083, 2087, 2096, 2099]
    for (const year of years) {
      const lengths = BS_MONTH_LENGTHS[year]
      expect(lengths).toBeTruthy()
      if (!lengths) continue
      for (let month = 1; month <= 12; month += 1) {
        const days = lengths[month - 1] ?? 0
        for (let day = 1; day <= days; day += 1) {
          const ad = expectOk(bsToAd(year, month, day))
          const bs = expectOk(adToBs(ad))
          expect(bs).toEqual({ year, month, day })
        }
      }
    }
  })

  it('round-trips every AD day across the supported AD range (spot decades)', () => {
    // Full 100y AD walk is heavy; sample contiguous months around anchors + edges.
    const samples = [
      { year: 1943, month: 4 },
      { year: 2025, month: 4 },
      { year: 2026, month: 10 },
      { year: 2043, month: 4 },
    ]
    for (const sample of samples) {
      for (let day = 1; day <= 28; day += 1) {
        const ad = { year: sample.year, month: sample.month, day }
        const bs = adToBs(ad)
        if (!bs.ok) continue
        expect(expectOk(bsToAd(bs.value))).toEqual(ad)
      }
    }
  })
})

describe('getMonth / grid / today / keys', () => {
  it('builds Ashwin 2083 with 31 days and Sunday-first grid', () => {
    const month = expectOk(getMonth(2083, 6))
    expect(month.daysInMonth).toBe(31)
    expect(month.monthNameNp).toBe('असोज')
    expect(month.days[17]?.bs.day).toBe(18)
    expect(month.days[17]?.ad).toEqual({
      year: 2026,
      month: 10,
      day: 4,
      monthNameEn: 'October',
    })

    const grid = expectOk(getMonthGrid(2083, 6))
    expect(grid.length % 7).toBe(0)
    const firstDayIndex = grid.findIndex((cell) => cell?.bs.day === 1)
    expect(firstDayIndex).toBe(expectOk(getDay({ year: 2083, month: 6, day: 1 })).weekday.index)
    expect(grid.slice(0, firstDayIndex).every((cell) => cell === null)).toBe(true)
  })

  it('getToday uses injected AD civil date', () => {
    const today = expectOk(getToday({ year: 2026, month: 10, day: 4 }))
    expect(today.bs).toMatchObject({ year: 2083, month: 6, day: 18 })
    expect(formatBsKey(today.bs)).toBe('bs:2083-06-18')
  })
})

describe('dataset continuity', () => {
  it('rolls Chaitra → Baishakh for every in-range year boundary', () => {
    for (let year = MIN_BS_YEAR; year < MAX_BS_YEAR; year += 1) {
      const lastMonthDays = expectOk(daysInBsMonth(year, 12))
      const next = expectOk(addBsDays({ year, month: 12, day: lastMonthDays }, 1))
      expect(next).toEqual({ year: year + 1, month: 1, day: 1 })
    }
  })

  it('treats the day after 2099 Chaitra as out of supported BS range', () => {
    const lastMonthDays = expectOk(daysInBsMonth(MAX_BS_YEAR, 12))
    const beyond = addBsDays({ year: MAX_BS_YEAR, month: 12, day: lastMonthDays }, 1)
    expect(beyond.ok).toBe(false)
    if (beyond.ok) throw new Error('expected out of range')
    expect(beyond.error.code).toBe('AD_OUT_OF_RANGE')
  })
})
