import 'expo-router/entry'
import Constants from 'expo-constants'

// Custom native widgets are unavailable in Expo Go — skip registration there.
if (Constants.appOwnership !== 'expo') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget')
    const { widgetTaskHandler } = require('./src/features/widget/widget-task-handler')
    registerWidgetTaskHandler(widgetTaskHandler)
  } catch (error) {
    console.warn('[miti] Android widget handler not registered:', error)
  }
}
