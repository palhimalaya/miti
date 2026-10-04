import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from 'expo-router/react-navigation'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import 'react-native-reanimated'
import * as Linking from 'expo-linking'

import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider'
import { bootstrapApp } from '@/src/services/bootstrap'
import { useCalendarStore } from '@/src/stores/calendarStore'
import { getDay } from '@/src/domain/calendar'

export { ErrorBoundary } from 'expo-router'

function RootNavigator() {
  const theme = useTheme()
  const router = useRouter()
  const selectDay = useCalendarStore((s) => s.selectDay)

  useEffect(() => {
    const handleUrl = async (url: string) => {
      const parsed = Linking.parse(url)
      const bs = typeof parsed.queryParams?.bs === 'string' ? parsed.queryParams.bs : null
      if (!bs) return
      const [year, month, day] = bs.split('-').map(Number)
      if (!year || !month || !day) return
      const calendarDay = getDay({ year, month, day })
      if (!calendarDay.ok) return
      await selectDay(calendarDay.value)
      router.push('/(tabs)')
    }

    Linking.getInitialURL().then((url) => {
      if (url) void handleUrl(url)
    })
    const sub = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url)
    })
    return () => sub.remove()
  }, [router, selectDay])

  return (
    <NavThemeProvider
      value={
        theme.mode === 'dark'
          ? {
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                background: theme.colors.bgCanvas,
                card: theme.colors.bgSurface,
                text: theme.colors.textPrimary,
                primary: theme.colors.primary,
                border: theme.colors.borderSubtle,
              },
            }
          : {
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: theme.colors.bgCanvas,
                card: theme.colors.bgSurface,
                text: theme.colors.textPrimary,
                primary: theme.colors.primary,
                border: theme.colors.borderSubtle,
              },
            }
      }
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="event-modal"
          options={{ presentation: 'modal', title: 'Add event' }}
        />
      </Stack>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  )
}

export default function RootLayout() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    bootstrapApp()
      .then(() => setReady(true))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to start')
        setReady(true)
      })
  }, [])

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8EC' }}>
        <ActivityIndicator color="#9B1C31" />
      </View>
    )
  }

  return (
    <ThemeProvider>
      {error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          {/* Error is rare; calendar still mounts with defaults if possible */}
        </View>
      ) : null}
      <RootNavigator />
    </ThemeProvider>
  )
}
