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

/**
 * Midnight theme — modern Nepali editorial.
 *
 * IMPORTANT: react-native-android-widget treats 8-digit hex as RRGGBBAA
 * (not Android AARRGGBB). Always use 6-digit #RRGGBB for opaque colors.
 * Using #AARRGGBB made the widget ~7% opaque red glass over wallpaper.
 */
const theme = {
  bg: '#151413',
  surface: '#242220',
  strip: '#1C1B19',
  text: '#F7F4EE',
  textMuted: '#A8A29A',
  accent: '#C4A35A',
  selected: '#9B1C31',
  selectedText: '#FFF8EC',
  saturday: '#D4A39A',
  todayBorder: '#6F9473',
  transparent: '#00000000',
} as const

function openCalendarUri(day: CalendarDay): string {
  return `miti://calendar?bs=${day.bs.year}-${day.bs.month}-${day.bs.day}`
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
  return `${first.ad.monthNameEn.slice(0, 3)} / ${last.ad.monthNameEn.slice(0, 3)}`
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

function MonthHeader({
  snapshot,
  openUri,
  compact,
}: {
  snapshot: WidgetSnapshot
  openUri: string
  compact?: boolean
}) {
  if (compact) {
    // Single row — saves vertical space for the full month grid.
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
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget text="‹" style={{ fontSize: 20, color: theme.text }} />
        </FlexWidget>

        <FlexWidget
          clickAction="OPEN_URI"
          clickActionData={{ uri: openUri }}
          style={{ flexDirection: 'column', alignItems: 'center', flex: 1 }}
        >
          <TextWidget
            text={visibleMonthLabel(snapshot)}
            style={{ fontSize: 14, color: theme.text, fontWeight: '700' }}
          />
          <TextWidget
            text={visibleAdRange(snapshot)}
            style={{ fontSize: 10, color: theme.textMuted }}
          />
        </FlexWidget>

        <FlexWidget
          clickAction="NEXT_MONTH"
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget text="›" style={{ fontSize: 20, color: theme.text }} />
        </FlexWidget>
      </FlexWidget>
    )
  }

  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        width: 'match_parent',
        marginBottom: 6,
      }}
    >
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: openUri }}
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          width: 'match_parent',
          marginBottom: 8,
        }}
      >
        <TextWidget
          text={visibleMonthLabel(snapshot)}
          style={{ fontSize: 17, color: theme.text, fontWeight: '700' }}
        />
        <TextWidget
          text={visibleAdRange(snapshot)}
          style={{ fontSize: 11, color: theme.textMuted, marginTop: 3 }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <FlexWidget
          clickAction="PREV_MONTH"
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget text="‹" style={{ fontSize: 22, color: theme.text }} />
        </FlexWidget>

        <FlexWidget style={{ flex: 1 }} />

        <FlexWidget
          clickAction="NEXT_MONTH"
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget text="›" style={{ fontSize: 22, color: theme.text }} />
        </FlexWidget>
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
            text={weekday.shortNp.slice(0, compact ? 1 : 2)}
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
  showFestivalMarkers,
}: {
  snapshot: WidgetSnapshot
  cellHeight: number
  compact?: boolean
  showFestivalMarkers?: boolean
}) {
  const cells = buildMonthCells(snapshot.days)
  const rows: Array<Array<CalendarDay | null>> = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  return (
    <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
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
            const hasFestival = showFestivalMarkers === true && snapshot.festivalDays.has(key)
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
                  backgroundColor: selected ? theme.selected : theme.transparent,
                  borderRadius: 6,
                  borderWidth: isToday && !selected ? 1 : 0,
                  borderColor: theme.todayBorder,
                }}
              >
                <TextWidget
                  text={formatNumber(cell.bs.day, 'devanagari')}
                  style={{
                    fontSize: compact ? 12 : 13,
                    color: selected
                      ? theme.selectedText
                      : isSaturday
                        ? theme.saturday
                        : theme.text,
                    fontWeight: '700',
                  }}
                />
                {!compact ? (
                  <TextWidget
                    text={String(cell.ad.day)}
                    style={{
                      fontSize: 9,
                      color: selected
                        ? theme.selectedText
                        : hasFestival
                          ? theme.accent
                          : theme.textMuted,
                    }}
                  />
                ) : null}
              </FlexWidget>
            )
          })}
        </FlexWidget>
      ))}
    </FlexWidget>
  )
}

function SelectedDateStrip({
  day,
  openUri,
  festivalTitle,
}: {
  day: CalendarDay
  openUri: string
  festivalTitle?: string
}) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: openUri }}
      style={{
        width: 'match_parent',
        backgroundColor: theme.strip,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 6,
        flexDirection: 'column',
      }}
    >
      <TextWidget
        text={`${formatNumber(day.bs.day, 'devanagari')} ${day.bs.monthNameNp} ${formatNumber(day.bs.year, 'devanagari')} · ${day.weekday.nameEn}`}
        style={{ fontSize: 12, color: theme.text, fontWeight: '600' }}
      />
      <TextWidget
        text={
          festivalTitle
            ? `✦ ${festivalTitle}`
            : `${day.ad.monthNameEn} ${day.ad.day}, ${day.ad.year}`
        }
        style={{
          fontSize: 11,
          color: festivalTitle ? theme.accent : theme.textMuted,
          marginTop: 2,
        }}
      />
    </FlexWidget>
  )
}

/** Today — large BS date, AD secondary. */
export function MitiSmallWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day =
    snapshot.today.bs.year === snapshot.visibleYear &&
    snapshot.today.bs.month === snapshot.visibleMonth
      ? snapshot.today
      : selectedDayInVisibleMonth(snapshot)

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: openCalendarUri(day) }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.bg,
        borderRadius: 20,
        padding: 14,
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
        style={{ fontSize: 44, color: theme.text, fontWeight: '700' }}
      />
      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget
          text={day.weekday.nameEn}
          style={{ fontSize: 13, color: theme.text, fontWeight: '600' }}
        />
        <TextWidget
          text={`${day.ad.monthNameEn} ${day.ad.day}, ${day.ad.year}`}
          style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}
        />
      </FlexWidget>
    </FlexWidget>
  )
}

/** Month — full month grid only (no bottom date card). */
export function MitiMediumWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day = selectedDayInVisibleMonth(snapshot)
  const uri = openCalendarUri(day)
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.bg,
        borderRadius: 20,
        padding: 8,
        flexDirection: 'column',
      }}
    >
      <MonthHeader snapshot={snapshot} openUri={uri} compact />
      <MonthGrid snapshot={snapshot} cellHeight={24} compact showFestivalMarkers={false} />
    </FlexWidget>
  )
}

/** Calendar — full month + festival on selected day. */
export function MitiLargeWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  const day = selectedDayInVisibleMonth(snapshot)
  const uri = openCalendarUri(day)
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.bg,
        borderRadius: 20,
        padding: 10,
        flexDirection: 'column',
      }}
    >
      <MonthHeader snapshot={snapshot} openUri={uri} />
      <MonthGrid snapshot={snapshot} cellHeight={30} showFestivalMarkers />
      <SelectedDateStrip day={day} openUri={uri} festivalTitle={snapshot.festivalTitle} />
    </FlexWidget>
  )
}
