import { useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NP,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
} from '@/src/domain/calendar'
import { useTheme } from '@/src/theme/ThemeProvider'
import { formatNumber, type NumeralSystem } from '@/src/utils/numerals'

type Props = {
  bsYear: number
  bsMonth: number
  adLabel: string
  numeralSystem: NumeralSystem
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSelectMonth: (year: number, month: number) => void
}

type PickerKind = 'year' | 'month' | null

export function CalendarHeader({
  bsYear,
  bsMonth,
  adLabel,
  numeralSystem,
  onPrev,
  onNext,
  onToday,
  onSelectMonth,
}: Props) {
  const theme = useTheme()
  const [picker, setPicker] = useState<PickerKind>(null)

  const monthNp = BS_MONTH_NAMES_NP[bsMonth - 1] ?? ''
  const monthEn = BS_MONTH_NAMES_EN[bsMonth - 1] ?? ''

  const years = useMemo(() => {
    const list: number[] = []
    for (let y = MAX_BS_YEAR; y >= MIN_BS_YEAR; y -= 1) list.push(y)
    return list
  }, [])

  const months = useMemo(
    () =>
      BS_MONTH_NAMES_NP.map((nameNp, index) => ({
        month: index + 1,
        nameNp,
        nameEn: BS_MONTH_NAMES_EN[index] ?? '',
      })),
    [],
  )

  return (
    <View style={styles.wrap}>
      <View style={styles.selectRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Select month, currently ${monthEn}`}
          onPress={() => setPicker('month')}
          style={[
            styles.selectBtn,
            {
              backgroundColor: theme.colors.bgSurface,
              borderColor: theme.colors.borderSubtle,
            },
          ]}
        >
          <Text style={[theme.typography.titleBs, { color: theme.colors.textBsDominant }]}>
            {monthNp}
          </Text>
          <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>▾</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Select year, currently ${bsYear}`}
          onPress={() => setPicker('year')}
          style={[
            styles.selectBtn,
            {
              backgroundColor: theme.colors.bgSurface,
              borderColor: theme.colors.borderSubtle,
            },
          ]}
        >
          <Text style={[theme.typography.titleBs, { color: theme.colors.textBsDominant }]}>
            {formatNumber(bsYear, numeralSystem)}
          </Text>
          <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>▾</Text>
        </Pressable>
      </View>

      <Text style={[theme.typography.subtitleAd, { color: theme.colors.textSecondary }]}>
        {monthEn} · {adLabel}
      </Text>

      <View style={styles.navRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={onPrev}
          style={[styles.navBtn, { backgroundColor: theme.colors.bgMuted }]}
        >
          <Text style={{ color: theme.colors.textPrimary, fontSize: 20 }}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to today"
          onPress={onToday}
          style={[styles.todayBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Today</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={onNext}
          style={[styles.navBtn, { backgroundColor: theme.colors.bgMuted }]}
        >
          <Text style={{ color: theme.colors.textPrimary, fontSize: 20 }}>›</Text>
        </Pressable>
      </View>

      <Modal
        visible={picker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPicker(null)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}
          onPress={() => setPicker(null)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.colors.bgSurface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={[
                theme.typography.subtitleAd,
                { color: theme.colors.textPrimary, marginBottom: 8, fontWeight: '700' },
              ]}
            >
              {picker === 'year' ? 'Select year' : 'Select month'}
            </Text>

            {picker === 'year' ? (
              <FlatList
                data={years}
                keyExtractor={(item) => String(item)}
                style={styles.list}
                initialScrollIndex={Math.max(0, MAX_BS_YEAR - bsYear)}
                getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
                renderItem={({ item }) => {
                  const selected = item === bsYear
                  return (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setPicker(null)
                        onSelectMonth(item, bsMonth)
                      }}
                      style={[
                        styles.option,
                        selected && { backgroundColor: theme.colors.bgMuted },
                      ]}
                    >
                      <Text
                        style={{
                          color: selected ? theme.colors.primary : theme.colors.textPrimary,
                          fontWeight: selected ? '700' : '500',
                          fontSize: 18,
                        }}
                      >
                        {formatNumber(item, numeralSystem)}
                      </Text>
                    </Pressable>
                  )
                }}
              />
            ) : (
              <FlatList
                data={months}
                keyExtractor={(item) => String(item.month)}
                style={styles.list}
                renderItem={({ item }) => {
                  const selected = item.month === bsMonth
                  return (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setPicker(null)
                        onSelectMonth(bsYear, item.month)
                      }}
                      style={[
                        styles.option,
                        selected && { backgroundColor: theme.colors.bgMuted },
                      ]}
                    >
                      <Text
                        style={{
                          color: selected ? theme.colors.primary : theme.colors.textPrimary,
                          fontWeight: selected ? '700' : '500',
                          fontSize: 17,
                        }}
                      >
                        {item.nameNp}
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                        {item.nameEn}
                      </Text>
                    </Pressable>
                  )
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chevron: {
    fontSize: 14,
    marginTop: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBtn: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    maxHeight: '70%',
    borderRadius: 16,
    padding: 16,
  },
  list: {
    maxHeight: 360,
  },
  option: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    gap: 2,
  },
})
