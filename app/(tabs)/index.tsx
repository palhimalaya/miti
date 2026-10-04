import { useMemo } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CalendarHeader } from '@/src/features/calendar/CalendarHeader'
import { MonthGrid } from '@/src/features/calendar/MonthGrid'
import { SelectedDayPanel } from '@/src/features/calendar/SelectedDayPanel'
import { useCalendarStore } from '@/src/stores/calendarStore'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { useTheme } from '@/src/theme/ThemeProvider'
import { softDeleteEvent } from '@/src/db/repositories/events'
import { refreshWidgets } from '@/src/features/widget/refreshWidgets'

export default function CalendarScreen() {
  const theme = useTheme()
  const router = useRouter()
  const numeralSystem = useSettingsStore((s) => s.numeralSystem)
  const {
    visibleYear,
    visibleMonth,
    monthDays,
    selected,
    today,
    festivalMarkers,
    dayFestivals,
    dayEvents,
    loading,
    error,
    nextMonth,
    prevMonth,
    setVisibleMonth,
    goToToday,
    selectDay,
    refreshDayDetails,
  } = useCalendarStore()

  const adLabel = useMemo(() => {
    if (monthDays.length === 0) return ''
    const first = monthDays[0]!
    const last = monthDays[monthDays.length - 1]!
    if (first.ad.month === last.ad.month) {
      return `${first.ad.monthNameEn} ${first.ad.year}`
    }
    return `${first.ad.monthNameEn}/${last.ad.monthNameEn} ${last.ad.year}`
  }, [monthDays])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.bgCanvas }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bgCanvas }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[theme.typography.titleBs, { color: theme.colors.textPrimary, marginBottom: 8 }]}>
          Calendar
        </Text>
        {error ? (
          <Text style={{ color: theme.colors.danger, marginBottom: 12 }}>{error}</Text>
        ) : null}
        <CalendarHeader
          bsYear={visibleYear}
          bsMonth={visibleMonth}
          adLabel={adLabel}
          numeralSystem={numeralSystem}
          onPrev={() => {
            void prevMonth().then(() => refreshWidgets())
          }}
          onNext={() => {
            void nextMonth().then(() => refreshWidgets())
          }}
          onToday={() => {
            void goToToday().then(() => refreshWidgets())
          }}
          onSelectMonth={(year, month) => {
            void setVisibleMonth(year, month).then(() => refreshWidgets())
          }}
        />
        <MonthGrid
          days={monthDays}
          selected={selected}
          today={today}
          festivalMarkers={festivalMarkers}
          numeralSystem={numeralSystem}
          onSelect={(day) => {
            void selectDay(day).then(() => refreshWidgets())
          }}
        />
        <SelectedDayPanel
          day={selected}
          festivals={dayFestivals}
          events={dayEvents}
          numeralSystem={numeralSystem}
          onAddEvent={() => router.push('/event-modal')}
          onDeleteEvent={(id) => {
            void softDeleteEvent(id).then(() => refreshDayDetails())
          }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
