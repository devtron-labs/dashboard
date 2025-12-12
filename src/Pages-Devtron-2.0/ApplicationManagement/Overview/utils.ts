import moment from 'moment'

import { isNullOrUndefined } from '@devtron-labs/devtron-fe-common-lib'

import { TIME_WINDOW } from '@PagesDevtron2.0/Shared/types'

import {
    BuildDeploymentActivityDetailedDTO,
    BuildDeploymentTriggerTrend,
    BuildDeployOverviewActivityKind,
    DoraMetricAverage,
    MetricValueDTO,
} from './types'

export const getValueStringFromMetricItem = (item: MetricValueDTO): string => {
    const { total, percentage } = item ?? { total: 0, percentage: 0 }

    if (!isNullOrUndefined(percentage)) {
        const parsedPercentage = Number.parseFloat(percentage.toFixed(2))
        return `${parsedPercentage.toLocaleString()}%`
    }

    if (!isNullOrUndefined(total)) {
        return `${total.toLocaleString()}`
    }

    return ''
}

export const parseMinutesInDayHourUnit = (minutes: number): string => {
    if (minutes === 0) {
        return '0m'
    }

    if (minutes < 60) {
        const baseMins = Math.floor(minutes)
        const seconds = Math.floor((minutes - baseMins) * 60)
        const secondStr = seconds ? `${seconds}s` : ''
        return `${baseMins}m ${secondStr}`.trim()
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.floor(minutes % 60)

    if (hours > 24) {
        const days = Math.floor(hours / 24)
        const remainingHours = hours % 24
        const hourStr = remainingHours ? `${remainingHours}h` : ''
        return `${days}d ${hourStr}`.trim()
    }

    const minStr = remainingMinutes ? `${remainingMinutes}m` : ''
    return `${hours}h ${minStr}`.trim()
}

export const getValueStringForDoraMetric = (overallAverage: DoraMetricAverage): string => {
    const { value, unit } = overallAverage
    const parsedValue = value.toFixed(2)

    switch (unit) {
        case 'NUMBER':
            return parsedValue
        case 'MINUTES':
            return parseMinutesInDayHourUnit(value)
        case 'PERCENTAGE':
            return `${parsedValue}%`
        default:
            return `${parsedValue}`
    }
}

export const parseTimestampAccToWindow = (timestamp: string, timeWindow: TIME_WINDOW) => {
    const momentObj = moment(timestamp).local()
    let hour = null
    let date = null
    switch (timeWindow) {
        case TIME_WINDOW.TODAY:
            // Return hour (e.g. '14:00')
            hour = momentObj.format('HH:mm')
            return hour === '00:00' ? [hour, momentObj.format('dddd')] : hour
        case TIME_WINDOW.THIS_WEEK:
        case TIME_WINDOW.LAST_WEEK:
        case TIME_WINDOW.THIS_MONTH:
        case TIME_WINDOW.LAST_MONTH:
            // Return date (e.g. '5')
            // In case of 1st day of month return ['1', 'Sep']
            date = momentObj.format('D')
            return date === '1' ? [date, momentObj.format('MMM')] : date
        case TIME_WINDOW.THIS_QUARTER:
            // Return month (e.g. 'Sep')
            return momentObj.format('MMM')
        default:
            return timestamp
    }
}

export const getActivityKindTrendFromResult = (
    activityKind: BuildDeployOverviewActivityKind,
    data: BuildDeploymentActivityDetailedDTO,
): BuildDeploymentTriggerTrend[] => {
    switch (activityKind) {
        case BuildDeployOverviewActivityKind.BUILD_TRIGGER:
            return data?.buildTriggersTrend ?? []
        case BuildDeployOverviewActivityKind.DEPLOYMENT_TRIGGER:
            return data?.deploymentTriggersTrend ?? []
        case BuildDeployOverviewActivityKind.AVG_BUILD_TIME:
            return data?.avgBuildTimeTrend ?? []
        default:
            return []
    }
}
