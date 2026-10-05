import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getDay } from '@/src/domain/calendar'
import { useCalendarStore } from '@/src/stores/calendarStore'

/**
 * Deep-link landing for widget taps (`miti://calendar?bs=YYYY-M-D`).
 * Avoids the brief "+not-found" flash by owning this route, then replaces to tabs.
 */
export default function CalendarDeepLinkScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ bs?: string }>()
  const selectDay = useCalendarStore((s) => s.selectDay)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const bs = typeof params.bs === 'string' ? params.bs : null
      if (bs) {
        const [year, month, day] = bs.split('-').map(Number)
        if (year && month && day) {
          const calendarDay = getDay({ year, month, day })
          if (calendarDay.ok) {
            await selectDay(calendarDay.value)
          }
        }
      }
      if (!cancelled) {
        router.replace('/(tabs)')
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [params.bs, router, selectDay])

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF8EC',
      }}
    >
      <ActivityIndicator color="#9B1C31" />
    </View>
  )
}
