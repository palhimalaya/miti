import { describe, expect, it } from 'vitest'
import { isSpecialBsDay, normalizeSpecialDay } from './easterEgg'

describe('special day', () => {
  it('matches configured month/day only', () => {
    const special = { bsMonth: 4, bsDay: 14, note: 'mine' }
    expect(isSpecialBsDay({ month: 4, day: 14 }, special)).toBe(true)
    expect(isSpecialBsDay({ month: 4, day: 13 }, special)).toBe(false)
    expect(isSpecialBsDay({ month: 4, day: 14 }, null)).toBe(false)
  })

  it('normalizes and rejects invalid dates', () => {
    expect(normalizeSpecialDay({ bsMonth: 4, bsDay: 14, note: '  hi  ' })).toEqual({
      bsMonth: 4,
      bsDay: 14,
      note: 'hi',
    })
    expect(normalizeSpecialDay({ bsMonth: 0, bsDay: 14 })).toBeNull()
    expect(normalizeSpecialDay({ bsMonth: 4, bsDay: 33 })).toBeNull()
  })
})
