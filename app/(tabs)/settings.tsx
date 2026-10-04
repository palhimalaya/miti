import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { useTheme } from '@/src/theme/ThemeProvider'
import { scheduleLocalReminders } from '@/src/services/notifications'
import { refreshWidgets } from '@/src/features/widget/refreshWidgets'

function OptionRow({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.option,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.bgMuted,
        },
      ]}
    >
      <Text style={{ color: active ? theme.colors.primaryText : theme.colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  )
}

export default function SettingsScreen() {
  const theme = useTheme()
  const {
    numeralSystem,
    theme: themeSetting,
    uiLanguage,
    widgetShowPersonal,
    setNumeralSystem,
    setTheme,
    setUiLanguage,
    setWidgetShowPersonal,
  } = useSettingsStore()

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bgCanvas }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[theme.typography.titleBs, { color: theme.colors.textPrimary }]}>Settings</Text>
        <Text style={[theme.typography.subtitleAd, { color: theme.colors.textSecondary }]}>
          Bilingual · Nepali-first · Asia/Kathmandu today
        </Text>

        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>Numerals</Text>
        <View style={styles.row}>
          <OptionRow
            label="नेपाली १८"
            active={numeralSystem === 'devanagari'}
            onPress={() => {
              void setNumeralSystem('devanagari').then(() => refreshWidgets())
            }}
          />
          <OptionRow
            label="Arabic 18"
            active={numeralSystem === 'arabic'}
            onPress={() => {
              void setNumeralSystem('arabic').then(() => refreshWidgets())
            }}
          />
        </View>

        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>Theme</Text>
        <View style={styles.row}>
          {(['system', 'light', 'dark'] as const).map((value) => (
            <OptionRow
              key={value}
              label={value}
              active={themeSetting === value}
              onPress={() => {
                void setTheme(value)
              }}
            />
          ))}
        </View>

        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>Language</Text>
        <View style={styles.row}>
          {(
            [
              ['bilingual', 'Bilingual'],
              ['np', 'नेपाली'],
              ['en', 'English'],
            ] as const
          ).map(([value, label]) => (
            <OptionRow
              key={value}
              label={label}
              active={uiLanguage === value}
              onPress={() => {
                void setUiLanguage(value)
              }}
            />
          ))}
        </View>

        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>Widget privacy</Text>
        <View style={styles.row}>
          <OptionRow
            label="Hide personal titles"
            active={!widgetShowPersonal}
            onPress={() => {
              void setWidgetShowPersonal(false).then(() => refreshWidgets())
            }}
          />
          <OptionRow
            label="Show personal titles"
            active={widgetShowPersonal}
            onPress={() => {
              void setWidgetShowPersonal(true).then(() => refreshWidgets())
            }}
          />
        </View>

        <Pressable
          onPress={() => {
            void scheduleLocalReminders()
          }}
          style={[styles.action, { backgroundColor: theme.colors.bgMuted }]}
        >
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>
            Refresh local notifications
          </Text>
        </Pressable>

        <Text style={[theme.typography.caption, { color: theme.colors.textAdSecondary, marginTop: 20 }]}>
          Package com.uplixor.miti · Offline-first · Festival dates from verified seed data
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 10 },
  section: {
    marginTop: 18,
    marginBottom: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  action: {
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
})
