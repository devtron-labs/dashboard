import { AppThemeType, getAppThemeForAutoPreference } from '@devtron-labs/devtron-fe-common-lib'
import { ThemePreferenceOptionProps } from './types'

export const getThemePreferenceText = (themePreference: ThemePreferenceOptionProps['value']): string => {
    switch (themePreference) {
        case 'auto':
            return `System (${getAppThemeForAutoPreference() === AppThemeType.dark ? 'Dark' : 'Light'})`
        case AppThemeType.dark:
            return 'Dark'
        case AppThemeType.light:
            return 'Light'
        default:
            return null
    }
}
