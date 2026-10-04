import { describe, expect, it } from 'vitest'
import { clampSelectedToVisibleMonth, shiftMonth } from './widgetNav'

describe('widget month navigation helpers', () => {
  it('shifts months across year boundaries', () => {
    expect(shiftMonth(2083, 12, 1)).toEqual({ year: 2084, month: 1 })
    expect(shiftMonth(2083, 1, -1)).toEqual({ year: 2082, month: 12 })
  })

  it('clamps selection into the visible month', () => {
    expect(clampSelectedToVisibleMonth({ year: 2083, month: 5, day: 20 }, 2083, 6)).toEqual({
      year: 2083,
      month: 6,
      day: 20,
    })
  })
})
