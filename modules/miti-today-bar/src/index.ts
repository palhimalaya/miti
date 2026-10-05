import { Platform } from 'react-native'

type MitiTodayBarNative = {
  show(day: number, title: string, body: string): Promise<void>
  hide(): Promise<void>
}

function getNative(): MitiTodayBarNative | null {
  if (Platform.OS !== 'android') return null
  try {
    // Lazy require so Expo Go / web do not crash at import time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireNativeModule } = require('expo-modules-core') as {
      requireNativeModule: <T>(name: string) => T
    }
    return requireNativeModule<MitiTodayBarNative>('MitiTodayBar')
  } catch {
    return null
  }
}

export async function showMitiTodayBar(day: number, title: string, body: string): Promise<void> {
  const native = getNative()
  if (!native) return
  await native.show(day, title, body)
}

export async function hideMitiTodayBar(): Promise<void> {
  const native = getNative()
  if (!native) return
  await native.hide()
}
