import moment from 'moment'

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

export const formatDurationFromNow = (timestamp: string | number | Date): string => {
    if (!timestamp) {
        return ''
    }
    const now = moment()
    const then = moment(timestamp)
    const duration = moment.duration(now.diff(then))

    const units = [
        { label: 'd', value: duration.days() },
        { label: 'h', value: duration.hours() },
        { label: 'm', value: duration.minutes() },
        { label: 's', value: duration.seconds() },
    ]

    // Filter out zero values and take the first two non-zero units
    const nonZeroUnits = units.filter((unit) => unit.value > 0).slice(0, 2)

    // If all units are zero, show "0s"
    if (nonZeroUnits.length === 0) {
        return '0s'
    }

    return nonZeroUnits.map((unit) => `${unit.value}${unit.label}`).join(' ')
}
