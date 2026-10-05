import { useEffect, useState, type ReactNode } from 'react'
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
import {
  scheduleLocalReminders,
  syncTodayNotificationBar,
} from '@/src/services/notifications'
import { refreshWidgets } from '@/src/features/widget/refreshWidgets'
import {
  checkForAppUpdate,
  getInstalledVersion,
  type AppUpdateInfo,
} from '@/src/services/appUpdate'
import { UpdateAvailableCard } from '@/src/features/update/UpdateAvailableCard'
import { DEFAULT_SPECIAL_NOTE } from '@/src/features/calendar/easterEgg'
import { formatNumber } from '@/src/utils/numerals'

function OptionChip({
  label,
  active,
  onPress,
  compact,
}: {
  label: string
  active: boolean
  onPress: () => void
  compact?: boolean
}) {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={[
        compact ? styles.chipCompact : styles.chip,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.bgMuted,
        },
      ]}
    >
      <Text
        style={{
          color: active ? theme.colors.primaryText : theme.colors.textPrimary,
          fontSize: compact ? 13 : 15,
          fontWeight: active ? '700' : '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function SettingsCard({
  title,
  subtitle,
  expanded,
  onToggle,
  children,
}: {
  title: string
  subtitle?: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.bgSurface,
          borderColor: theme.colors.borderSubtle,
        },
      ]}
    >
      <Pressable onPress={onToggle} style={styles.cardHeader} accessibilityRole="button">
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
          {subtitle ? (
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{subtitle}</Text>
          ) : null}
        </View>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 18 }}>
          {expanded ? '▾' : '▸'}
        </Text>
      </Pressable>
      {expanded ? <View style={styles.cardBody}>{children}</View> : null}
    </View>
  )
}

type SectionKey = 'appearance' | 'home' | 'special' | 'about'

export default function SettingsScreen() {
  const theme = useTheme()
  const {
    numeralSystem,
    theme: themeSetting,
    uiLanguage,
    widgetShowPersonal,
    showTodayNotificationBar,
    specialDay,
    setNumeralSystem,
    setTheme,
    setUiLanguage,
    setWidgetShowPersonal,
    setShowTodayNotificationBar,
    setSpecialDay,
  } = useSettingsStore()
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)
  const [draftMonth, setDraftMonth] = useState(specialDay?.bsMonth ?? 4)
  const [draftDay, setDraftDay] = useState(specialDay?.bsDay ?? 14)
  const [draftNote, setDraftNote] = useState(specialDay?.note ?? DEFAULT_SPECIAL_NOTE)
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    appearance: true,
    home: false,
    special: false,
    about: false,
  })

  useEffect(() => {
    setDraftMonth(specialDay?.bsMonth ?? 4)
    setDraftDay(specialDay?.bsDay ?? 14)
    setDraftNote(specialDay?.note ?? DEFAULT_SPECIAL_NOTE)
  }, [specialDay])

  const toggle = (key: SectionKey) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const specialSummary = specialDay
    ? `${BS_MONTH_NAMES_NP[specialDay.bsMonth - 1]} ${formatNumber(specialDay.bsDay, numeralSystem)}`
    : 'Not set'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bgCanvas }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[theme.typography.titleBs, { color: theme.colors.textPrimary }]}>Settings</Text>
        <Text style={[theme.typography.subtitleAd, { color: theme.colors.textSecondary }]}>
          Appearance, home screen, and private extras
        </Text>

        <SettingsCard
          title="Appearance"
          subtitle="Theme, language, numerals"
          expanded={open.appearance}
          onToggle={() => toggle('appearance')}
        >
          <Text style={[styles.groupLabel, { color: theme.colors.textAdSecondary }]}>Theme</Text>
          <View style={styles.row}>
            {(['system', 'light', 'dark'] as const).map((value) => (
              <OptionChip
                key={value}
                label={value}
                active={themeSetting === value}
                onPress={() => {
                  void setTheme(value)
                }}
              />
            ))}
          </View>

          <Text style={[styles.groupLabel, { color: theme.colors.textAdSecondary }]}>Language</Text>
          <View style={styles.row}>
            {(
              [
                ['bilingual', 'Bilingual'],
                ['np', 'नेपाली'],
                ['en', 'English'],
              ] as const
            ).map(([value, label]) => (
              <OptionChip
                key={value}
                label={label}
                active={uiLanguage === value}
                onPress={() => {
                  void setUiLanguage(value)
                }}
              />
            ))}
          </View>

          <Text style={[styles.groupLabel, { color: theme.colors.textAdSecondary }]}>Numerals</Text>
          <View style={styles.row}>
            <OptionChip
              label="नेपाली १८"
              active={numeralSystem === 'devanagari'}
              onPress={() => {
                void setNumeralSystem('devanagari').then(() => refreshWidgets())
              }}
            />
            <OptionChip
              label="Arabic 18"
              active={numeralSystem === 'arabic'}
              onPress={() => {
                void setNumeralSystem('arabic').then(() => refreshWidgets())
              }}
            />
          </View>
        </SettingsCard>

        <SettingsCard
          title="Home screen & alerts"
          subtitle={
            showTodayNotificationBar ? 'Today bar on · widget privacy' : 'Today bar off · widget privacy'
          }
          expanded={open.home}
          onToggle={() => toggle('home')}
        >
          <Text style={[styles.groupLabel, { color: theme.colors.textAdSecondary }]}>
            Nepali today bar
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
            Persistent notification with today’s BS date and festivals.
          </Text>
          <View style={styles.row}>
            <OptionChip
              label="Off"
              active={!showTodayNotificationBar}
              onPress={() => {
                void setShowTodayNotificationBar(false).then(() => syncTodayNotificationBar(false))
              }}
            />
            <OptionChip
              label="On"
              active={showTodayNotificationBar}
              onPress={() => {
                void setShowTodayNotificationBar(true).then(() => syncTodayNotificationBar(true))
              }}
            />
          </View>

          <Text style={[styles.groupLabel, { color: theme.colors.textAdSecondary }]}>
            Widget privacy
          </Text>
          <View style={styles.row}>
            <OptionChip
              label="Hide personal"
              active={!widgetShowPersonal}
              onPress={() => {
                void setWidgetShowPersonal(false).then(() => refreshWidgets())
              }}
            />
            <OptionChip
              label="Show personal"
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
            style={[styles.secondaryBtn, { backgroundColor: theme.colors.bgMuted }]}
          >
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>
              Refresh tomorrow reminders
            </Text>
          </Pressable>
        </SettingsCard>

        <SettingsCard
          title="Special day"
          subtitle={`Private · ${specialSummary}`}
          expanded={open.special}
          onToggle={() => toggle('special')}
        >
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
            Gold edge on the grid. Triple-tap that day’s title on Calendar to reveal your note.
          </Text>

          <Text style={[styles.groupLabel, { color: theme.colors.textAdSecondary }]}>Month</Text>
          <View style={styles.row}>
            {BS_MONTH_NAMES_NP.map((name, index) => {
              const month = index + 1
              return (
                <OptionChip
                  key={name}
                  compact
                  label={name}
                  active={draftMonth === month}
                  onPress={() => setDraftMonth(month)}
                />
              )
            })}
          </View>

          <Text style={[styles.groupLabel, { color: theme.colors.textAdSecondary }]}>Day</Text>
          <View style={styles.dayGrid}>
            {Array.from({ length: 32 }, (_, i) => i + 1).map((day) => (
              <OptionChip
                key={day}
                compact
                label={formatNumber(day, numeralSystem)}
                active={draftDay === day}
                onPress={() => setDraftDay(day)}
              />
            ))}
          </View>

          <Text style={[styles.groupLabel, { color: theme.colors.textAdSecondary }]}>Note</Text>
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
              style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Save</Text>
            </Pressable>
            {specialDay ? (
              <Pressable
                onPress={() => {
                  void setSpecialDay(null)
                }}
                style={[styles.primaryBtn, { backgroundColor: theme.colors.bgMuted }]}
              >
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Clear</Text>
              </Pressable>
            ) : null}
          </View>
        </SettingsCard>

        <SettingsCard
          title="About & updates"
          subtitle={`v${getInstalledVersion()}`}
          expanded={open.about}
          onToggle={() => toggle('about')}
        >
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
            Installed {getInstalledVersion()} · com.uplixor.miti
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
            style={[styles.secondaryBtn, { backgroundColor: theme.colors.bgMuted }]}
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
          <Text style={[theme.typography.caption, { color: theme.colors.textAdSecondary }]}>
            Offline-first · Festival dates from verified seed data
          </Text>
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
  },
  groupLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  noteInput: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtn: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
})
