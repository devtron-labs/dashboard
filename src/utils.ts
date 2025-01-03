import { THEME_STORAGE_KEY, ThemeType } from './constants'

export const getCurrentTheme = (): ThemeType => {
    const theme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType

    return Object.values(ThemeType).includes(theme as ThemeType) ? theme : ThemeType.light
}

export const updateTheme = (theme: ThemeType) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
}
