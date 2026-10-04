import { describe, expect, it } from 'vitest'
import { getKathmanduAdToday } from './kathmanduToday'
import { getToday } from '@/src/domain/calendar'

describe('Kathmandu today adapter', () => {
  it('maps a known UTC instant to Kathmandu civil date', () => {
    // 2026-10-03 20:00 UTC = 2026-10-04 01:45 in Asia/Kathmandu
    const ad = getKathmanduAdToday(new Date('2026-10-03T20:00:00.000Z'))
    expect(ad).toEqual({ year: 2026, month: 10, day: 4 })
    const today = getToday(ad)
    expect(today.ok).toBe(true)
    if (today.ok) {
      expect(today.value.bs).toMatchObject({ year: 2083, month: 6, day: 18 })
    }
  })

  it('does not use device-local timezone semantics for the civil date', () => {
    // 2026-10-04 18:30 UTC = 2026-10-05 00:15 Kathmandu
    const ad = getKathmanduAdToday(new Date('2026-10-04T18:30:00.000Z'))
    expect(ad).toEqual({ year: 2026, month: 10, day: 5 })
  })
})
