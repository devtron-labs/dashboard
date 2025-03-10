import { AppThemeType, UserPreferencesType, useTheme } from '@devtron-labs/devtron-fe-common-lib'

type ThemePreferenceType = ReturnType<typeof useTheme>['themePreference']

export interface SwitchThemeDialogProps extends Pick<ReturnType<typeof useTheme>, 'handleThemePreferenceChange'> {
    /**
     * @description The initial theme preference of the user fetched from api, in case of error would be null
     */
    initialThemePreference: ThemePreferenceType
    handleClose: (updatedThemePreference: ThemePreferenceType) => void
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
