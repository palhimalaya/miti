import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { CalendarDay } from '@/src/domain/calendar'
import type { FestivalOccurrence } from '@/src/db/repositories/festivals'
import type { PersonalEvent } from '@/src/db/repositories/events'
import { useTheme } from '@/src/theme/ThemeProvider'
import { formatNumber, type NumeralSystem } from '@/src/utils/numerals'

type Props = {
  day: CalendarDay | null
  festivals: FestivalOccurrence[]
  events: PersonalEvent[]
  numeralSystem: NumeralSystem
  onAddEvent?: () => void
  onDeleteEvent?: (id: string) => void
}

export function SelectedDayPanel({
  day,
  festivals,
  events,
  numeralSystem,
  onAddEvent,
  onDeleteEvent,
}: Props) {
  const theme = useTheme()

  if (!day) return null

  return (
    <View style={[styles.panel, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle }]}>
      <Text style={[theme.typography.titleBs, { color: theme.colors.textPrimary }]}>
        {formatNumber(day.bs.day, numeralSystem)} {day.bs.monthNameNp}{' '}
        {formatNumber(day.bs.year, numeralSystem)}
      </Text>
      <Text style={[theme.typography.subtitleAd, { color: theme.colors.textSecondary }]}>
        {day.weekday.nameEn} · {day.ad.monthNameEn} {day.ad.day}, {day.ad.year}
      </Text>

      <View style={styles.section}>
        <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>
          Occasions
        </Text>
        {festivals.length === 0 ? (
          <Text style={[theme.typography.body, { color: theme.colors.textAdSecondary }]}>
            No festivals or holidays
          </Text>
        ) : (
          festivals.map((festival) => (
            <View key={festival.id} style={styles.item}>
              <Text style={{ color: theme.colors.festive, fontSize: 16 }}>✦</Text>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '600' }]}>
                  {festival.titleNp}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  {festival.titleEn}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>
            My Events
          </Text>
          {onAddEvent ? (
            <Pressable onPress={onAddEvent} accessibilityRole="button">
              <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>+ Add</Text>
            </Pressable>
          ) : null}
        </View>
        {events.length === 0 ? (
          <Text style={[theme.typography.body, { color: theme.colors.textAdSecondary }]}>
            No personal events
          </Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                  {event.title}
                </Text>
                {event.notes ? (
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    {event.notes}
                  </Text>
                ) : null}
              </View>
              {onDeleteEvent ? (
                <Pressable onPress={() => onDeleteEvent(event.id)} accessibilityRole="button">
                  <Text style={{ color: theme.colors.danger }}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  section: {
    marginTop: 12,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
