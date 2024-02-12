import { AppListConstants, URLS } from '../../../config'

export const buildDevtronAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}`
}

export const buildHelmAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`
}

export const buildArgoAppListUrl = (): string => {
    return `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_ARGO}`
}

export const getCurrentTabName = (appType: string, isExternalArgo: boolean): string => {
    if (appType === AppListConstants.AppType.DEVTRON_APPS) {
        return AppListConstants.AppTabs.DEVTRON_APPS
    } else if (isExternalArgo) {
        return AppListConstants.AppTabs.ARGO_APPS
    } else {
        return AppListConstants.AppTabs.HELM_APPS
    }
}

export const getChangeAppTabURL = (appTabType) => {
    if (appTabType === AppListConstants.AppTabs.DEVTRON_APPS) {
        return buildDevtronAppListUrl()
    } else if (appTabType === AppListConstants.AppTabs.ARGO_APPS) {
        return buildArgoAppListUrl()
    } else {
        return buildHelmAppListUrl()
    }
}
