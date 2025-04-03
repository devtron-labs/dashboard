import {
    UserPreferencesType,
    ServerErrors,
    getUserPreferences,
    useTheme,
    ViewIsPipelineRBACConfiguredRadioTabs,
    ResourceKindType,
    UserPreferenceResourceActions,
} from '@devtron-labs/devtron-fe-common-lib'
import { useState } from 'react'
import { importComponentFromFELibrary } from '../helpers/Helpers'

const migrateUserPreferences: (userPreferences: UserPreferencesType) => Promise<UserPreferencesType> =
    importComponentFromFELibrary('migrateUserPreferences', null, 'function')

export const useUserPreferences = () => {
    const [userPreferences, setUserPreferences] = useState<UserPreferencesType>(null)
    const [userPreferencesError, setUserPreferencesError] = useState<ServerErrors>(null)

    const { handleThemeSwitcherDialogVisibilityChange, handleThemePreferenceChange } = useTheme()

    const fetchRecentlyVisitedParsedApps = async (appId: number, appName: string, isInvalidAppId: boolean = false) => {
        const userPreferencesResponse = await getUserPreferences()
        const _recentApps =
            userPreferencesResponse?.resources?.[ResourceKindType.devtronApplication]?.[
                UserPreferenceResourceActions.RECENTLY_VISITED
            ] || []

        // Ensure all items have valid `appId` and `appName`
        const validApps = _recentApps.filter((app) => app?.appId && app?.appName)

        // Combine current app with previous list
        const combinedList = [{ appId, appName }, ...validApps]

        // Filter out invalid app and limit to 6 &&  Ensure unique entries using a Set
        const uniqueApps = Array.from(new Map(combinedList.map((app) => [app.appId, app])).values()).slice(0, 6)
        const uniqueFilteredApps = isInvalidAppId ? uniqueApps.filter((app) => app.appId !== Number(appId)) : uniqueApps
        setUserPreferences((prev) => ({
            ...prev,
            resources: {
                ...prev?.resources,
                [ResourceKindType.devtronApplication]: {
                    ...prev?.resources?.[ResourceKindType.devtronApplication],
                    [UserPreferenceResourceActions.RECENTLY_VISITED]: uniqueFilteredApps,
                },
            },
        }))
    }

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
        setUserPreferences((prev) => ({
            ...prev,
            pipelineRBACViewSelectedTab: selectedTab,
        }))
    }

    const handleUpdateUserThemePreference = (themePreference: UserPreferencesType['themePreference']) => {
        setUserPreferences((prev) => ({
            ...prev,
            themePreference,
        }))
    }

    return {
        userPreferences,
        userPreferencesError,
        handleFetchUserPreferences,
        handleUpdatePipelineRBACViewSelectedTab,
        handleUpdateUserThemePreference,
        fetchRecentlyVisitedParsedApps,
    }
}
