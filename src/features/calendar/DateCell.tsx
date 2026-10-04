import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { CalendarDay } from '@/src/domain/calendar'
import { useTheme } from '@/src/theme/ThemeProvider'
import { formatNumber, type NumeralSystem } from '@/src/utils/numerals'

type Props = {
  day: CalendarDay | null
  width: number
  selected: boolean
  isToday: boolean
  hasFestival: boolean
  isSpecialDay?: boolean
  numeralSystem: NumeralSystem
  onPress?: (day: CalendarDay) => void
}

export function DateCell({
  day,
  width,
  selected,
  isToday,
  hasFestival,
  isSpecialDay = false,
  numeralSystem,
  onPress,
}: Props) {
  const theme = useTheme()

  if (!day) {
    return <View style={[styles.cell, { width }]} />
  }

  // Nearly invisible gold whisper — no label.
  const secretWhisper = isSpecialDay && !selected && !isToday

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${day.bs.day} ${day.bs.monthNameEn} ${day.bs.year}, ${day.ad.monthNameEn} ${day.ad.day} ${day.ad.year}${hasFestival ? ', has occasion' : ''}`}
      onPress={() => onPress?.(day)}
      style={[
        styles.cell,
        {
          width,
          backgroundColor: selected
            ? theme.colors.selected
            : isToday
              ? theme.colors.bgMuted
              : 'transparent',
          borderColor: secretWhisper
            ? theme.colors.festive
            : isToday && !selected
              ? theme.colors.today
              : 'transparent',
          borderWidth: secretWhisper ? StyleSheet.hairlineWidth : isToday && !selected ? 1.5 : 0,
          borderRadius: theme.radii.md,
        },
      ]}
    >
      <Text
        style={[
          theme.typography.cellBs,
          {
            color: selected ? theme.colors.selectedText : theme.colors.textBsDominant,
          },
        ]}
      >
        {formatNumber(day.bs.day, numeralSystem)}
      </Text>
      <Text
        style={[
          theme.typography.cellAd,
          {
            color: selected ? theme.colors.selectedText : theme.colors.textAdSecondary,
            opacity: selected ? 0.9 : 1,
          },
        ]}
      >
        {day.ad.day}
      </Text>
      {hasFestival ? (
        <View
          style={[
            styles.dot,
            { backgroundColor: selected ? theme.colors.selectedText : theme.colors.festive },
          ]}
        />
      ) : (
        <View style={styles.dotPlaceholder} />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  cell: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 2,
  },
})
