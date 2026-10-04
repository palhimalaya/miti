import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { createTheme, type AppTheme, type ThemeMode } from './index'
import { useSettingsStore } from '@/src/stores/settingsStore'

const ThemeContext = createContext<AppTheme>(createTheme('light'))

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme()
  const themeSetting = useSettingsStore((s) => s.theme)

  const mode: ThemeMode =
    themeSetting === 'system' ? (system === 'dark' ? 'dark' : 'light') : themeSetting

  const theme = useMemo(() => createTheme(mode), [mode])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
