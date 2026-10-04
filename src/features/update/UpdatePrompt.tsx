import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  checkForAppUpdate,
  dismissUpdateVersion,
  getDismissedUpdateVersion,
  type AppUpdateInfo,
} from '@/src/services/appUpdate'
import { UpdateAvailableCard } from './UpdateAvailableCard'

/** Soft startup prompt — never blocks calendar if offline. */
export function UpdatePrompt() {
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const info = await checkForAppUpdate()
      if (cancelled || !info.available) return
      const dismissed = await getDismissedUpdateVersion()
      if (dismissed === info.latestVersion) return
      setUpdate(info)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!update) return null

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <UpdateAvailableCard
        update={update}
        onDismiss={() => {
          void dismissUpdateVersion(update.latestVersion).then(() => setUpdate(null))
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    zIndex: 50,
  },
})
