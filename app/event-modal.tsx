import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/src/theme/ThemeProvider'
import { createEvent, type EventType } from '@/src/db/repositories/events'
import { useCalendarStore } from '@/src/stores/calendarStore'
import { scheduleLocalReminders } from '@/src/services/notifications'
import { refreshWidgets } from '@/src/features/widget/refreshWidgets'

const TYPES: EventType[] = ['personal', 'reminder', 'birthday', 'anniversary', 'appointment']

export default function EventModal() {
  const theme = useTheme()
  const router = useRouter()
  const selected = useCalendarStore((s) => s.selected)
  const refreshDayDetails = useCalendarStore((s) => s.refreshDayDetails)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [type, setType] = useState<EventType>('personal')
  const [error, setError] = useState<string | null>(null)

  const onSave = async () => {
    if (!selected) {
      setError('Select a calendar day first')
      return
    }
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    try {
      await createEvent({
        title,
        notes,
        type,
        calendarBasis: 'bs',
        bs: selected.bs,
      })
      await refreshDayDetails()
      await scheduleLocalReminders()
      await refreshWidgets()
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    }
  }

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.bgCanvas }]}>
      <Text style={[theme.typography.titleBs, { color: theme.colors.textPrimary }]}>Add event</Text>
      {selected ? (
        <Text style={[theme.typography.subtitleAd, { color: theme.colors.textSecondary }]}>
          {selected.bs.day} {selected.bs.monthNameNp} {selected.bs.year}
        </Text>
      ) : null}

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={theme.colors.textAdSecondary}
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            borderColor: theme.colors.borderSubtle,
            backgroundColor: theme.colors.bgSurface,
          },
        ]}
      />
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes (optional)"
        placeholderTextColor={theme.colors.textAdSecondary}
        multiline
        style={[
          styles.input,
          styles.notes,
          {
            color: theme.colors.textPrimary,
            borderColor: theme.colors.borderSubtle,
            backgroundColor: theme.colors.bgSurface,
          },
        ]}
      />

      <View style={styles.types}>
        {TYPES.map((value) => (
          <Pressable
            key={value}
            onPress={() => setType(value)}
            style={[
              styles.typeChip,
              {
                backgroundColor: type === value ? theme.colors.primary : theme.colors.bgMuted,
              },
            ]}
          >
            <Text style={{ color: type === value ? theme.colors.primaryText : theme.colors.textPrimary }}>
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}

      <Pressable
        onPress={() => {
          void onSave()
        }}
        style={[styles.save, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Save</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  notes: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  save: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
})
