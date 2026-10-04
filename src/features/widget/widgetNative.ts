import { NativeModules, Platform } from 'react-native'
import Constants from 'expo-constants'

/** True when running inside Expo Go (no custom native modules). */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo'
}

/** True when Android widget native module is actually linked. */
export function canUseAndroidWidgets(): boolean {
  if (Platform.OS !== 'android') return false
  if (isExpoGo()) return false
  return Boolean(
    NativeModules.AndroidWidget ||
      NativeModules.RNAndroidWidget ||
      NativeModules.ReactNativeAndroidWidget,
  )
}
