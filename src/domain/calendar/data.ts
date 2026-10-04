import raw from './data/bs-month-lengths-2000-2099.json'
import { MAX_BS_YEAR, MIN_BS_YEAR } from './types'

type Dataset = {
  min_bs_year: number
  max_bs_year: number
  month_lengths: Record<string, number[]>
  baisakh_1_ad: Record<string, string>
}

const data = raw as Dataset

if (data.min_bs_year !== MIN_BS_YEAR || data.max_bs_year !== MAX_BS_YEAR) {
  throw new Error(
    `BS dataset range mismatch: data=${data.min_bs_year}-${data.max_bs_year}, constants=${MIN_BS_YEAR}-${MAX_BS_YEAR}`,
  )
}

export type MonthLengths = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

function asMonthLengths(lengths: number[]): MonthLengths {
  if (lengths.length !== 12) {
    throw new Error(`Expected 12 month lengths, got ${lengths.length}`)
  }
  return lengths as unknown as MonthLengths
}

export const BS_MONTH_LENGTHS: Readonly<Record<number, MonthLengths>> = Object.freeze(
  Object.fromEntries(
    Object.entries(data.month_lengths).map(([year, lengths]) => [
      Number(year),
      asMonthLengths(lengths),
    ]),
  ),
)

/** ISO civil dates (YYYY-MM-DD) for Baishakh 1 of each BS year, plus 2100 as end bound. */
export const BAISAKH_1_AD_ISO: Readonly<Record<number, string>> = Object.freeze(
  Object.fromEntries(
    Object.entries(data.baisakh_1_ad).map(([year, iso]) => [Number(year), iso]),
  ),
)

export const DATASET_META = Object.freeze({
  minBsYear: data.min_bs_year,
  maxBsYear: data.max_bs_year,
  source: (raw as { source?: unknown }).source,
})
