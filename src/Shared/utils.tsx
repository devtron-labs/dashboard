import { AppType } from '@devtron-labs/devtron-fe-common-lib'

const getAppTypeCategory = (appType: AppType) => {
    switch (appType) {
        case AppType.DEVTRON_APP:
            return 'DA'
        case AppType.DEVTRON_HELM_CHART:
        case AppType.EXTERNAL_HELM_CHART:
            return 'HA'
        case AppType.EXTERNAL_ARGO_APP:
            return 'ACD'
        case AppType.EXTERNAL_FLUX_APP:
            return 'FCD'
        default:
            return 'DA'
    }
}

export const getAIAnalyticsEvents = (context: string, appType?: AppType) =>
    `AI_${appType ? `${getAppTypeCategory(appType)}_` : ''}${context}`
