import { Platform } from 'react-native'
import {
  MitiLargeWidget,
  MitiMediumWidget,
  MitiSmallWidget,
  buildWidgetSnapshot,
} from './widgetTasks'
import { getFestivalsForBsDay, getFestivalsForBsMonth } from '@/src/db/repositories/festivals'
import { getWidgetState } from '@/src/db/repositories/widgetState'
import { canUseAndroidWidgets } from './widgetNative'

export async function refreshWidgets() {
  if (Platform.OS !== 'android' || !canUseAndroidWidgets()) {
    return
  }

  try {
    const { requestWidgetUpdate } = await import('react-native-android-widget')

    const state = await getWidgetState()
    const base = buildWidgetSnapshot({
      visibleYear: state?.visibleBsYear,
      visibleMonth: state?.visibleBsMonth,
      selected:
        state?.selectedBsYear && state.selectedBsMonth && state.selectedBsDay
          ? {
              year: state.selectedBsYear,
              month: state.selectedBsMonth,
              day: state.selectedBsDay,
            }
          : undefined,
    })
    const festivals = await getFestivalsForBsMonth(base.visibleYear, base.visibleMonth)
    const dayFestivals = await getFestivalsForBsDay(
      base.selected.year,
      base.selected.month,
      base.selected.day,
    )
    const snapshot = buildWidgetSnapshot({
      visibleYear: base.visibleYear,
      visibleMonth: base.visibleMonth,
      selected: base.selected,
      festivalTitle: dayFestivals[0]?.titleNp ?? dayFestivals[0]?.titleEn ?? undefined,
      festivalDays: festivals.map(
        (f) =>
          `${f.bsYear}-${String(f.bsMonth).padStart(2, '0')}-${String(f.bsDay).padStart(2, '0')}`,
      ),
    })

    await Promise.all([
      requestWidgetUpdate({
        widgetName: 'MitiSmall',
        renderWidget: () => <MitiSmallWidget snapshot={snapshot} />,
      }),
      requestWidgetUpdate({
        widgetName: 'MitiMedium',
        renderWidget: () => <MitiMediumWidget snapshot={snapshot} />,
      }),
      requestWidgetUpdate({
        widgetName: 'MitiLarge',
        renderWidget: () => <MitiLargeWidget snapshot={snapshot} />,
      }),
    ])
  } catch (error) {
    // Never block the app when widgets are unavailable (Expo Go / missing prebuild).
    console.warn('[miti] refreshWidgets skipped:', error)
  }
}
