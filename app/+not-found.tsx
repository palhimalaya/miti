import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useRouter } from 'expo-router'

/** Safety net — never leave the user on a dead-end screen. */
export default function NotFoundScreen() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/(tabs)')
  }, [router])

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF8EC',
      }}
    >
      <ActivityIndicator color="#9B1C31" />
    </View>
  )
}
