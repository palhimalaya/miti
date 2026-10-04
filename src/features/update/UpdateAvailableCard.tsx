import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import type { AppUpdateInfo } from '@/src/services/appUpdate'
import { useTheme } from '@/src/theme/ThemeProvider'

type Props = {
  update: AppUpdateInfo
  onDismiss?: () => void
}

export function UpdateAvailableCard({ update, onDismiss }: Props) {
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
      <Text style={[theme.typography.subtitleAd, { color: theme.colors.textPrimary, fontWeight: '700' }]}>
        Update available
      </Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
        {update.currentVersion} → {update.latestVersion}
      </Text>
      {update.releaseNotes ? (
        <Text
          numberOfLines={4}
          style={{ color: theme.colors.textAdSecondary, marginTop: 8, fontSize: 13 }}
        >
          {update.releaseNotes}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open release page"
          onPress={() => {
            void Linking.openURL(update.releaseUrl)
          }}
          style={[styles.primary, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>View release</Text>
        </Pressable>
        {update.downloadUrl ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Download APK"
            onPress={() => {
              void Linking.openURL(update.downloadUrl!)
            }}
            style={[styles.secondary, { borderColor: theme.colors.borderSubtle }]}
          >
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Download APK</Text>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.dismiss}>
            <Text style={{ color: theme.colors.textSecondary }}>Later</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  primary: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismiss: {
    minHeight: 40,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
})
