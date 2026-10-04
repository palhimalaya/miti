import React from 'react'
import { FlexWidget, TextWidget } from 'react-native-android-widget'
import {
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  getDay,
  getMonth,
  getToday,
  type BsDate,
  type CalendarDay,
} from '@/src/domain/calendar'
import { getKathmanduAdToday } from '@/src/services/kathmanduToday'
import { formatNumber } from '@/src/utils/numerals'

export type WidgetSnapshot = {
  visibleYear: number
  visibleMonth: number
  selected: BsDate
  today: CalendarDay
  festivalTitle?: string
  days: CalendarDay[]
  festivalDays: Set<string>
}

function clamp(year: number, month: number) {
  let y = year
  let m = month
  if (m > 12) {
    y += 1
    m = 1
  }
  if (m < 1) {
    y -= 1
    m = 12
  }
  if (y < MIN_BS_YEAR) return { year: MIN_BS_YEAR, month: 1 }
  if (y > MAX_BS_YEAR) return { year: MAX_BS_YEAR, month: 12 }
  return { year: y, month: m }
}

export function buildWidgetSnapshot(input?: {
  visibleYear?: number
  visibleMonth?: number
  selected?: BsDate
  festivalTitle?: string
  festivalDays?: string[]
}): WidgetSnapshot {
  const todayResult = getToday(getKathmanduAdToday())
  if (!todayResult.ok) {
    throw new Error(todayResult.error.message)
  }
  const today = todayResult.value
  const visibleYear = input?.visibleYear ?? today.bs.year
  const visibleMonth = input?.visibleMonth ?? today.bs.month
  const selected = input?.selected ?? today.bs
  const month = getMonth(visibleYear, visibleMonth)
  if (!month.ok) throw new Error(month.error.message)
  return {
    visibleYear,
    visibleMonth,
    selected,
    today,
    festivalTitle: input?.festivalTitle,
    days: month.value.days,
    festivalDays: new Set(input?.festivalDays ?? []),
  }
}

function selectedDay(snapshot: WidgetSnapshot): CalendarDay {
  const found = snapshot.days.find(
    (d) =>
      d.bs.year === snapshot.selected.year &&
      d.bs.month === snapshot.selected.month &&
      d.bs.day === snapshot.selected.day,
  )
  if (found) return found
  const day = getDay(snapshot.selected)
  if (day.ok) return day.value
  return snapshot.today
}

const cream = '#FFF8EC'
const charcoal = '#252525'
const deepRed = '#9B1C31'
const gold = '#D4A84F'
const muted = '#5C5C5C'

export function MitiSmallWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day = selectedDay(snapshot)
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `miti://calendar?bs=${day.bs.year}-${day.bs.month}-${day.bs.day}` }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: cream,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <TextWidget
        text={`${day.bs.monthNameNp} ${formatNumber(day.bs.year, 'devanagari')}`}
        style={{ fontSize: 12, color: muted }}
      />
      <TextWidget
        text={formatNumber(day.bs.day, 'devanagari')}
        style={{ fontSize: 34, color: charcoal, fontWeight: '700' }}
      />
      <TextWidget
        text={`${day.ad.monthNameEn.slice(0, 3)} ${day.ad.day}`}
        style={{ fontSize: 13, color: muted }}
      />
      {snapshot.festivalTitle ? (
        <TextWidget
          text={`✦ ${snapshot.festivalTitle}`}
          style={{ fontSize: 12, color: gold, marginTop: 6 }}
        />
      ) : null}
    </FlexWidget>
  )
}

export function MitiMediumWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day = selectedDay(snapshot)
  const preview = snapshot.days.slice(0, 7)

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: cream,
        padding: 10,
        flexDirection: 'column',
      }}
    >
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <FlexWidget clickAction="PREV_MONTH" style={{ padding: 8 }}>
          <TextWidget text="‹" style={{ fontSize: 22, color: charcoal }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', alignItems: 'center' }}>
          <TextWidget
            text={`${day.bs.monthNameNp} ${formatNumber(snapshot.visibleYear, 'devanagari')}`}
            style={{ fontSize: 14, color: charcoal, fontWeight: '700' }}
          />
          <TextWidget
            text={`${formatNumber(day.bs.day, 'devanagari')} · ${day.ad.monthNameEn} ${day.ad.day}`}
            style={{ fontSize: 12, color: muted }}
          />
        </FlexWidget>
        <FlexWidget clickAction="NEXT_MONTH" style={{ padding: 8 }}>
          <TextWidget text="›" style={{ fontSize: 22, color: charcoal }} />
        </FlexWidget>
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'row', marginTop: 8, width: 'match_parent' }}>
        {preview.map((cell) => {
          const selected =
            cell.bs.day === snapshot.selected.day &&
            cell.bs.month === snapshot.selected.month &&
            cell.bs.year === snapshot.selected.year
          return (
            <FlexWidget
              key={`${cell.bs.year}-${cell.bs.month}-${cell.bs.day}`}
              clickAction="SELECT_DATE"
              clickActionData={{
                year: cell.bs.year,
                month: cell.bs.month,
                day: cell.bs.day,
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 4,
                backgroundColor: selected ? deepRed : '#00000000',
                borderRadius: 8,
              }}
            >
              <TextWidget
                text={formatNumber(cell.bs.day, 'devanagari')}
                style={{ fontSize: 14, color: selected ? '#FFFFFF' : charcoal, fontWeight: '700' }}
              />
              <TextWidget
                text={String(cell.ad.day)}
                style={{ fontSize: 10, color: selected ? '#FFFFFF' : muted }}
              />
            </FlexWidget>
          )
        })}
      </FlexWidget>

      {snapshot.festivalTitle ? (
        <TextWidget
          text={`✦ ${snapshot.festivalTitle}`}
          style={{ fontSize: 12, color: gold, marginTop: 8 }}
        />
      ) : (
        <TextWidget text=" " style={{ fontSize: 12, marginTop: 8 }} />
      )}
    </FlexWidget>
  )
}

export function MitiLargeWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day = selectedDay(snapshot)
  const first = snapshot.days[0]
  const leading = first?.weekday.index ?? 0
  const cells: Array<CalendarDay | null> = []
  for (let i = 0; i < leading; i += 1) cells.push(null)
  for (const d of snapshot.days) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const rows: Array<Array<CalendarDay | null>> = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: cream,
        padding: 10,
        flexDirection: 'column',
      }}
    >
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 'match_parent',
          alignItems: 'center',
        }}
      >
        <FlexWidget clickAction="PREV_MONTH" style={{ padding: 6 }}>
          <TextWidget text="‹" style={{ fontSize: 22, color: charcoal }} />
        </FlexWidget>
        <TextWidget
          text={`${day.bs.monthNameNp} ${formatNumber(snapshot.visibleYear, 'devanagari')}`}
          style={{ fontSize: 16, color: charcoal, fontWeight: '700' }}
        />
        <FlexWidget clickAction="NEXT_MONTH" style={{ padding: 6 }}>
          <TextWidget text="›" style={{ fontSize: 22, color: charcoal }} />
        </FlexWidget>
      </FlexWidget>

      {rows.map((row, rowIndex) => (
        <FlexWidget key={`row-${rowIndex}`} style={{ flexDirection: 'row', width: 'match_parent' }}>
          {row.map((cell, colIndex) => {
            if (!cell) {
              return (
                <FlexWidget key={`e-${rowIndex}-${colIndex}`} style={{ flex: 1, height: 34 }} />
              )
            }
            const selected =
              cell.bs.day === snapshot.selected.day &&
              cell.bs.month === snapshot.selected.month &&
              cell.bs.year === snapshot.selected.year
            const key = `${cell.bs.year}-${String(cell.bs.month).padStart(2, '0')}-${String(cell.bs.day).padStart(2, '0')}`
            const hasFestival = snapshot.festivalDays.has(key)
            return (
              <FlexWidget
                key={key}
                clickAction="SELECT_DATE"
                clickActionData={{
                  year: cell.bs.year,
                  month: cell.bs.month,
                  day: cell.bs.day,
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 34,
                  backgroundColor: selected ? deepRed : '#00000000',
                  borderRadius: 6,
                }}
              >
                <TextWidget
                  text={formatNumber(cell.bs.day, 'devanagari')}
                  style={{
                    fontSize: 12,
                    color: selected ? '#FFFFFF' : charcoal,
                    fontWeight: '700',
                  }}
                />
                <TextWidget
                  text={hasFestival ? '•' : String(cell.ad.day)}
                  style={{ fontSize: 9, color: selected ? '#FFFFFF' : hasFestival ? gold : muted }}
                />
              </FlexWidget>
            )
          })}
        </FlexWidget>
      ))}

      <TextWidget
        text={`${formatNumber(day.bs.day, 'devanagari')} ${day.bs.monthNameNp} · ${day.weekday.nameEn}`}
        style={{ fontSize: 12, color: charcoal, marginTop: 6 }}
      />
      {snapshot.festivalTitle ? (
        <TextWidget text={`✦ ${snapshot.festivalTitle}`} style={{ fontSize: 12, color: gold }} />
      ) : null}
    </FlexWidget>
  )
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  return clamp(year, month + delta)
}
