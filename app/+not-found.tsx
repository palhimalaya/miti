import { Link, Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen not found</Text>
        <Link href="/" style={styles.link}>
          Go to calendar
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF8EC',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#252525',
  },
  link: {
    marginTop: 16,
    color: '#9B1C31',
    fontWeight: '600',
  },
})
