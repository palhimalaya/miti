import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BS_MONTH_NAMES_NP } from '@/src/domain/calendar'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { useTheme } from '@/src/theme/ThemeProvider'
import { scheduleLocalReminders } from '@/src/services/notifications'
import { refreshWidgets } from '@/src/features/widget/refreshWidgets'
import {
  checkForAppUpdate,
  getInstalledVersion,
  type AppUpdateInfo,
} from '@/src/services/appUpdate'
import { UpdateAvailableCard } from '@/src/features/update/UpdateAvailableCard'
import { DEFAULT_SPECIAL_NOTE } from '@/src/features/calendar/easterEgg'
import { formatNumber } from '@/src/utils/numerals'

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
    specialDay,
    setNumeralSystem,
    setTheme,
    setUiLanguage,
    setWidgetShowPersonal,
    setSpecialDay,
  } = useSettingsStore()
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)
  const [draftMonth, setDraftMonth] = useState(specialDay?.bsMonth ?? 4)
  const [draftDay, setDraftDay] = useState(specialDay?.bsDay ?? 14)
  const [draftNote, setDraftNote] = useState(specialDay?.note ?? DEFAULT_SPECIAL_NOTE)

  useEffect(() => {
    setDraftMonth(specialDay?.bsMonth ?? 4)
    setDraftDay(specialDay?.bsDay ?? 14)
    setDraftNote(specialDay?.note ?? DEFAULT_SPECIAL_NOTE)
  }, [specialDay])

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

        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>
          Special day (private)
        </Text>
        <Text style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>
          Pick a BS month/day. It gets a quiet gold edge on the grid. Triple-tap the day title to
          reveal your note. Stored only on this device.
        </Text>
        <Text style={[styles.subLabel, { color: theme.colors.textAdSecondary }]}>Month</Text>
        <View style={styles.row}>
          {BS_MONTH_NAMES_NP.map((name, index) => {
            const month = index + 1
            return (
              <OptionRow
                key={name}
                label={name}
                active={draftMonth === month}
                onPress={() => setDraftMonth(month)}
              />
            )
          })}
        </View>
        <Text style={[styles.subLabel, { color: theme.colors.textAdSecondary }]}>Day</Text>
        <View style={styles.row}>
          {Array.from({ length: 32 }, (_, i) => i + 1).map((day) => (
            <OptionRow
              key={day}
              label={formatNumber(day, numeralSystem)}
              active={draftDay === day}
              onPress={() => setDraftDay(day)}
            />
          ))}
        </View>
        <Text style={[styles.subLabel, { color: theme.colors.textAdSecondary }]}>Reveal note</Text>
        <TextInput
          value={draftNote}
          onChangeText={setDraftNote}
          placeholder={DEFAULT_SPECIAL_NOTE}
          placeholderTextColor={theme.colors.textAdSecondary}
          multiline
          style={[
            styles.noteInput,
            {
              color: theme.colors.textPrimary,
              backgroundColor: theme.colors.bgMuted,
              borderColor: theme.colors.borderSubtle,
            },
          ]}
        />
        <View style={styles.row}>
          <Pressable
            onPress={() => {
              void setSpecialDay({
                bsMonth: draftMonth,
                bsDay: draftDay,
                note: draftNote,
              })
            }}
            style={[styles.actionInline, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Save special day</Text>
          </Pressable>
          {specialDay ? (
            <Pressable
              onPress={() => {
                void setSpecialDay(null)
              }}
              style={[styles.actionInline, { backgroundColor: theme.colors.bgMuted }]}
            >
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
        {specialDay ? (
          <Text style={{ color: theme.colors.textSecondary }}>
            Active: {BS_MONTH_NAMES_NP[specialDay.bsMonth - 1]}{' '}
            {formatNumber(specialDay.bsDay, numeralSystem)}
          </Text>
        ) : (
          <Text style={{ color: theme.colors.textAdSecondary }}>No special day saved yet.</Text>
        )}

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

        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>App updates</Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          Installed {getInstalledVersion()}
        </Text>
        <Pressable
          disabled={checkingUpdate}
          onPress={() => {
            setCheckingUpdate(true)
            setUpdateMessage(null)
            void checkForAppUpdate()
              .then((info) => {
                setUpdateInfo(info.available ? info : null)
                setUpdateMessage(
                  info.available
                    ? null
                    : `You are on the latest release (${info.currentVersion}).`,
                )
              })
              .finally(() => setCheckingUpdate(false))
          }}
          style={[styles.action, { backgroundColor: theme.colors.bgMuted, marginTop: 8 }]}
        >
          {checkingUpdate ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>
              Check for updates
            </Text>
          )}
        </Pressable>
        {updateMessage ? (
          <Text style={{ color: theme.colors.textSecondary }}>{updateMessage}</Text>
        ) : null}
        {updateInfo ? <UpdateAvailableCard update={updateInfo} /> : null}

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
  subLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  noteInput: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  action: {
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionInline: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
})
