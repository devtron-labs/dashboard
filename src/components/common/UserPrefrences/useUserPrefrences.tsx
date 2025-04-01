import {
    UserPreferencesType,
    ServerErrors,
    getUserPreferences,
    useTheme,
    ViewIsPipelineRBACConfiguredRadioTabs,
} from '@devtron-labs/devtron-fe-common-lib'
import { useState } from 'react'
import { importComponentFromFELibrary } from '../helpers/Helpers'

const migrateUserPreferences: (userPreferences: UserPreferencesType) => Promise<UserPreferencesType> =
    importComponentFromFELibrary('migrateUserPreferences', null, 'function')

export const useUserPreferences = () => {
    const [userPreferences, setUserPreferences] = useState<UserPreferencesType>(null)
    const [userPreferencesError, setUserPreferencesError] = useState<ServerErrors>(null)

    const { handleThemeSwitcherDialogVisibilityChange, handleThemePreferenceChange } = useTheme()

    const handleInitializeUserPreferencesFromResponse = (userPreferencesResponse: UserPreferencesType) => {
        if (!userPreferencesResponse?.themePreference) {
            handleThemeSwitcherDialogVisibilityChange(true)
        } else if (userPreferencesResponse?.themePreference) {
            handleThemePreferenceChange(userPreferencesResponse?.themePreference)
        }
        setUserPreferences(userPreferencesResponse)
    }

    const handleFetchUserPreferences = async () => {
        try {
            setUserPreferencesError(null)
            const userPreferencesResponse = await getUserPreferences()
            if (migrateUserPreferences) {
                const migratedUserPreferences = await migrateUserPreferences(userPreferencesResponse)
                handleInitializeUserPreferencesFromResponse(migratedUserPreferences)
            } else {
                handleInitializeUserPreferencesFromResponse(userPreferencesResponse)
            }
        } catch (error) {
            setUserPreferencesError(error)
        }
    }

    // To handle in case through browser prompt user cancelled the refresh
    const handleUpdatePipelineRBACViewSelectedTab = (selectedTab: ViewIsPipelineRBACConfiguredRadioTabs) => {
        setUserPreferences(() => ({
            // ...prev,
            pipelineRBACViewSelectedTab: selectedTab,
        }))
    }

    const handleUpdateUserThemePreference = (themePreference: UserPreferencesType['themePreference']) => {
        setUserPreferences(() => ({
            // ...prev,
            themePreference,
        }))
    }

    return {
        userPreferences,
        userPreferencesError,
        handleFetchUserPreferences,
        handleUpdatePipelineRBACViewSelectedTab,
        handleUpdateUserThemePreference,
    }
}
