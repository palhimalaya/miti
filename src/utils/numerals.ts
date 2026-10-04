const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'] as const

export type NumeralSystem = 'devanagari' | 'arabic'

export function formatNumber(value: number, system: NumeralSystem = 'devanagari'): string {
  const arabic = String(value)
  if (system === 'arabic') return arabic
  return arabic.replace(/\d/g, (digit) => DEVANAGARI_DIGITS[Number(digit)] ?? digit)
}
