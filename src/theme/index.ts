import { colorsFor, type ColorTokens, type ThemeMode } from './colors'
import { elevation, radii, space } from './spacing'
import { typography } from './typography'

export type AppTheme = {
  mode: ThemeMode
  colors: ColorTokens
  space: typeof space
  radii: typeof radii
  elevation: typeof elevation
  typography: typeof typography
}

export function createTheme(mode: ThemeMode): AppTheme {
  return {
    mode,
    colors: colorsFor(mode),
    space,
    radii,
    elevation,
    typography,
  }
}

export { colorsFor, lightColors, darkColors, palette } from './colors'
export { space, radii, elevation } from './spacing'
export { typography } from './typography'
export type { ThemeMode, ColorTokens } from './colors'
