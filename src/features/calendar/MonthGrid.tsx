import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import type { CalendarDay } from '@/src/domain/calendar'
import { WEEKDAYS } from '@/src/domain/calendar'
import { DateCell } from './DateCell'
import { useTheme } from '@/src/theme/ThemeProvider'
import { bsKey } from '@/src/stores/calendarStore'
import type { NumeralSystem } from '@/src/utils/numerals'

type Props = {
  days: CalendarDay[]
  selected: CalendarDay | null
  today: CalendarDay | null
  festivalMarkers: Set<string>
  numeralSystem: NumeralSystem
  onSelect: (day: CalendarDay) => void
}

function buildGrid(days: CalendarDay[]): Array<CalendarDay | null> {
  if (days.length === 0) return []
  const first = days[0]!
  const leading = first.weekday.index
  const cells: Array<CalendarDay | null> = []
  for (let i = 0; i < leading; i += 1) cells.push(null)
  for (const day of days) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function chunkRows(cells: Array<CalendarDay | null>): Array<Array<CalendarDay | null>> {
  const rows: Array<Array<CalendarDay | null>> = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  return rows
}

export function MonthGrid({
  days,
  selected,
  today,
  festivalMarkers,
  numeralSystem,
  onSelect,
}: Props) {
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const horizontalPadding = 32
  const cellWidth = (width - horizontalPadding) / 7
  const cells = buildGrid(days)
  const rows = chunkRows(cells)

  return (
    <View style={styles.wrap}>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((weekday) => (
          <View key={weekday.index} style={[styles.weekday, { width: cellWidth }]}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {weekday.shortNp}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textAdSecondary }]}>
              {weekday.shortEn}
            </Text>
          </View>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((day, colIndex) => {
            const key = day ? bsKey(day.bs) : `empty-${rowIndex}-${colIndex}`
            const selectedKey = selected ? bsKey(selected.bs) : null
            const todayKey = today ? bsKey(today.bs) : null
            return (
              <DateCell
                key={key}
                day={day}
                width={cellWidth}
                selected={!!day && key === selectedKey}
                isToday={!!day && key === todayKey}
                hasFestival={!!day && festivalMarkers.has(key)}
                numeralSystem={numeralSystem}
                onPress={onSelect}
              />
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    alignItems: 'center',
    gap: 1,
  },
  row: {
    flexDirection: 'row',
  },
})
