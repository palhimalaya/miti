
export type SpecialDay = {
  bsMonth: number
  bsDay: number
  note: string
}

export const SPECIAL_REVEAL_TAPS = 3

export const DEFAULT_SPECIAL_NOTE = 'एक विशेष मिति · A quiet day, kept for you.'

export function isSpecialBsDay(
  bs: { month: number; day: number },
  special: SpecialDay | null | undefined,
): boolean {
  if (!special) return false
  return bs.month === special.bsMonth && bs.day === special.bsDay
}

export function normalizeSpecialDay(input: {
  bsMonth: number
  bsDay: number
  note?: string
}): SpecialDay | null {
  const month = Math.trunc(input.bsMonth)
  const day = Math.trunc(input.bsDay)
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 32) return null
  const note = (input.note ?? '').trim() || DEFAULT_SPECIAL_NOTE
  return { bsMonth: month, bsDay: day, note }
}
