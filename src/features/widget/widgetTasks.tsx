import React from 'react'
import { FlexWidget, TextWidget } from 'react-native-android-widget'
import {
  BS_MONTH_NAMES_NP,
  WEEKDAYS,
  getMonth,
  getToday,
  type BsDate,
  type CalendarDay,
} from '@/src/domain/calendar'
import { getKathmanduAdToday } from '@/src/services/kathmanduToday'
import { formatNumber } from '@/src/utils/numerals'
import { clampSelectedToVisibleMonth } from './widgetNav'

export { clampSelectedToVisibleMonth, shiftMonth } from './widgetNav'

export type WidgetSnapshot = {
  visibleYear: number
  visibleMonth: number
  selected: BsDate
  today: CalendarDay
  festivalTitle?: string
  days: CalendarDay[]
  festivalDays: Set<string>
}

/** Hamro Patro–style translucent dark so wallpaper shows through. */
const theme = {
  bg: '#CC1C1816',
  surface: '#33FFFFFF',
  text: '#F7F1E6',
  textMuted: '#B8AFA0',
  accent: '#E8C27A',
  selected: '#9B1C31',
  selectedText: '#FFF8EC',
  saturday: '#F07070',
  todayBorder: '#6F9473',
} as const

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
  const month = getMonth(visibleYear, visibleMonth)
  if (!month.ok) throw new Error(month.error.message)

  const rawSelected = input?.selected ?? today.bs
  const selected = clampSelectedToVisibleMonth(rawSelected, visibleYear, visibleMonth)

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

function visibleMonthLabel(snapshot: WidgetSnapshot): string {
  const name = BS_MONTH_NAMES_NP[snapshot.visibleMonth - 1] ?? ''
  return `${name} ${formatNumber(snapshot.visibleYear, 'devanagari')}`
}

function visibleAdRange(snapshot: WidgetSnapshot): string {
  const first = snapshot.days[0]
  const last = snapshot.days[snapshot.days.length - 1]
  if (!first || !last) return ''
  if (first.ad.month === last.ad.month) {
    return first.ad.monthNameEn.slice(0, 3)
  }
  return `${first.ad.monthNameEn.slice(0, 3)}/${last.ad.monthNameEn.slice(0, 3)}`
}

function selectedDayInVisibleMonth(snapshot: WidgetSnapshot): CalendarDay {
  const found = snapshot.days.find((d) => d.bs.day === snapshot.selected.day)
  if (found) return found
  return snapshot.days[0] ?? snapshot.today
}

function buildMonthCells(days: CalendarDay[]): Array<CalendarDay | null> {
  const first = days[0]
  const leading = first?.weekday.index ?? 0
  const cells: Array<CalendarDay | null> = []
  for (let i = 0; i < leading; i += 1) cells.push(null)
  for (const d of days) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function MonthHeader({ snapshot }: { snapshot: WidgetSnapshot }) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 'match_parent',
        marginBottom: 4,
      }}
    >
      <FlexWidget
        clickAction="PREV_MONTH"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget text="‹" style={{ fontSize: 22, color: theme.text }} />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <TextWidget
          text={visibleMonthLabel(snapshot)}
          style={{ fontSize: 16, color: theme.text, fontWeight: '700' }}
        />
        <TextWidget
          text={visibleAdRange(snapshot)}
          style={{ fontSize: 11, color: theme.textMuted }}
        />
      </FlexWidget>

      <FlexWidget
        clickAction="NEXT_MONTH"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget text="›" style={{ fontSize: 22, color: theme.text }} />
      </FlexWidget>
    </FlexWidget>
  )
}

function WeekdayRow({ compact }: { compact?: boolean }) {
  return (
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', marginBottom: 2 }}>
      {WEEKDAYS.map((weekday) => (
        <FlexWidget key={weekday.index} style={{ flex: 1, alignItems: 'center' }}>
          <TextWidget
            text={weekday.shortNp.slice(0, compact ? 2 : 3)}
            style={{
              fontSize: compact ? 9 : 10,
              color: weekday.index === 6 ? theme.saturday : theme.textMuted,
              fontWeight: '600',
            }}
          />
        </FlexWidget>
      ))}
    </FlexWidget>
  )
}

function MonthGrid({
  snapshot,
  cellHeight,
  compact,
}: {
  snapshot: WidgetSnapshot
  cellHeight: number
  compact?: boolean
}) {
  const cells = buildMonthCells(snapshot.days)
  const rows: Array<Array<CalendarDay | null>> = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  return (
    <FlexWidget style={{ flexDirection: 'column', width: 'match_parent', flex: 1 }}>
      <WeekdayRow compact={compact} />
      {rows.map((row, rowIndex) => (
        <FlexWidget key={`row-${rowIndex}`} style={{ flexDirection: 'row', width: 'match_parent' }}>
          {row.map((cell, colIndex) => {
            if (!cell) {
              return (
                <FlexWidget
                  key={`e-${rowIndex}-${colIndex}`}
                  style={{ flex: 1, height: cellHeight }}
                />
              )
            }
            const selected =
              cell.bs.day === snapshot.selected.day &&
              cell.bs.month === snapshot.selected.month &&
              cell.bs.year === snapshot.selected.year
            const isToday =
              cell.bs.day === snapshot.today.bs.day &&
              cell.bs.month === snapshot.today.bs.month &&
              cell.bs.year === snapshot.today.bs.year
            const key = `${cell.bs.year}-${String(cell.bs.month).padStart(2, '0')}-${String(cell.bs.day).padStart(2, '0')}`
            const hasFestival = snapshot.festivalDays.has(key)
            const isSaturday = cell.weekday.index === 6
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
                  height: cellHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? theme.selected : '#00000000',
                  borderRadius: 8,
                  borderWidth: isToday && !selected ? 1 : 0,
                  borderColor: theme.todayBorder,
                }}
              >
                <TextWidget
                  text={formatNumber(cell.bs.day, 'devanagari')}
                  style={{
                    fontSize: compact ? 11 : 13,
                    color: selected
                      ? theme.selectedText
                      : isSaturday
                        ? theme.saturday
                        : theme.text,
                    fontWeight: '700',
                  }}
                />
                <TextWidget
                  text={String(cell.ad.day)}
                  style={{
                    fontSize: compact ? 8 : 9,
                    color: selected
                      ? theme.selectedText
                      : hasFestival
                        ? theme.accent
                        : theme.textMuted,
                  }}
                />
              </FlexWidget>
            )
          })}
        </FlexWidget>
      ))}
    </FlexWidget>
  )
}

export function MitiSmallWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day =
    snapshot.today.bs.year === snapshot.visibleYear &&
    snapshot.today.bs.month === snapshot.visibleMonth
      ? snapshot.today
      : selectedDayInVisibleMonth(snapshot)

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `miti://calendar?bs=${day.bs.year}-${day.bs.month}-${day.bs.day}` }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.bg,
        borderRadius: 20,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <TextWidget
        text={`${day.bs.monthNameNp} ${formatNumber(day.bs.year, 'devanagari')}`}
        style={{ fontSize: 12, color: theme.textMuted }}
      />
      <TextWidget
        text={formatNumber(day.bs.day, 'devanagari')}
        style={{ fontSize: 40, color: theme.text, fontWeight: '700' }}
      />
      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget
          text={`${day.ad.monthNameEn.slice(0, 3)} ${day.ad.day} · ${day.weekday.shortEn}`}
          style={{ fontSize: 12, color: theme.textMuted }}
        />
        {snapshot.festivalTitle ? (
          <TextWidget
            text={`✦ ${snapshot.festivalTitle}`}
            style={{ fontSize: 11, color: theme.accent, marginTop: 4 }}
          />
        ) : null}
      </FlexWidget>
    </FlexWidget>
  )
}

export function MitiMediumWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day = selectedDayInVisibleMonth(snapshot)
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.bg,
        borderRadius: 20,
        padding: 10,
        flexDirection: 'column',
      }}
    >
      <MonthHeader snapshot={snapshot} />
      <MonthGrid snapshot={snapshot} cellHeight={28} compact />
      <TextWidget
        text={
          snapshot.festivalTitle
            ? `✦ ${snapshot.festivalTitle}`
            : `${formatNumber(day.bs.day, 'devanagari')} ${day.bs.monthNameNp} · ${day.weekday.nameEn}`
        }
        style={{ fontSize: 11, color: snapshot.festivalTitle ? theme.accent : theme.textMuted, marginTop: 4 }}
      />
    </FlexWidget>
  )
}

export function MitiLargeWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day = selectedDayInVisibleMonth(snapshot)
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.bg,
        borderRadius: 22,
        padding: 12,
        flexDirection: 'column',
      }}
    >
      <MonthHeader snapshot={snapshot} />
      <MonthGrid snapshot={snapshot} cellHeight={36} />
      <FlexWidget style={{ flexDirection: 'column', marginTop: 6 }}>
        <TextWidget
          text={`${formatNumber(day.bs.day, 'devanagari')} ${day.bs.monthNameNp} · ${day.weekday.nameEn}`}
          style={{ fontSize: 13, color: theme.text, fontWeight: '600' }}
        />
        {snapshot.festivalTitle ? (
          <TextWidget
            text={`✦ ${snapshot.festivalTitle}`}
            style={{ fontSize: 12, color: theme.accent, marginTop: 2 }}
          />
        ) : (
          <TextWidget
            text={`${day.ad.monthNameEn} ${day.ad.day}, ${day.ad.year}`}
            style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}
          />
        )}
      </FlexWidget>
    </FlexWidget>
  )
}
