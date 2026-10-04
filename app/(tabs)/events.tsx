import { useCallback, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { listActiveEvents, softDeleteEvent, type PersonalEvent } from '@/src/db/repositories/events'
import { useTheme } from '@/src/theme/ThemeProvider'
import { formatNumber } from '@/src/utils/numerals'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { BS_MONTH_NAMES_NP } from '@/src/domain/calendar'
import { scheduleLocalReminders } from '@/src/services/notifications'

export default function EventsScreen() {
  const theme = useTheme()
  const router = useRouter()
  const numeralSystem = useSettingsStore((s) => s.numeralSystem)
  const [items, setItems] = useState<PersonalEvent[]>([])

  const reload = useCallback(() => {
    void listActiveEvents().then(setItems)
  }, [])

  useFocusEffect(
    useCallback(() => {
      reload()
      void scheduleLocalReminders()
    }, [reload]),
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bgCanvas }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[theme.typography.titleBs, { color: theme.colors.textPrimary }]}>
            Events
          </Text>
          <Pressable
            onPress={() => router.push('/event-modal')}
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>+ Add</Text>
          </Pressable>
        </View>
        <Text style={[theme.typography.subtitleAd, { color: theme.colors.textSecondary }]}>
          Personal reminders stay on this device
        </Text>

        {items.length === 0 ? (
          <Text style={[theme.typography.body, { color: theme.colors.textAdSecondary, marginTop: 24 }]}>
            No personal events yet.
          </Text>
        ) : (
          items.map((event) => (
            <View
              key={event.id}
              style={[
                styles.card,
                { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle },
              ]}
            >
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '700' }]}>
                {event.title}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {formatNumber(event.bsDay, numeralSystem)}{' '}
                {BS_MONTH_NAMES_NP[(event.bsMonth ?? 1) - 1]}{' '}
                {formatNumber(event.bsYear ?? 0, numeralSystem)} · {event.adMonth}/{event.adDay}/
                {event.adYear}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textAdSecondary }]}>
                {event.type}
              </Text>
              <Pressable
                onPress={() => {
                  void softDeleteEvent(event.id).then(reload)
                }}
              >
                <Text style={{ color: theme.colors.danger, marginTop: 8 }}>Delete</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
})
