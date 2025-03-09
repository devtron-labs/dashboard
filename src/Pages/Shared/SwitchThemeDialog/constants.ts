import { AppThemeType } from '@devtron-labs/devtron-fe-common-lib'
import { ThemePreferenceOptionProps } from './types'

export const THEME_LABEL_TEXT = 'Aa'
export const THEME_PREFERENCE_TEXT_MAP: Record<ThemePreferenceOptionProps['value'], string> = {
    auto: 'System (Dark)',
    [AppThemeType.light]: 'Light',
    [AppThemeType.dark]: 'Dark',
}
