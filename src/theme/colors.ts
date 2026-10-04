export const palette = {
  deepRed: '#9B1C31',
  vermilion: '#C73E1D',
  warmGold: '#D4A84F',
  cream: '#FFF8EC',
  charcoal: '#252525',
  mutedGreen: '#557A5A',
  white: '#FFFFFF',
  black: '#000000',
} as const

export type ThemeMode = 'light' | 'dark'

export type ColorTokens = {
  bgCanvas: string
  bgSurface: string
  bgMuted: string
  textPrimary: string
  textSecondary: string
  textBsDominant: string
  textAdSecondary: string
  borderSubtle: string
  primary: string
  primaryText: string
  festive: string
  today: string
  selected: string
  selectedText: string
  danger: string
  success: string
  overlay: string
}

export const lightColors: ColorTokens = {
  bgCanvas: palette.cream,
  bgSurface: '#FFFDF8',
  bgMuted: '#F3EADF',
  textPrimary: palette.charcoal,
  textSecondary: '#5C5C5C',
  textBsDominant: palette.charcoal,
  textAdSecondary: '#6B6B6B',
  borderSubtle: '#E5D9C8',
  primary: palette.deepRed,
  primaryText: palette.white,
  festive: palette.warmGold,
  today: palette.mutedGreen,
  selected: palette.deepRed,
  selectedText: palette.white,
  danger: '#B42318',
  success: palette.mutedGreen,
  overlay: 'rgba(37, 37, 37, 0.45)',
}

export const darkColors: ColorTokens = {
  bgCanvas: '#1A1614',
  bgSurface: '#242019',
  bgMuted: '#2E2820',
  textPrimary: '#F7F1E6',
  textSecondary: '#B8AFA0',
  textBsDominant: '#FFF8EC',
  textAdSecondary: '#A89F90',
  borderSubtle: '#3A3228',
  primary: '#C73E1D',
  primaryText: '#FFF8EC',
  festive: '#D4A84F',
  today: '#6F9473',
  selected: '#C73E1D',
  selectedText: '#FFF8EC',
  danger: '#F97066',
  success: '#6F9473',
  overlay: 'rgba(0, 0, 0, 0.55)',
}

export function colorsFor(mode: ThemeMode): ColorTokens {
  return mode === 'dark' ? darkColors : lightColors
}
