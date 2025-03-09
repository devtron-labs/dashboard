import { AppThemeType, UserPreferencesType, useTheme } from '@devtron-labs/devtron-fe-common-lib'

export interface SwitchThemeDialogProps {
    initialThemePreference: ReturnType<typeof useTheme>['themePreference']
    handleClose: () => void
    currentUserPreferences: UserPreferencesType
}

export interface ThemePreferenceOptionProps {
    selectedThemePreference: SwitchThemeDialogProps['initialThemePreference']
    value: SwitchThemeDialogProps['initialThemePreference']
    handleChangedThemePreference: (themePreference: SwitchThemeDialogProps['initialThemePreference']) => void
}

export interface ThemePreferenceLabelFigureProps extends Pick<ThemePreferenceOptionProps, 'value'> {
    isSelected: boolean
}

export interface BaseLabelFigureProps extends Pick<ThemePreferenceLabelFigureProps, 'isSelected'> {
    value: AppThemeType
    /**
     * @default false
     */
    noLeftRadius?: boolean
}
