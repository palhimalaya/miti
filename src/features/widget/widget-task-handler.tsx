import React from 'react'
import type { WidgetTaskHandlerProps } from 'react-native-android-widget'
import {
  MitiLargeWidget,
  MitiMediumWidget,
  MitiSmallWidget,
  buildWidgetSnapshot,
  clampSelectedToVisibleMonth,
  shiftMonth,
} from './widgetTasks'
import { getFestivalsForBsDay, getFestivalsForBsMonth } from '@/src/db/repositories/festivals'
import { getWidgetState, saveWidgetState } from '@/src/db/repositories/widgetState'
import { migrateDatabase } from '@/src/db/migrate'
import { seedDatabase } from '@/src/db/seed'

async function loadSnapshot() {
  migrateDatabase()
  await seedDatabase()
  const state = await getWidgetState()
  const fallback = buildWidgetSnapshot()
  const visibleYear = state?.visibleBsYear ?? fallback.visibleYear
  const visibleMonth = state?.visibleBsMonth ?? fallback.visibleMonth
  const selectedRaw =
    state?.selectedBsYear && state.selectedBsMonth && state.selectedBsDay
      ? {
          year: state.selectedBsYear,
          month: state.selectedBsMonth,
          day: state.selectedBsDay,
        }
      : fallback.selected

  const selected = clampSelectedToVisibleMonth(selectedRaw, visibleYear, visibleMonth)
  const festivals = await getFestivalsForBsMonth(visibleYear, visibleMonth)
  const dayFestivals = await getFestivalsForBsDay(selected.year, selected.month, selected.day)

  return buildWidgetSnapshot({
    visibleYear,
    visibleMonth,
    selected,
    festivalTitle: dayFestivals[0]?.titleNp ?? dayFestivals[0]?.titleEn ?? undefined,
    festivalDays: festivals.map(
      (f) =>
        `${f.bsYear}-${String(f.bsMonth).padStart(2, '0')}-${String(f.bsDay).padStart(2, '0')}`,
    ),
  })
}

function renderWidget(widgetName: string, snapshot: Awaited<ReturnType<typeof loadSnapshot>>) {
  if (widgetName === 'MitiSmall') return <MitiSmallWidget snapshot={snapshot} />
  if (widgetName === 'MitiLarge') return <MitiLargeWidget snapshot={snapshot} />
  return <MitiMediumWidget snapshot={snapshot} />
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetName = props.widgetInfo.widgetName
  let snapshot = await loadSnapshot()

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(renderWidget(widgetName, snapshot))
      break
    case 'WIDGET_DELETED':
      break
    case 'WIDGET_CLICK': {
      if (props.clickAction === 'PREV_MONTH' || props.clickAction === 'NEXT_MONTH') {
        const delta = props.clickAction === 'PREV_MONTH' ? -1 : 1
        const next = shiftMonth(snapshot.visibleYear, snapshot.visibleMonth, delta)
        const selected = clampSelectedToVisibleMonth(snapshot.selected, next.year, next.month)
        await saveWidgetState({
          visibleBsYear: next.year,
          visibleBsMonth: next.month,
          selected,
        })
      } else if (props.clickAction === 'SELECT_DATE') {
        const data = props.clickActionData as {
          year?: number
          month?: number
          day?: number
        }
        if (data.year && data.month && data.day) {
          await saveWidgetState({
            visibleBsYear: data.month === snapshot.visibleMonth ? snapshot.visibleYear : data.year,
            visibleBsMonth: data.month,
            selected: { year: data.year, month: data.month, day: data.day },
          })
        }
      }
      snapshot = await loadSnapshot()
      props.renderWidget(renderWidget(widgetName, snapshot))
      break
    }
    default:
      break
  }
}
