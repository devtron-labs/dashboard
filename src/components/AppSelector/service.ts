import {
    BaseAppMetaData,
    getUserPreferences,
    ResourceKindType,
    UserPreferenceResourceActions,
    showError,
    updateUserPreferences,
} from '@devtron-labs/devtron-fe-common-lib'

export const fetchRecentlyVisitedDevtronApps = async (
    appId: number,
    appName: string,
    isInvalidAppId: boolean = false,
): Promise<BaseAppMetaData[]> => {
    try {
        const response = await getUserPreferences()
        const recentApps =
            response?.resources?.[ResourceKindType.devtronApplication]?.[
                UserPreferenceResourceActions.RECENTLY_VISITED
            ] || []

        // Ensure all items have valid `appId` and `appName`
        const validApps = recentApps.filter((app) => app?.appId && app?.appName)

        // Combine current app with previous list
        const combinedList = [{ appId, appName }, ...validApps]

        // Filter out invalid app and limit to 6
        // Ensure unique entries using a Set
        const uniqueApps = Array.from(new Map(combinedList.map((app) => [app.appId, app])).values()).slice(0, 6)
        const uniqueFilteredApps = isInvalidAppId ? uniqueApps.filter((app) => app.appId !== Number(appId)) : uniqueApps
        await updateUserPreferences(null, uniqueFilteredApps)
        return uniqueFilteredApps
    } catch (error) {
        showError(error)
        return []
    }
}
