import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { useTheme } from '@/src/theme/ThemeProvider'

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const theme = useTheme()
  return (
    <Text style={{ color: focused ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12 }}>
      {label}
    </Text>
  )
}

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bgCanvas },
        headerTintColor: theme.colors.textPrimary,
        tabBarStyle: {
          backgroundColor: theme.colors.bgSurface,
          borderTopColor: theme.colors.borderSubtle,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon label="मिति" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon label="◎" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
